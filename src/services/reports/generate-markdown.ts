import * as FileSystem from 'expo-file-system/legacy';

/**
 * Writes a Markdown report string to a safe local document directory.
 */
export async function generateReportMarkdown(markdown: string, fileName: string): Promise<string> {
  const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uri = `${dir}${sanitizedName}`;

  await FileSystem.writeAsStringAsync(uri, markdown, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return uri;
}
