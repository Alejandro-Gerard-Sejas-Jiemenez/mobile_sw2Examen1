/**
 * Audio Recording, Playback, Tone Directives and Dictation Constants
 */

export type ReportTone = 'executive' | 'technical' | 'compliance' | 'custom';

export const AUDIO_CONSTANTS = {
  RECORDING_TIMER_INTERVAL_MS: 1000,
  PLAYBACK_AUTO_RESET_TIMEOUT_MS: 5000,
  MIN_RECORDING_DURATION_SECONDS: 1,
  DEFAULT_SAMPLE_RATE: 44100,
  DEFAULT_BIT_RATE: 128000,
  DEFAULT_CHANNELS: 2,
} as const;

export const REPORT_TONE_OPTIONS: Array<{ id: ReportTone; label: string }> = [
  { id: 'executive', label: 'C-Level / Negocio' },
  { id: 'technical', label: 'Técnico DevSecOps' },
  { id: 'compliance', label: 'Legal & GDPR' },
  { id: 'custom', label: 'Personalizado' },
] as const;

export const VOICE_DIRECTIVE_PRESETS = [
  { label: 'Impacto Financiero', text: 'Enfócate en la fuga de claves y advierte sobre el impacto financiero crítico.' },
  { label: 'Blindaje de Prompts', text: 'Generar código defensivo estricto para desarrolladores con delimitadores XML inmutables.' },
  { label: 'Cumplimiento Legal', text: 'El chatbot maneja datos de usuarios; resaltar el riesgo legal bajo regulaciones EU AI Act y GDPR.' },
  { label: 'Alerta Directiva', text: 'Explicar en lenguaje no técnico para la junta directiva por qué el bot debe pausarse de inmediato.' },
] as const;
