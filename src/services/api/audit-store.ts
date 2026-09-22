import * as FileSystem from 'expo-file-system/legacy';
import type { Alert, Audit, DescubrimientoItem, Finding, IAuditStore, TestBattery } from './types';
import type { AttackSession } from './injection-types';
import {
  AUDIT_STATUSES,
  AUDIT_SIMULATION_STEPS,
} from '../../constants/audit.constants';
import { STORAGE_FILENAMES, STORAGE_LIMITS } from '../../constants/storage.constants';
import { API_POLL_INTERVALS_MS } from '../../constants/api.constants';
import { STORAGE_ERROR_CODES, StorageError } from '../../errors/storage-error';

const STORAGE_FILE = `${FileSystem.documentDirectory || ''}${STORAGE_FILENAMES.AUDITS_STORE}`;

const SIMULATION_CONFIGS = [
  AUDIT_SIMULATION_STEPS.BATTERY_1,
  AUDIT_SIMULATION_STEPS.BATTERY_2,
  AUDIT_SIMULATION_STEPS.BATTERY_3,
] as const;

/**
 * Maps a discovery-scan status (backend_genvulnai `EstadoEscaneo`) onto the
 * local `AuditStatus` used by the UI (running/completed/paused/queued/failed).
 */
function auditStatusFromScanStatus(scanStatus: DescubrimientoItem['status']): Audit['status'] {
  switch (scanStatus) {
    case 'completado':
      return AUDIT_STATUSES.COMPLETED;
    case 'fallido':
      return AUDIT_STATUSES.FAILED;
    default:
      return AUDIT_STATUSES.RUNNING;
  }
}

/**
 * Local Audit Store with offline disk persistence (expo-file-system).
 *
 * Audits are discovered passively from the injection backend
 * (`upsertFromRemoteScan`/`upsertFromRemoteAttack`, driven by
 * `useSyncRemoteAudits`) — this app never creates a scan or attack session
 * itself. `createAudit` is kept for API completeness but is not called from
 * any screen.
 */
class AuditStore implements IAuditStore {
  private audits: Audit[] = [];
  private findings: Finding[] = [];
  private alerts: Alert[] = [];
  private isLoaded = false;
  private activeTimers: Map<string, ReturnType<typeof setInterval>> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private async loadFromDisk(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE);
      if (fileInfo.exists && !fileInfo.isDirectory) {
        const raw = await FileSystem.readAsStringAsync(STORAGE_FILE);
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.audits)) {
          this.audits = data.audits;
        }
        if (data && Array.isArray(data.findings)) {
          this.findings = data.findings;
        }
        if (data && Array.isArray(data.alerts)) {
          this.alerts = data.alerts;
        }
      }
    } catch (err) {
      const storageError = new StorageError(
        STORAGE_ERROR_CODES.STORAGE_READ_FAILED,
        'Failed to read audit store from persistent disk',
        { error: String(err) }
      );
      console.warn('[audit-store] Load from disk error:', storageError.message);
    } finally {
      this.isLoaded = true;
    }
  }

  private async saveToDisk(): Promise<void> {
    try {
      const data = {
        audits: this.audits,
        findings: this.findings,
        alerts: this.alerts,
      };
      await FileSystem.writeAsStringAsync(STORAGE_FILE, JSON.stringify(data));
    } catch (err) {
      const storageError = new StorageError(
        STORAGE_ERROR_CODES.STORAGE_WRITE_FAILED,
        'Failed to save audit store to persistent disk',
        { error: String(err) }
      );
      console.warn('[audit-store] Save to disk error:', storageError.message);
    }
  }

  public isReady(): boolean {
    return this.isLoaded;
  }

  public getAudits(): Audit[] {
    return this.audits;
  }

  public getAuditById(id: string): Audit | undefined {
    return this.audits.find((a) => a.id === id);
  }

  public getAuditByScanId(scanId: string): Audit | undefined {
    return this.audits.find((a) => a.scanId === scanId);
  }

  public getFindings(auditId: string): Finding[] {
    return this.findings.filter((f) => f.auditId === auditId);
  }

  public getFindingById(findingId: string): Finding | undefined {
    return this.findings.find((f) => f.id === findingId);
  }

  public addFinding(finding: Finding): void {
    this.findings = [finding, ...this.findings].slice(0, STORAGE_LIMITS.MAX_PERSISTENT_FINDINGS);
    this.saveToDisk();
  }

  public updateAudit(updated: Audit): void {
    const index = this.audits.findIndex((a) => a.id === updated.id);
    if (index !== -1) {
      this.audits[index] = updated;
      this.saveToDisk();
    }
  }

  public setAttackSession(auditId: string, attackSessionId: string): void {
    const audit = this.getAuditById(auditId);
    if (audit) {
      audit.attackSessionId = attackSessionId;
      this.saveToDisk();
    }
  }

  public deleteAudit(auditId: string): void {
    this.stopProgression(auditId);
    this.audits = this.audits.filter((a) => a.id !== auditId);
    this.findings = this.findings.filter((f) => f.auditId !== auditId);
    this.saveToDisk();
  }

  public getAlerts(): Alert[] {
    return this.alerts;
  }

  public addAlert(alert: Alert): void {
    this.alerts = [alert, ...this.alerts].slice(0, STORAGE_LIMITS.MAX_PERSISTENT_FINDINGS);
    this.saveToDisk();
  }

  /**
   * Upserts a local `Audit` shadow record for a discovery scan seen via
   * `GET /descubrimientos/` (created on the web — never by this app).
   * Returns the audit plus whether its scan phase changed since the last poll,
   * so the caller can raise an alert/notification exactly once per transition.
   */
  public upsertFromRemoteScan(scan: DescubrimientoItem): { audit: Audit; statusChanged: boolean } {
    const existing = this.getAuditByScanId(scan.id);

    if (!existing) {
      const cleanHost = scan.target_url.replace(/^https?:\/\//, '').split('/')[0] || 'Target';
      const audit: Audit = {
        id: `audit-scan-${scan.id}`,
        name: `Auditoría ${cleanHost}`,
        status: auditStatusFromScanStatus(scan.status),
        startedAt: scan.started_at || scan.created_at,
        completedAt: scan.finished_at ?? null,
        metrics: { requestsSent: 0, pagesScanned: 0 },
        testBatteries: [],
        scanId: scan.id,
        attackSessionId: null,
        lastKnownScanStatus: scan.status,
      };
      this.audits = [audit, ...this.audits].slice(0, STORAGE_LIMITS.MAX_PERSISTENT_AUDITS);
      this.saveToDisk();
      return { audit, statusChanged: false };
    }

    const statusChanged = existing.lastKnownScanStatus !== scan.status;
    existing.status = auditStatusFromScanStatus(scan.status);
    existing.completedAt = scan.finished_at ?? existing.completedAt;
    existing.lastKnownScanStatus = scan.status;
    this.saveToDisk();
    return { audit: existing, statusChanged };
  }

  /**
   * Upserts attack-session progress (from `GET /ataques/`) onto the local
   * audit that matches `attack.scan_id`. Returns `null` when no local audit
   * tracks that scan yet (a scan not yet seen by `upsertFromRemoteScan`).
   */
  public upsertFromRemoteAttack(
    attack: AttackSession
  ): { audit: Audit; statusChanged: boolean; turnosChanged: boolean } | null {
    const audit = this.getAuditByScanId(attack.scan_id);
    if (!audit) {
      return null;
    }

    const statusChanged = audit.lastKnownAttackStatus !== attack.status;
    const turnosChanged = audit.lastKnownTurnosEjecutados !== attack.turnos_ejecutados;

    audit.attackSessionId = audit.attackSessionId ?? attack.id;
    audit.lastKnownAttackStatus = attack.status;
    audit.lastKnownTurnosEjecutados = attack.turnos_ejecutados;
    this.saveToDisk();

    return { audit, statusChanged, turnosChanged };
  }

  public createAudit(targetUrl: string, name?: string, scanId?: string | null): Audit {
    const id = `audit-${Date.now()}`;
    const cleanHost = targetUrl.replace(/^https?:\/\//, '').split('/')[0] || 'Target';
    const auditName = name || `Audit ${cleanHost}`;

    const newAudit: Audit = {
      id,
      name: auditName,
      status: AUDIT_STATUSES.RUNNING,
      startedAt: new Date().toISOString(),
      completedAt: null,
      metrics: {
        requestsSent: 12,
        pagesScanned: 1,
      },
      testBatteries: createInitialBatteries(id),
      scanId: scanId ?? null,
      attackSessionId: null,
    };

    this.audits = [newAudit, ...this.audits].slice(0, STORAGE_LIMITS.MAX_PERSISTENT_AUDITS);
    this.saveToDisk();
    this.startLiveProgression(id);

    return newAudit;
  }

  public async clearStore(): Promise<void> {
    this.stopAllProgressions();
    this.audits = [];
    this.findings = [];
    this.alerts = [];
    await this.saveToDisk();
  }

  private stopProgression(auditId: string): void {
    const timer = this.activeTimers.get(auditId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(auditId);
    }
  }

  private stopAllProgressions(): void {
    this.activeTimers.forEach((timer) => clearInterval(timer));
    this.activeTimers.clear();
  }

  private advanceAuditStep(audit: Audit): boolean {
    for (let i = 0; i < audit.testBatteries.length; i++) {
      const battery = audit.testBatteries[i];
      const config = SIMULATION_CONFIGS[i];

      if (battery && config && battery.progressPercent < 100) {
        battery.progressPercent = Math.min(
          100,
          battery.progressPercent + config.PROGRESS_INCREMENT
        );
        audit.metrics.requestsSent += config.REQUESTS_INCREMENT;
        if ('PAGES_SCANNED' in config) {
          audit.metrics.pagesScanned = config.PAGES_SCANNED;
        }

        if (battery.progressPercent === 100) {
          battery.status = AUDIT_STATUSES.COMPLETED;
          if (audit.testBatteries[i + 1]) {
            audit.testBatteries[i + 1].status = AUDIT_STATUSES.RUNNING;
          } else {
            audit.status = AUDIT_STATUSES.COMPLETED;
            audit.completedAt = new Date().toISOString();
            return true; // Completed all batteries
          }
        }
        return false; // In progress
      }
    }
    return true;
  }

  private startLiveProgression(auditId: string): void {
    this.stopProgression(auditId);

    const interval = setInterval(() => {
      const audit = this.getAuditById(auditId);
      if (!audit || audit.status === AUDIT_STATUSES.COMPLETED) {
        this.stopProgression(auditId);
        return;
      }

      const isCompleted = this.advanceAuditStep(audit);
      if (isCompleted) {
        this.stopProgression(auditId);
      }

      this.saveToDisk();
    }, API_POLL_INTERVALS_MS.AUDIT_STORE_PROGRESS);

    this.activeTimers.set(auditId, interval);
  }
}

/**
 * Factory helper: Generates default test batteries for a new audit created
 * via `createAudit` (kept for API completeness — no screen calls this anymore).
 */
function createInitialBatteries(auditId: string): TestBattery[] {
  const timestamp = Date.now();
  return [
    {
      id: `bat-${timestamp}-1`,
      auditId,
      name: AUDIT_SIMULATION_STEPS.BATTERY_1.NAME,
      status: AUDIT_STATUSES.RUNNING,
      progressPercent: AUDIT_SIMULATION_STEPS.BATTERY_1.INITIAL_PROGRESS,
    },
    {
      id: `bat-${timestamp}-2`,
      auditId,
      name: AUDIT_SIMULATION_STEPS.BATTERY_2.NAME,
      status: AUDIT_STATUSES.QUEUED,
      progressPercent: 0,
    },
    {
      id: `bat-${timestamp}-3`,
      auditId,
      name: AUDIT_SIMULATION_STEPS.BATTERY_3.NAME,
      status: AUDIT_STATUSES.QUEUED,
      progressPercent: 0,
    },
  ];
}

export const auditStore = new AuditStore();
