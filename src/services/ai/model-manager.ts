import * as FileSystem from 'expo-file-system/legacy';

export interface ModelInfo {
  name: string;
  filename: string;
  url: string;
  sizeBytes: number;
  sizeFormatted: string;
}

export const TARGET_AI_MODEL: ModelInfo = {
  name: 'Llama 3.2 1B Instruct (Q4_K_M)',
  filename: 'Llama-3.2-1B-Instruct-Q4_K_M.gguf',
  url: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
  sizeBytes: 846927872, // ~807.69 MB
  sizeFormatted: '807.69 MB',
};

const MODELS_DIR = `${FileSystem.documentDirectory || ''}models/`;
const MODEL_FILE_PATH = `${MODELS_DIR}${TARGET_AI_MODEL.filename}`;

export interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
  progressPercent: number; // 0 - 100
}

/**
 * Ensures the destination directory exists.
 */
async function ensureModelsDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(MODELS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_DIR, { intermediates: true });
  }
}

/**
 * Checks if the local GGUF AI model file exists on the mobile device.
 */
export async function isModelDownloaded(): Promise<{ exists: boolean; uri: string; sizeBytes: number }> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(MODEL_FILE_PATH);
    if (fileInfo.exists && !fileInfo.isDirectory) {
      return {
        exists: true,
        uri: fileInfo.uri,
        sizeBytes: fileInfo.size || 0,
      };
    }
  } catch (error) {
    console.warn('[model-manager] Check error:', error);
  }
  return { exists: false, uri: MODEL_FILE_PATH, sizeBytes: 0 };
}

/**
 * Downloads the AI model with real-time progress callbacks.
 */
export async function downloadAiModel(
  onProgress: (progress: DownloadProgress) => void,
): Promise<string> {
  await ensureModelsDirectory();

  const downloadResumable = FileSystem.createDownloadResumable(
    TARGET_AI_MODEL.url,
    MODEL_FILE_PATH,
    {},
    (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesExpectedToWrite > 0
          ? (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100
          : 0;

      onProgress({
        totalBytesWritten: downloadProgress.totalBytesWritten,
        totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite || TARGET_AI_MODEL.sizeBytes,
        progressPercent: Math.min(Math.round(progress), 100),
      });
    },
  );

  const result = await downloadResumable.downloadAsync();
  if (!result || !result.uri) {
    throw new Error('Download failed or returned empty URI.');
  }

  return result.uri;
}

/**
 * Deletes the local AI model to free up space.
 */
export async function deleteAiModel(): Promise<void> {
  const check = await isModelDownloaded();
  if (check.exists) {
    await FileSystem.deleteAsync(MODEL_FILE_PATH, { idempotent: true });
  }
}
