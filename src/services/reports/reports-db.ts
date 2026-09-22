import * as SQLite from 'expo-sqlite';
import { ReportError, REPORT_ERROR_CODES } from '@/errors/report-error';
import type { OverallRiskLevel, ReportTone } from './types';

const DB_NAME = 'genai_security_reports.db';

export interface SavedReport {
  id: string;
  auditId: string;
  auditName: string;
  tone: ReportTone;
  riskLevel: OverallRiskLevel;
  riskScore: number;
  findingsCount: number;
  contentHtml: string;
  contentMarkdown: string;
  generatedAt: string;
  /** Signed-in auditor's id at generation time — null when unavailable (e.g. mock/offline session). */
  userId: string | null;
}

export interface SaveReportInput {
  auditId: string;
  auditName: string;
  tone: ReportTone;
  riskLevel: OverallRiskLevel;
  riskScore: number;
  findingsCount: number;
  contentHtml: string;
  contentMarkdown: string;
  /** Signed-in auditor's id — pass null if unknown; the column stays nullable. */
  userId?: string | null;
}

/** Row shape as SQLite returns it (snake_case columns). */
interface ReportRow {
  id: string;
  audit_id: string;
  audit_name: string;
  tone: string;
  risk_level: string;
  risk_score: number;
  findings_count: number;
  content_html: string;
  content_markdown: string;
  generated_at: string;
  user_id: string | null;
}

function rowToSavedReport(row: ReportRow): SavedReport {
  return {
    id: row.id,
    auditId: row.audit_id,
    auditName: row.audit_name,
    tone: row.tone as ReportTone,
    riskLevel: row.risk_level as OverallRiskLevel,
    riskScore: row.risk_score,
    findingsCount: row.findings_count,
    contentHtml: row.content_html,
    contentMarkdown: row.content_markdown,
    generatedAt: row.generated_at,
    userId: row.user_id,
  };
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Opens (and lazily migrates) the local reports database. Singleton — same
 *  pattern as `persistentMemory`/`auditStore`: one connection for the app's lifetime. */
function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY NOT NULL,
          audit_id TEXT NOT NULL,
          audit_name TEXT NOT NULL,
          tone TEXT NOT NULL,
          risk_level TEXT NOT NULL,
          risk_score REAL NOT NULL,
          findings_count INTEGER NOT NULL,
          content_html TEXT NOT NULL,
          content_markdown TEXT NOT NULL,
          generated_at TEXT NOT NULL,
          user_id TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_reports_audit_id ON reports(audit_id);
        CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at DESC);
      `);
      // Migration for DBs created before `user_id` existed — SQLite has no
      // "ADD COLUMN IF NOT EXISTS", so add it and swallow the "duplicate
      // column" error on installs that already have it (fresh installs get
      // the column from CREATE TABLE above and hit this same error, which is
      // fine — it's a no-op either way).
      try {
        await db.execAsync(`ALTER TABLE reports ADD COLUMN user_id TEXT;`);
      } catch {
        // Column already exists — nothing to do.
      }
      return db;
    });
  }
  return dbPromise;
}

/** Persists a generated report snapshot (both HTML and Markdown renders) so it
 *  can be browsed and re-shared later without regenerating it. */
export async function saveReport(input: SaveReportInput): Promise<SavedReport> {
  try {
    const db = await getDb();
    const id = `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const generatedAt = new Date().toISOString();
    const userId = input.userId ?? null;

    await db.runAsync(
      `INSERT INTO reports
        (id, audit_id, audit_name, tone, risk_level, risk_score, findings_count, content_html, content_markdown, generated_at, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.auditId,
        input.auditName,
        input.tone,
        input.riskLevel,
        input.riskScore,
        input.findingsCount,
        input.contentHtml,
        input.contentMarkdown,
        generatedAt,
        userId,
      ],
    );

    return { id, generatedAt, ...input, userId };
  } catch (err) {
    throw new ReportError(
      REPORT_ERROR_CODES.REPORT_DB_FAILED,
      'Failed to save report to the local database.',
      { cause: err },
    );
  }
}

/** Lists saved reports, newest first. Pass `auditId` to scope to one audit. */
export async function listReports(auditId?: string): Promise<SavedReport[]> {
  try {
    const db = await getDb();
    const rows = auditId
      ? await db.getAllAsync<ReportRow>(
          `SELECT * FROM reports WHERE audit_id = ? ORDER BY generated_at DESC`,
          [auditId],
        )
      : await db.getAllAsync<ReportRow>(`SELECT * FROM reports ORDER BY generated_at DESC`);
    return rows.map(rowToSavedReport);
  } catch (err) {
    throw new ReportError(
      REPORT_ERROR_CODES.REPORT_DB_FAILED,
      'Failed to list saved reports.',
      { cause: err },
    );
  }
}

export async function getReportById(id: string): Promise<SavedReport | null> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<ReportRow>(`SELECT * FROM reports WHERE id = ?`, [id]);
    return row ? rowToSavedReport(row) : null;
  } catch (err) {
    throw new ReportError(
      REPORT_ERROR_CODES.REPORT_DB_FAILED,
      `Failed to load saved report ${id}.`,
      { cause: err },
    );
  }
}

export async function deleteReport(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(`DELETE FROM reports WHERE id = ?`, [id]);
  } catch (err) {
    throw new ReportError(
      REPORT_ERROR_CODES.REPORT_DB_FAILED,
      `Failed to delete saved report ${id}.`,
      { cause: err },
    );
  }
}
