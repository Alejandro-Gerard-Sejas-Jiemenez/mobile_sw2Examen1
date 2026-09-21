import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { ReportError, REPORT_ERROR_CODES } from '@/errors/report-error';

/**
 * Renders report HTML into a local PDF file using base64 in-memory encoding to guarantee
 * full read/write permissions for Android FileProvider and ExpoSharing.
 */
export async function generateReportPdf(html: string): Promise<string> {
  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    throw new ReportError(
      REPORT_ERROR_CODES.REPORT_DATA_INVALID,
      'HTML content is required to generate a PDF report.'
    );
  }

  try {
    const printResult = await Print.printToFileAsync({
      html,
      base64: true,
    });

    const targetDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const targetUri = `${targetDir}reporte-auditoria-${Date.now()}.pdf`;

    if (printResult.base64) {
      await FileSystem.writeAsStringAsync(targetUri, printResult.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return targetUri;
    }

    return printResult.uri;
  } catch (err: unknown) {
    if (err instanceof ReportError) {
      throw err;
    }
    throw new ReportError(
      REPORT_ERROR_CODES.REPORT_PDF_GENERATION_FAILED,
      'Failed to generate or save PDF report.',
      { originalError: err }
    );
  }
}
