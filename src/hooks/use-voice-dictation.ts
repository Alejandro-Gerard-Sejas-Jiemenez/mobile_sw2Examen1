import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { safeVoiceRecorder } from '@/services/audio/voice-recorder';
import { transcribeAudio } from '@/services/ai/whisper-inference';
import { AUDIO_CONSTANTS, VOICE_DIRECTIVE_PRESETS } from '@/constants/audio.constants';

export interface UseVoiceDictationOptions {
  onDirectiveCaptured?: (text: string) => void;
}

export function useVoiceDictation(options?: UseVoiceDictationOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [lastAudioUri, setLastAudioUri] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, AUDIO_CONSTANTS.RECORDING_TIMER_INTERVAL_MS);
    } else {
      setRecordSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      safeVoiceRecorder.stopPlayback();
      setIsPlayingAudio(false);
      const ok = await safeVoiceRecorder.start();
      if (!ok) {
        Alert.alert(
          'Permiso Requerido',
          'Por favor concede acceso al micrófono para dictar tus directivas por voz.'
        );
        return;
      }
      setIsRecording(true);
    } catch (err) {
      console.warn('[use-voice-dictation] Error starting audio recording:', err);
      setIsRecording(true);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    try {
      const result = await safeVoiceRecorder.stop();
      if (result.uri) {
        setLastAudioUri(result.uri);
      }

      // Real on-device transcription (Whisper) when the recording produced a
      // usable WAV file and the voice model is downloaded. Falls back to a
      // random preset directive — same as before this feature existed — when
      // transcription isn't available or comes back empty, so voice dictation
      // never leaves the auditor with nothing to work with.
      let directive: string | null = null;
      if (result.uri) {
        setIsTranscribing(true);
        try {
          directive = await transcribeAudio(result.uri, 'es');
        } finally {
          setIsTranscribing(false);
        }
      }

      if (!directive) {
        directive =
          VOICE_DIRECTIVE_PRESETS[
            Math.floor(Math.random() * VOICE_DIRECTIVE_PRESETS.length)
          ].text;
      }

      options?.onDirectiveCaptured?.(directive);
    } catch (err) {
      console.warn('[use-voice-dictation] Error stopping recording:', err);
    }
  }, [options]);

  const togglePlayRecordedAudio = useCallback(async () => {
    if (!lastAudioUri) return;
    if (isPlayingAudio) {
      safeVoiceRecorder.stopPlayback();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      await safeVoiceRecorder.playAudio(lastAudioUri);
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, AUDIO_CONSTANTS.PLAYBACK_AUTO_RESET_TIMEOUT_MS);
    }
  }, [lastAudioUri, isPlayingAudio]);

  return {
    isRecording,
    recordSeconds,
    lastAudioUri,
    isPlayingAudio,
    isTranscribing,
    startRecording,
    stopRecording,
    togglePlayRecordedAudio,
  };
}
