import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useVoiceDictation } from '@/hooks/use-voice-dictation';
import {
  REPORT_TONE_OPTIONS,
  VOICE_DIRECTIVE_PRESETS,
  type ReportTone,
} from '@/constants/audio.constants';
import { commonStyles, layoutStyles, voicePromptStyles } from '@/styles';

export { type ReportTone };

interface VoicePromptInputProps {
  value: string;
  onChangeText: (text: string) => void;
  selectedTone: ReportTone;
  onSelectTone: (tone: ReportTone) => void;
  onSynthesize: () => void;
  isSynthesizing: boolean;
}

export function VoicePromptInput({
  value,
  onChangeText,
  selectedTone,
  onSelectTone,
  onSynthesize,
  isSynthesizing,
}: VoicePromptInputProps) {
  const theme = useTheme();

  const {
    isRecording,
    recordSeconds,
    lastAudioUri,
    isPlayingAudio,
    isTranscribing,
    startRecording,
    stopRecording,
    togglePlayRecordedAudio,
  } = useVoiceDictation({
    onDirectiveCaptured: (sampleText) => {
      const updatedText = value ? `${value} ${sampleText}` : sampleText;
      onChangeText(updatedText);
    },
  });

  return (
    <ThemedView type="backgroundElement" style={[commonStyles.card, voicePromptStyles.container]}>
      <ThemedText type="smallBold" style={voicePromptStyles.headerTitle}>
        COPILOT DE VOZ & SÍNTESIS DINÁMICA IA
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary" style={voicePromptStyles.subtitle} numberOfLines={2}>
        Habla al micrófono o selecciona una plantilla de auditoría:
      </ThemedText>

      {/* Tone selection chips */}
      <View style={[layoutStyles.rowWrap, layoutStyles.gap1]}>
        {REPORT_TONE_OPTIONS.map((t) => {
          const isSelected = selectedTone === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => onSelectTone(t.id)}
              style={({ pressed }) => [
                commonStyles.chip,
                {
                  backgroundColor: isSelected ? theme.tint : theme.background,
                  borderColor: isSelected ? theme.tint : theme.backgroundSelected,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <ThemedText
                type="smallBold"
                style={[
                  voicePromptStyles.chipText,
                  { color: isSelected ? theme.onTint : theme.text },
                ]}>
                {t.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Voice Prompt & TextInput area */}
      <View style={[layoutStyles.row, layoutStyles.gap2]}>
        <TextInput
          style={[
            commonStyles.input,
            layoutStyles.flex1,
            voicePromptStyles.input,
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

        {/* Botón voz — solo ícono mic / stop */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isRecording ? 'Detener grabación' : 'Grabar por voz'}
          disabled={isTranscribing}
          onPress={isRecording ? stopRecording : startRecording}
          style={({ pressed }) => [
            voicePromptStyles.recordButton,
            {
              backgroundColor: isRecording ? theme.danger : theme.tint,
              opacity: isTranscribing || pressed ? 0.7 : 1,
            },
          ]}>
          {isTranscribing ? (
            <ActivityIndicator color={theme.onTint} size="small" />
          ) : (
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={20}
              color={theme.onTint}
            />
          )}
        </Pressable>
      </View>

      {isTranscribing ? (
        <ThemedText type="small" themeColor="textSecondary" style={voicePromptStyles.recordingNotice}>
          Transcribiendo audio con IA local…
        </ThemedText>
      ) : null}

      {/* Audio Playback Pill when recorded */}
      {lastAudioUri ? (
        <View style={voicePromptStyles.audioPlaybackContainer}>
          <Pressable
            onPress={togglePlayRecordedAudio}
            style={({ pressed }) => [
              commonStyles.buttonSecondary,
              voicePromptStyles.audioPlaybackButton,
              {
                backgroundColor: isPlayingAudio ? theme.tint : theme.backgroundSelected,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <ThemedText
              type="smallBold"
              style={[
                voicePromptStyles.audioPlaybackText,
                { color: isPlayingAudio ? theme.onTint : theme.text },
              ]}>
              {isPlayingAudio ? 'Detener Reproducción' : 'Escuchar audio grabado'}
            </ThemedText>
          </Pressable>
        </View>
      ) : null}

      {/* Quick Suggestions & Clear Action */}
      <View style={[layoutStyles.rowWrap, voicePromptStyles.presetsRow]}>
        {VOICE_DIRECTIVE_PRESETS.map((p, idx) => (
          <Pressable
            key={idx}
            onPress={() => {
              onChangeText(value ? `${value} ${p.text}` : p.text);
            }}
            style={({ pressed }) => [
              commonStyles.chip,
              {
                backgroundColor: theme.background,
                borderColor: theme.backgroundSelected,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <ThemedText type="small" style={voicePromptStyles.chipText}>
              + {p.label}
            </ThemedText>
          </Pressable>
        ))}

        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            style={({ pressed }) => [
              commonStyles.chip,
              {
                backgroundColor: theme.background,
                borderColor: theme.danger,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <ThemedText type="small" themeColor="danger" style={voicePromptStyles.chipText}>
              Limpiar
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      {isRecording ? (
        <ThemedText type="small" themeColor="danger" style={voicePromptStyles.recordingNotice}>
          Micrófono activo ({recordSeconds}s) — Habla claro sobre el informe y presiona Detener.
        </ThemedText>
      ) : null}

      {/* Synthesize Button */}
      <Pressable
        accessibilityRole="button"
        disabled={isSynthesizing}
        onPress={onSynthesize}
        style={({ pressed }) => [
          commonStyles.buttonPrimary,
          voicePromptStyles.synthesizeButton,
          {
            backgroundColor: theme.tint,
            opacity: isSynthesizing || pressed ? 0.7 : 1,
          },
        ]}>
        {isSynthesizing ? (
          <View style={[layoutStyles.row, layoutStyles.gap2]}>
            <ActivityIndicator color={theme.onTint} size="small" />
            <ThemedText
              type="smallBold"
              style={[{ color: theme.onTint }, voicePromptStyles.synthesizeText]}>
              Sintetizando con IA Local (Llama 3.2)...
            </ThemedText>
          </View>
        ) : (
          <ThemedText
            type="smallBold"
            style={[{ color: theme.onTint }, voicePromptStyles.synthesizeText]}>
            APLICAR DIRECTIVAS DE VOZ & ACTUALIZAR REPORTE
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}
