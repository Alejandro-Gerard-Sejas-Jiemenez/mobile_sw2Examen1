import type { ThemeColor } from './theme';

/**
 * Risk Assessment & CVSS Scoring Constants
 */

export const RISK_WEIGHTS = {
  BASE_SCORE: 1.0,
  CRITICAL_SEVERITY: 3.2,
  HIGH_SEVERITY: 2.1,
  MEDIUM_SEVERITY: 1.0,
  LOW_SEVERITY: 0.2,
  RAG_CONFIRMED_BOOST: 0.5,
  MAX_SCORE: 10.0,
} as const;

export const RISK_THRESHOLDS = {
  CRITICAL_MIN: 8.5,
  HIGH_MIN: 6.5,
  MEDIUM_MIN: 4.0,
} as const;

export const RISK_LEVELS = {
  CRITICAL: 'CRÍTICO',
  HIGH: 'ALTO',
  MEDIUM: 'MEDIO',
  LOW: 'BAJO',
  SAFE: 'SEGURO',
} as const;

export const RISK_BADGE_COLORS = {
  CRITICAL: '#B3261E',
  HIGH: '#C4560C',
  MEDIUM: '#A66A00',
  LOW: '#3A6B35',
  SAFE: '#10B981',
} as const;

export const FINDING_TYPES = {
  INJECTION: 'injection',
  ANOMALY: 'anomaly',
  OTHER: 'other',
} as const;

export const FINDING_SEVERITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const FINDING_CONFIRMATION_STATES = {
  CONFIRMED: 'confirmed',
  PRELIMINARY: 'preliminary',
} as const;

export const SEVERITY_GLYPHS: Record<
  (typeof FINDING_SEVERITIES)[keyof typeof FINDING_SEVERITIES] | 'unknown',
  string
> = {
  [FINDING_SEVERITIES.CRITICAL]: '◆',
  [FINDING_SEVERITIES.HIGH]: '▲',
  [FINDING_SEVERITIES.MEDIUM]: '●',
  [FINDING_SEVERITIES.LOW]: '■',
  unknown: '•',
};

export const SEVERITY_COLOR_TOKENS: Record<
  (typeof FINDING_SEVERITIES)[keyof typeof FINDING_SEVERITIES] | 'unknown',
  ThemeColor
> = {
  [FINDING_SEVERITIES.CRITICAL]: 'severityCritical',
  [FINDING_SEVERITIES.HIGH]: 'severityHigh',
  [FINDING_SEVERITIES.MEDIUM]: 'severityMedium',
  [FINDING_SEVERITIES.LOW]: 'severityLow',
  unknown: 'textSecondary',
};
