import * as FileSystem from 'expo-file-system/legacy';
import { ReportError, REPORT_ERROR_CODES } from '@/errors/report-error';

/**
 * Writes a Markdown report string to a safe local document directory.
 */
export async function generateReportMarkdown(markdown: string, fileName: string): Promise<string> {
  if (!markdown || typeof markdown !== 'string' || markdown.trim().length === 0) {
    throw new ReportError(
      REPORT_ERROR_CODES.REPORT_DATA_INVALID,
      'Markdown content is required to generate a markdown file.'
    );
  }

  if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
    throw new ReportError(
      REPORT_ERROR_CODES.REPORT_DATA_INVALID,
      'A valid fileName is required to save the markdown report.'
    );
  }

  try {
    const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uri = `${dir}${sanitizedName}`;

    await FileSystem.writeAsStringAsync(uri, markdown, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return uri;
  } catch (err: unknown) {
    if (err instanceof ReportError) {
      throw err;
    }
    throw new ReportError(
      REPORT_ERROR_CODES.REPORT_SYNTHESIS_FAILED,
      'Failed to write markdown report to file system.',
      { originalError: err }
    );
  }
}
