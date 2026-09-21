import { AppError } from './app-error';

export const NETWORK_ERROR_CODES = {
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_UNAUTHORIZED: 'NETWORK_UNAUTHORIZED',
  NETWORK_FORBIDDEN: 'NETWORK_FORBIDDEN',
  NETWORK_NOT_FOUND: 'NETWORK_NOT_FOUND',
  NETWORK_SERVER_ERROR: 'NETWORK_SERVER_ERROR',
  NETWORK_REQUEST_FAILED: 'NETWORK_REQUEST_FAILED',
} as const;

export type NetworkErrorCode = (typeof NETWORK_ERROR_CODES)[keyof typeof NETWORK_ERROR_CODES];


export class NetworkError extends AppError {
  public readonly code: NetworkErrorCode;
  public readonly statusCode?: number;

  constructor(
    code: NetworkErrorCode,
    message: string,
    statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(`[NetworkError] ${code} (Status: ${statusCode ?? 'N/A'}): ${message}`, context);
    this.code = code;
    this.statusCode = statusCode;
  }
}
