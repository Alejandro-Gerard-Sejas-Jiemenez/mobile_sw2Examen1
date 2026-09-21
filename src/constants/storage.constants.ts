/**
 * Storage & Persistence Constants
 */

export const STORAGE_LIMITS = {
  MAX_PERSISTENT_DIRECTIVES: 15,
  MAX_PERSISTENT_LEARNED_RULES: 20,
  MAX_PERSISTENT_TARGETS: 25,
  MAX_PERSISTENT_FINDINGS: 100,
  MAX_PERSISTENT_AUDITS: 50,
} as const;

export const STORAGE_FILENAMES = {
  AI_PERSISTENT_MEMORY: 'ai_persistent_memory.json',
  AUDITS_STORE: 'audits_persistent_store.json',
  MODELS_DIRECTORY: 'models/',
} as const;

export const STORAGE_KEYS = {
  REFRESH_TOKEN: 'auth.refreshToken',
} as const;

