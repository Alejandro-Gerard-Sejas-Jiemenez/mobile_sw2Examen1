/**
 * API Domain Types & Interfaces
 * Single source of truth for API contracts, mutations, query responses, and client options.
 */

// --- Status & Enum Types ---

export type AuditStatus = 'running' | 'completed' | 'paused' | 'failed';

export type TestBatteryStatus = 'queued' | 'running' | 'completed' | 'failed';

export type FindingType = 'injection' | 'anomaly' | 'other';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export type FindingConfirmationState = 'confirmed' | 'preliminary';

export type AlertReadState = 'unread' | 'read';

export type ReportFormat = 'pdf' | 'markdown';


export type DescubrimientoStatus = 'pendiente' | 'en_progreso' | 'completado' | 'fallido';

// --- Client & Request Interfaces ---

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** Skip attaching the Authorization header and the 401-refresh retry (e.g. login itself). */
  skipAuth?: boolean;
};

// --- Mutation & Input Interfaces ---

export interface CreateAuditInput {
  targetUrl: string;
  name?: string;
  usuario?: string;
  contrasena?: string;
}

// --- Offensive Discovery Interfaces ---

export interface DescubrimientoResultado {
  objetivo?: { url: string; accesible: boolean };
  interfaz?: { tipo: string; selector_entrada: string; selector_envio: string; metodo_envio: string };
  canal?: { protocolo: string; transporte: string; url: string; metodo: string; content_type: string; entrada: any; respuesta: any };
  autenticacion?: { requerida: boolean; tipos: string[]; cookies: string[]; headers: string[] };
  confianza?: number;
  marcador_utilizado?: string;
  observaciones_registradas?: number;
}

export interface DescubrimientoItem {
  id: string;
  target_url: string;
  status: DescubrimientoStatus;
  marcador?: string;
  resultado?: DescubrimientoResultado;
  error_message?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
}

// --- Domain Models ---

export interface TestBattery {
  id: string;
  auditId: string;
  name: string;
  status: TestBatteryStatus;
  progressPercent: number; // 0-100
}

export interface AuditMetrics {
  requestsSent: number;
  pagesScanned: number;
}

export interface Audit {
  id: string;
  name: string;
  status: AuditStatus;
  startedAt: string;
  completedAt: string | null;
  testBatteries: TestBattery[];
  metrics: AuditMetrics;
  /** Injection-backend discovery scan id, discovered via GET /descubrimientos/ (created on the web, never by this app). */
  scanId?: string | null;
  /** Injection-backend attack session id, discovered via GET /ataques/ once the web launches the red-team.
   *  When present, findings/report pull real judge-scored turns instead of local data. */
  attackSessionId?: string | null;
  /** Last discovery-scan status seen by `useSyncRemoteAudits` (backend_genvulnai `EstadoEscaneo`), used to detect phase changes. */
  lastKnownScanStatus?: string | null;
  /** Last attack-session status seen by `useSyncRemoteAudits` (backend_genvulnai `EstadoAtaque`), used to detect phase changes. */
  lastKnownAttackStatus?: string | null;
  /** Last `turnos_ejecutados` count seen for this audit's attack session, used to detect new turns between polls. */
  lastKnownTurnosEjecutados?: number;
}

export interface Finding {
  id: string;
  auditId: string;
  type: FindingType;
  severity: FindingSeverity;
  confirmationState: FindingConfirmationState;
  summary: string;
  evidence?: string;
  impactParameters?: Record<string, string | number>;
  reclassifiedAt: string | null;
}

export type AlertKind = 'phase' | 'finding' | 'report';

export interface Alert {
  id: string;
  /** Set for 'finding' alerts; empty string for 'phase'/'report' alerts (see `auditId` instead). */
  findingId: string;
  severityLabel: string;
  deliveredAt: string;
  readState: AlertReadState;
  /** 'phase' = a scan/attack status change detected by `useSyncRemoteAudits`; 'report' = an on-device report finished generating (`useReportPreview`); 'finding' = tied to a specific Finding. Defaults to 'finding' for backend-sourced alerts. */
  kind: AlertKind;
  /** The local audit this alert is about — required for 'phase'/'report' alerts so the tap can navigate to its findings/report screen. */
  auditId?: string;
  /** Human-readable summary shown in the alerts list and the push notification body. */
  message?: string;
}

// --- Store Interface ---

export interface IAuditStore {
  isReady(): boolean;
  getAudits(): Audit[];
  getAuditById(id: string): Audit | undefined;
  getAuditByScanId(scanId: string): Audit | undefined;
  getFindings(auditId: string): Finding[];
  getFindingById(findingId: string): Finding | undefined;
  createAudit(targetUrl: string, name?: string, scanId?: string | null): Audit;
  addFinding(finding: Finding): void;
  updateAudit(audit: Audit): void;
  setAttackSession(auditId: string, attackSessionId: string): void;
  deleteAudit(auditId: string): void;
  clearStore(): Promise<void>;
  getAlerts(): Alert[];
  addAlert(alert: Alert): void;
}


