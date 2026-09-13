// Shapes as consumed/displayed by this client. The backend is the source of
// truth (data-model.md) — these mirror it, they do not redefine it.

export type AuditStatus = 'running' | 'completed' | 'paused';

export type TestBatteryStatus = 'queued' | 'running' | 'completed' | 'failed';

export type FindingType = 'injection' | 'anomaly' | 'other';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export type FindingConfirmationState = 'confirmed' | 'preliminary';

export type AlertReadState = 'unread' | 'read';

export type ReportFormat = 'pdf' | 'markdown';

export type ReportStatus = 'previewing' | 'compiling' | 'ready' | 'failed';

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

export interface Alert {
  id: string;
  findingId: string;
  severityLabel: string;
  deliveredAt: string;
  readState: AlertReadState;
}

export interface ExecutiveReport {
  id: string;
  auditId: string;
  format: ReportFormat;
  generatedAt: string;
  status: ReportStatus;
  fileUri: string | null;
}
