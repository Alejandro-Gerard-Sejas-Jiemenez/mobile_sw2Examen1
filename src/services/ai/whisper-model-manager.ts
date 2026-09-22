import * as FileSystem from 'expo-file-system/legacy';
import { TARGET_WHISPER_MODEL_SPECS } from '@/constants/ai.constants';
import { STORAGE_FILENAMES } from '@/constants/storage.constants';
import { StorageError } from '@/errors/storage-error';
import type { DownloadProgress, ModelInfo } from './model-manager';

export type { DownloadProgress };

export const TARGET_WHISPER_MODEL: ModelInfo = {
  name: TARGET_WHISPER_MODEL_SPECS.NAME,
  filename: TARGET_WHISPER_MODEL_SPECS.FILENAME,
  url: TARGET_WHISPER_MODEL_SPECS.URL,
  sizeBytes: TARGET_WHISPER_MODEL_SPECS.SIZE_BYTES,
  sizeFormatted: TARGET_WHISPER_MODEL_SPECS.SIZE_FORMATTED,
};

// Same models/ directory as the Llama GGUF — just a different filename.
const MODELS_DIR = `${FileSystem.documentDirectory || ''}${STORAGE_FILENAMES.MODELS_DIRECTORY}`;
const MODEL_FILE_PATH = `${MODELS_DIR}${TARGET_WHISPER_MODEL.filename}`;

async function ensureModelsDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(MODELS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_DIR, { intermediates: true });
  }
}

/**
 * Checks if the local Whisper GGML model file exists on the mobile device.
 */
export async function isWhisperModelDownloaded(): Promise<{ exists: boolean; uri: string; sizeBytes: number }> {
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
    console.warn('[whisper-model-manager] Check error:', error);
  }
  return { exists: false, uri: MODEL_FILE_PATH, sizeBytes: 0 };
}

/**
 * Downloads the Whisper model with real-time progress callbacks.
 */
export async function downloadWhisperModel(
  onProgress: (progress: DownloadProgress) => void,
): Promise<string> {
  await ensureModelsDirectory();

  const downloadResumable = FileSystem.createDownloadResumable(
    TARGET_WHISPER_MODEL.url,
    MODEL_FILE_PATH,
    {},
    (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesExpectedToWrite > 0
          ? (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100
          : 0;

      onProgress({
        totalBytesWritten: downloadProgress.totalBytesWritten,
        totalBytesExpectedToWrite: downloadProgress.totalBytesExpectedToWrite || TARGET_WHISPER_MODEL.sizeBytes,
        progressPercent: Math.min(Math.round(progress), 100),
      });
    },
  );

  const result = await downloadResumable.downloadAsync();
  if (!result || !result.uri) {
    throw new StorageError('STORAGE_WRITE_FAILED', 'Whisper model download failed or returned empty URI.', {
      url: TARGET_WHISPER_MODEL.url,
      destination: MODEL_FILE_PATH,
    });
  }

  return result.uri;
}

/**
 * Deletes the local Whisper model to free up space.
 */
export async function deleteWhisperModel(): Promise<void> {
  const check = await isWhisperModelDownloaded();
  if (check.exists) {
    try {
      await FileSystem.deleteAsync(MODEL_FILE_PATH, { idempotent: true });
    } catch (err) {
      throw new StorageError('STORAGE_DELETE_FAILED', `Failed to delete Whisper model at ${MODEL_FILE_PATH}`, { cause: err });
    }
  }
}
