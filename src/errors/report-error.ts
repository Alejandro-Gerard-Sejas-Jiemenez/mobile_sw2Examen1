import { AppError } from './app-error';

export const REPORT_ERROR_CODES = {
  REPORT_SYNTHESIS_FAILED: 'REPORT_SYNTHESIS_FAILED',
  REPORT_PDF_GENERATION_FAILED: 'REPORT_PDF_GENERATION_FAILED',
  REPORT_SHARING_FAILED: 'REPORT_SHARING_FAILED',
  REPORT_DATA_INVALID: 'REPORT_DATA_INVALID',
  REPORT_VECTOR_SEARCH_FAILED: 'REPORT_VECTOR_SEARCH_FAILED',
} as const;

export type ReportErrorCode = (typeof REPORT_ERROR_CODES)[keyof typeof REPORT_ERROR_CODES];


export class ReportError extends AppError {
  public readonly code: ReportErrorCode;

  constructor(code: ReportErrorCode, message: string, context?: Record<string, unknown>) {
    super(`[ReportError] ${code}: ${message}`, context);
    this.code = code;
  }
}
