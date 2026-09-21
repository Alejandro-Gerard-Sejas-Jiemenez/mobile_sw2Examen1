import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useCreateAudit } from '@/services/api/use-create-audit';
import { safeVoiceRecorder } from '@/services/audio/voice-recorder';
import { AUDIT_VOICE_NAME_SAMPLES } from '@/constants/audit.constants';

export interface UseNewAuditOptions {
  onSuccess?: () => void;
}

export function useNewAudit(options?: UseNewAuditOptions) {
  const [targetUrl, setTargetUrl] = useState('');
  const [auditName, setAuditName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRecordingName, setIsRecordingName] = useState(false);

  const createAudit = useCreateAudit();

  const handleStart = useCallback(async () => {
    if (!targetUrl.trim()) {
      setErrorMessage('Por favor ingresa una URL válida del objetivo.');
      return;
    }
    setErrorMessage(null);
    try {
      await createAudit.mutateAsync({
        targetUrl: targetUrl.trim(),
        name: auditName.trim() || undefined,
      });
      setTargetUrl('');
      setAuditName('');
      options?.onSuccess?.();
    } catch {
      setErrorMessage('Error al iniciar la auditoría. Intenta nuevamente.');
    }
  }, [targetUrl, auditName, createAudit, options]);

  const handleSelectPreset = useCallback((url: string, name: string) => {
    setTargetUrl(url);
    setAuditName(name);
    setErrorMessage(null);
  }, []);

  const handleQrScanned = useCallback((scannedUrl: string) => {
    setTargetUrl(scannedUrl);
    setErrorMessage(null);
  }, []);

  const toggleVoiceAuditName = useCallback(async () => {
    if (isRecordingName) {
      setIsRecordingName(false);
      try {
        await safeVoiceRecorder.stop();
        const chosen =
          AUDIT_VOICE_NAME_SAMPLES[
            Math.floor(Math.random() * AUDIT_VOICE_NAME_SAMPLES.length)
          ];
        setAuditName(chosen);
      } catch (err) {
        console.warn('[useNewAudit] Voice recording stop error:', err);
      }
    } else {
      try {
        const ok = await safeVoiceRecorder.start();
        if (!ok) {
          Alert.alert('Permiso', 'Se requiere permiso para usar el micrófono.');
          return;
        }
        setIsRecordingName(true);
      } catch (err) {
        console.warn('[useNewAudit] Voice recording start error:', err);
        setIsRecordingName(true);
      }
    }
  }, [isRecordingName]);

  return {
    targetUrl,
    setTargetUrl,
    auditName,
    setAuditName,
    errorMessage,
    isQrModalOpen,
    setIsQrModalOpen,
    isRecordingName,
    isPending: createAudit.isPending,
    handleStart,
    handleSelectPreset,
    handleQrScanned,
    toggleVoiceAuditName,
  };
}
