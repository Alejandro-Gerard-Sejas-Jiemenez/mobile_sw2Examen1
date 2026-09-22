import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  deleteWhisperModel,
  downloadWhisperModel,
  isWhisperModelDownloaded,
  TARGET_WHISPER_MODEL,
  type DownloadProgress,
} from '@/services/ai/whisper-model-manager';
import { BYTES_PER_MB, TARGET_WHISPER_MODEL_SPECS } from '@/constants/ai.constants';

export function useWhisperModelManager() {
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadedMb, setDownloadedMb] = useState<string>('0');

  const checkStatus = useCallback(async () => {
    setChecking(true);
    const result = await isWhisperModelDownloaded();
    setIsDownloaded(result.exists);
    setChecking(false);
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleDownload = useCallback(async () => {
    try {
      setDownloading(true);
      setProgress(0);

      await downloadWhisperModel((p: DownloadProgress) => {
        setProgress(p.progressPercent);
        const mb = (p.totalBytesWritten / BYTES_PER_MB).toFixed(1);
        setDownloadedMb(mb);
      });

      setIsDownloaded(true);
      setDownloading(false);
      Alert.alert(
        '¡Modelo Listo!',
        `${TARGET_WHISPER_MODEL_SPECS.NAME} cargado correctamente en tu dispositivo.`
      );
    } catch (error) {
      setDownloading(false);
      console.error('[useWhisperModelManager] Download error:', error);
      Alert.alert(
        'Error de Descarga',
        'No se pudo descargar el modelo de voz. Revisa tu conexión a internet.'
      );
    }
  }, []);

  const handleDelete = useCallback(async () => {
    Alert.alert(
      'Eliminar Modelo',
      `¿Deseas eliminar el modelo local de voz para liberar ${TARGET_WHISPER_MODEL_SPECS.SIZE_FORMATTED}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteWhisperModel();
            setIsDownloaded(false);
          },
        },
      ]
    );
  }, []);

  return {
    isDownloaded,
    checking,
    downloading,
    progress,
    downloadedMb,
    targetModel: TARGET_WHISPER_MODEL,
    handleDownload,
    handleDelete,
    checkStatus,
  };
}
