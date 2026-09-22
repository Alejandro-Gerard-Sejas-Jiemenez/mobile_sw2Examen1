/**
 * Network & API Client Constants
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 15000,
} as const;

export const API_POLL_INTERVALS_MS = {
  AUDITS_FAST: 2500,
  DESCUBRIMIENTOS: 5000,
  AUDIT_STORE_PROGRESS: 2000,
  DEFAULT_POLL: 30000,
} as const;

/** Report generations that finish faster than this were the cheap heuristic-only
 *  path (no on-device Llama call) — not worth a "reporte listo" notification. */
export const REPORT_NOTIFY_THRESHOLD_MS = 5000;

export const API_ENDPOINTS = {
  SOFTWARE: '/api/software/',
  SOFTWARE_DIRECT: '/software/',
  AUDITS: '/audits',
  AUDITS_QUERY: '/audits?status=running,completed,paused',
  FINDINGS: '/findings',
  ALERTS: '/alerts',
  TOKEN: '/api/token/',
  TOKEN_REFRESH: '/api/token/refresh/',
  AUTH_LOGIN: '/auth/login/',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  DEVICES_PUSH_TOKEN: '/devices/push-token',
  auditFindings: (auditId: string) => `/audits/${auditId}/findings`,
  findingDetail: (findingId: string) => `/findings/${findingId}`,
  reportPreview: (auditId: string, format: string, tone: string) =>
    `/audits/${auditId}/report/preview?format=${format}&tone=${tone}`,
} as const;

/**
 * Endpoints on the INJECTION backend (backend_genvulnai), relative to
 * EXPO_PUBLIC_INJECTION_API_URL (which already ends in `/api`). Reached only
 * through `injectionRequest` (no auth), never the core `apiRequest`.
 */
export const INJECTION_ENDPOINTS = {
  DESCUBRIMIENTOS: '/descubrimientos/',
  descubrimientoDetail: (scanId: string) => `/descubrimientos/${scanId}/`,
  ATAQUES: '/ataques/',
  ataqueDetail: (sessionId: string) => `/ataques/${sessionId}/`,
  ataqueTurnos: (sessionId: string) => `/ataques/${sessionId}/turnos/`,
  OLLAMA_HEALTH: '/sistema/ollama/',
} as const;

export const AUTH_ROUTES = {
  SIGN_IN: '/(auth)/sign-in',
  TABS: '/(tabs)',
  AUTH_GROUP: '(auth)',
} as const;

export const NOTIFICATION_SCREENS = {
  FINDING_DETAIL: 'finding-detail',
  AUDIT_DETAIL: 'audit-detail',
  REPORT_READY: 'report-ready',
  ALERTS_LIST: 'alerts-list',
} as const;

export const NOTIFICATION_ROUTES = {
  FINDING_DETAIL: '/(tabs)/findings/[findingId]',
  AUDIT_DETAIL: '/(tabs)/audits/[auditId]/findings',
  REPORT_READY: '/(tabs)/audits/[auditId]/report',
  ALERTS_LIST: '/(tabs)/alerts',
} as const;



export const QUERY_KEYS = {
  AUDITS: ['audits'] as const,
  ALERTS: ['alerts'] as const,
  DESCUBRIMIENTOS: ['descubrimientos'] as const,
  ATAQUES: ['ataques'] as const,
  ATTACK_TURNS: (sessionId: string) => ['ataques', sessionId, 'turnos'] as const,
  AUDIT_FINDINGS: (auditId: string) => ['audits', auditId, 'findings'] as const,
  FINDING_DETAIL: (findingId: string) => ['findings', findingId] as const,
  REPORT_PREVIEW: (
    auditId: string,
    format: string,
    tone: string,
    customPrompt: string = ''
  ) => ['audits', auditId, 'report-preview', format, tone, customPrompt] as const,
  SAVED_REPORTS: ['saved-reports'] as const,
  SAVED_REPORTS_FOR_AUDIT: (auditId: string) => ['saved-reports', auditId] as const,
  SAVED_REPORT_DETAIL: (reportId: string) => ['saved-reports', 'detail', reportId] as const,
} as const;

