import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Renders report HTML into a local PDF file using base64 in-memory encoding to guarantee
 * full read/write permissions for Android FileProvider and ExpoSharing.
 */
export async function generateReportPdf(html: string): Promise<string> {
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
}
