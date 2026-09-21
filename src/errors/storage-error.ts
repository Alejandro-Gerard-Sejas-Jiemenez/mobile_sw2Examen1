import { AppError } from './app-error';

export const STORAGE_ERROR_CODES = {
  STORAGE_READ_FAILED: 'STORAGE_READ_FAILED',
  STORAGE_WRITE_FAILED: 'STORAGE_WRITE_FAILED',
  STORAGE_DELETE_FAILED: 'STORAGE_DELETE_FAILED',
  STORAGE_CORRUPT_PAYLOAD: 'STORAGE_CORRUPT_PAYLOAD',
  STORAGE_CAPACITY_EXCEEDED: 'STORAGE_CAPACITY_EXCEEDED',
} as const;

export type StorageErrorCode = (typeof STORAGE_ERROR_CODES)[keyof typeof STORAGE_ERROR_CODES];


export class StorageError extends AppError {
  public readonly code: StorageErrorCode;

  constructor(code: StorageErrorCode, message: string, context?: Record<string, unknown>) {
    super(`[StorageError] ${code}: ${message}`, context);
    this.code = code;
  }
}
