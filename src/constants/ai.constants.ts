/**
 * AI Engine Constants: Vector memory dimensions, similarity thresholds and model specifications.
 */

export const BYTES_PER_MB = 1048576; // 1024 * 1024

export const AI_CONSTANTS = {
  EMBEDDING_DIMENSIONS: 16,
  DEFAULT_VECTOR_BIAS: 0.05,
  BASE_MATCH_WEIGHT: 0.2,
  KEYWORD_MATCH_MULTIPLIER: 0.25,
  MAX_KEYWORD_SCORE: 1.0,
  DEFAULT_TOP_K_VECTORS: 3,
  HIGH_SIMILARITY_THRESHOLD: 0.6,
  CONTEXT_WINDOW_LIMIT_TOKENS: 128000,
  DEFAULT_SYNTHESIS_TEMPERATURE: 0.15,
  DEFAULT_TOP_P: 0.9,
} as const;

export const MODEL_STATUS_LABELS = {
  READY: 'LISTO',
  DOWNLOADING: 'DESCARGANDO',
  NOT_INSTALLED: 'NO INSTALADO',
} as const;

export const TARGET_MODEL_SPECS = {
  NAME: 'Llama 3.2 1B Instruct (Q4_K_M)',
  FILENAME: 'Llama-3.2-1B-Instruct-Q4_K_M.gguf',
  URL: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
  SIZE_BYTES: 846927872, // ~807.69 MB
  SIZE_FORMATTED: '807.69 MB',
} as const;
