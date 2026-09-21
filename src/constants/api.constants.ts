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

export const API_ENDPOINTS = {
  SOFTWARE: '/api/software/',
  SOFTWARE_DIRECT: '/software/',
  AUDITS: '/audits',
  AUDITS_QUERY: '/audits?status=running,completed,paused',
  FINDINGS: '/findings',
  ALERTS: '/alerts',
  TOKEN: '/api/token/',
  TOKEN_REFRESH: '/api/token/refresh/',
  DESCUBRIMIENTOS: '/api/descubrimientos/',
  AUTH_LOGIN: '/auth/login/',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  DEVICES_PUSH_TOKEN: '/devices/push-token',
  auditFindings: (auditId: string) => `/audits/${auditId}/findings`,
  findingDetail: (findingId: string) => `/findings/${findingId}`,
  reportPreview: (auditId: string, format: string, tone: string) =>
    `/audits/${auditId}/report/preview?format=${format}&tone=${tone}`,
} as const;

export const AUTH_ROUTES = {
  SIGN_IN: '/(auth)/sign-in',
  TABS: '/(tabs)',
  AUTH_GROUP: '(auth)',
} as const;

export const NOTIFICATION_SCREENS = {
  FINDING_DETAIL: 'finding-detail',
  AUDIT_DETAIL: 'audit-detail',
  ALERTS_LIST: 'alerts-list',
} as const;

export const NOTIFICATION_ROUTES = {
  FINDING_DETAIL: '/(tabs)/findings/[findingId]',
  AUDIT_DETAIL: '/(tabs)/audits/[auditId]/findings',
  ALERTS_LIST: '/(tabs)/alerts',
} as const;



export const QUERY_KEYS = {
  AUDITS: ['audits'] as const,
  ALERTS: ['alerts'] as const,
  DESCUBRIMIENTOS: ['descubrimientos'] as const,
  AUDIT_FINDINGS: (auditId: string) => ['audits', auditId, 'findings'] as const,
  FINDING_DETAIL: (findingId: string) => ['findings', findingId] as const,
  REPORT_PREVIEW: (
    auditId: string,
    format: string,
    tone: string,
    customPrompt: string = ''
  ) => ['audits', auditId, 'report-preview', format, tone, customPrompt] as const,
} as const;

