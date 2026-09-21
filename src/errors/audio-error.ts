import { AppError } from './app-error';

export const AUDIO_ERROR_CODES = {
  AUDIO_RECORDING_PERMISSION_DENIED: 'AUDIO_RECORDING_PERMISSION_DENIED',
  AUDIO_RECORDING_START_FAILED: 'AUDIO_RECORDING_START_FAILED',
  AUDIO_RECORDING_STOP_FAILED: 'AUDIO_RECORDING_STOP_FAILED',
  AUDIO_PLAYBACK_FAILED: 'AUDIO_PLAYBACK_FAILED',
  AUDIO_INITIALIZATION_FAILED: 'AUDIO_INITIALIZATION_FAILED',
} as const;

export type AudioErrorCode = (typeof AUDIO_ERROR_CODES)[keyof typeof AUDIO_ERROR_CODES];


export class AudioError extends AppError {
  public readonly code: AudioErrorCode;

  constructor(code: AudioErrorCode, message: string, context?: Record<string, unknown>) {
    super(`[AudioError] ${code}: ${message}`, context);
    this.code = code;
  }
}
