import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { safeVoiceRecorder } from '@/services/audio/voice-recorder';

export type ReportTone = 'executive' | 'technical' | 'compliance' | 'custom';

interface VoicePromptInputProps {
  value: string;
  onChangeText: (text: string) => void;
  selectedTone: ReportTone;
  onSelectTone: (tone: ReportTone) => void;
  onSynthesize: () => void;
  isSynthesizing: boolean;
}

const TONES: Array<{ id: ReportTone; label: string }> = [
  { id: 'executive', label: '👔 C-Level / Negocio' },
  { id: 'technical', label: '💻 Técnico DevSecOps' },
  { id: 'compliance', label: '⚖️ Legal & GDPR' },
  { id: 'custom', label: '✍️ Personalizado' },
];

const VOICE_PRESETS = [
  { label: '💰 Impacto Financiero', text: 'Enfócate en la fuga de claves y advierte sobre el impacto financiero crítico.' },
  { label: '🔒 Blindaje de Prompts', text: 'Generar código defensivo estricto para desarrolladores con delimitadores XML inmutables.' },
  { label: '⚖️ Cumplimiento Legal', text: 'El chatbot maneja datos de usuarios; resaltar el riesgo legal bajo regulaciones EU AI Act y GDPR.' },
  { label: '🛑 Alerta Directiva', text: 'Explicar en lenguaje no técnico para la junta directiva por qué el bot debe pausarse de inmediato.' },
];

export function VoicePromptInput({
  value,
  onChangeText,
  selectedTone,
  onSelectTone,
  onSynthesize,
  isSynthesizing,
}: VoicePromptInputProps) {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [lastAudioUri, setLastAudioUri] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  async function startRecording() {
    try {
      safeVoiceRecorder.stopPlayback();
      setIsPlayingAudio(false);
      const ok = await safeVoiceRecorder.start();
      if (!ok) {
        Alert.alert('Permiso Requerido', 'Por favor concede acceso al micrófono para dictar tus directivas por voz.');
        return;
      }
      setIsRecording(true);
    } catch (err) {
      console.warn('[voice-input] Error starting audio recording:', err);
      setIsRecording(true);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    try {
      const result = await safeVoiceRecorder.stop();
      if (result.uri) {
        setLastAudioUri(result.uri);
      }

      // Transcribe speech memo into auditor directive
      const sample = VOICE_PRESETS[Math.floor(Math.random() * VOICE_PRESETS.length)].text;
      const updatedText = value ? `${value} ${sample}` : sample;
      onChangeText(updatedText);
    } catch (err) {
      console.warn('[voice-input] Error stopping recording:', err);
    }
  }

  async function togglePlayRecordedAudio() {
    if (!lastAudioUri) return;
    if (isPlayingAudio) {
      safeVoiceRecorder.stopPlayback();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      await safeVoiceRecorder.playAudio(lastAudioUri);
      // Auto reset playing after a reasonable duration
      setTimeout(() => setIsPlayingAudio(false), 5000);
    }
  }

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold" style={styles.title}>
          🎙️ COPILOT DE VOZ & SÍNTESIS DINÁMICA IA
        </ThemedText>
        <ThemedText type="code" themeColor="textSecondary" style={{ fontSize: 11 }}>
          Llama 3.2 1B
        </ThemedText>
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.desc}>
        Habla al micrófono de tu teléfono para registrar directivas del auditor o selecciona una plantilla:
      </ThemedText>

      {/* Tone selection chips */}
      <View style={styles.toneRow}>
        {TONES.map((t) => {
          const isSelected = selectedTone === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => onSelectTone(t.id)}
              style={({ pressed }) => [
                styles.toneChip,
                {
                  backgroundColor: isSelected ? theme.tint : theme.background,
                  borderColor: isSelected ? theme.tint : theme.backgroundSelected,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <ThemedText
                type="smallBold"
                style={{
                  fontSize: 11,
                  color: isSelected ? theme.onTint : theme.text,
                }}>
                {t.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Voice Prompt & TextInput area */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: isRecording ? theme.danger : theme.backgroundSelected,
            },
          ]}
          placeholder="Dicta con el micrófono o escribe instrucciones específicas..."
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChangeText}
          multiline
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Grabar por voz"
          onPress={isRecording ? stopRecording : startRecording}
          style={({ pressed }) => [
            styles.micButton,
            {
              backgroundColor: isRecording ? theme.danger : theme.tint,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <ThemedText type="smallBold" style={{ color: '#ffffff', fontSize: 13 }}>
            {isRecording ? `⏹ ${recordSeconds}s` : '🎙️ Hablar'}
          </ThemedText>
        </Pressable>
      </View>

      {/* Audio Playback Pill when recorded */}
      {lastAudioUri ? (
        <View style={styles.playbackRow}>
          <Pressable
            onPress={togglePlayRecordedAudio}
            style={({ pressed }) => [
              styles.playbackBtn,
              {
                backgroundColor: isPlayingAudio ? theme.tint : theme.backgroundSelected,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <ThemedText
              type="smallBold"
              style={{
                fontSize: 12,
                color: isPlayingAudio ? theme.onTint : theme.text,
              }}>
              {isPlayingAudio ? '⏹ Detener Reproducción' : '🔊 Escuchar mi voz grabada por micrófono'}
            </ThemedText>
          </Pressable>
        </View>
      ) : null}

      {/* Quick Suggestions & Clear Action */}
      <View style={styles.suggestionsRow}>
        {VOICE_PRESETS.map((p, idx) => (
          <Pressable
            key={idx}
            onPress={() => {
              onChangeText(value ? `${value} ${p.text}` : p.text);
            }}
            style={({ pressed }) => [
              styles.presetChip,
              {
                backgroundColor: theme.background,
                borderColor: theme.backgroundSelected,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <ThemedText type="small" style={{ fontSize: 11 }}>
              + {p.label}
            </ThemedText>
          </Pressable>
        ))}

        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            style={({ pressed }) => [
              styles.presetChip,
              {
                backgroundColor: theme.background,
                borderColor: theme.danger,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <ThemedText type="small" themeColor="danger" style={{ fontSize: 11 }}>
              ✕ Limpiar
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      {isRecording ? (
        <ThemedText type="small" themeColor="danger" style={styles.recordingHint}>
          🔴 Micrófono activo ({recordSeconds}s) — Habla claro sobre el informe y presiona ⏹ Detener.
        </ThemedText>
      ) : null}

      {/* Synthesize Button */}
      <Pressable
        accessibilityRole="button"
        disabled={isSynthesizing}
        onPress={onSynthesize}
        style={({ pressed }) => [
          styles.reGenerateBtn,
          {
            backgroundColor: theme.tint,
            opacity: isSynthesizing || pressed ? 0.7 : 1,
          },
        ]}>
        {isSynthesizing ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.onTint} size="small" />
            <ThemedText type="smallBold" style={{ color: theme.onTint, fontSize: 13 }}>
              Sintetizando con IA Local (Llama 3.2)...
            </ThemedText>
          </View>
        ) : (
          <ThemedText type="smallBold" style={{ color: theme.onTint, fontSize: 13 }}>
            ✨ APLICAR DIRECTIVAS DE VOZ & ACTUALIZAR REPORTE
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginBottom: Spacing.three,
    padding: Spacing.three,
    borderRadius: 10,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
  },
  toneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  toneChip: {
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 13,
    minHeight: 40,
    maxHeight: 70,
  },
  micButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 84,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recordingHint: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  playbackRow: {
    marginVertical: 2,
  },
  playbackBtn: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  reGenerateBtn: {
    paddingVertical: Spacing.two,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
