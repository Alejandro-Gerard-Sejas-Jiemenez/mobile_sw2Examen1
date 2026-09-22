import React from 'react';
import { Pressable, View } from 'react-native';

import { ProgressBar } from '../ui/progress-bar';
import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { MODEL_STATUS_LABELS } from '@/constants/ai.constants';
import { commonStyles, layoutStyles, modelCardStyles } from '@/styles';
import type { ModelInfo } from '@/services/ai/model-manager';

export interface AiModelCardProps {
  title: string;
  /** Shown once the model is downloaded and ready — describes what it unlocks. */
  readyDescription: string;
  isDownloaded: boolean;
  checking: boolean;
  downloading: boolean;
  progress: number;
  downloadedMb: string;
  targetModel: ModelInfo;
  handleDownload: () => void;
  handleDelete: () => void;
}

/** Generic card for any on-device model (Llama narrative model, Whisper voice
 *  model, ...) — the caller owns the manager hook and passes its state down,
 *  so this component stays presentation-only and reusable across models. */
export function AiModelCard({
  title,
  readyDescription,
  isDownloaded,
  checking,
  downloading,
  progress,
  downloadedMb,
  targetModel,
  handleDownload,
  handleDelete,
}: AiModelCardProps) {
  const theme = useTheme();

  const badgeColor = isDownloaded
    ? theme.success
    : downloading
    ? theme.severityMedium
    : theme.textSecondary;

  const badgeLabel = isDownloaded
    ? MODEL_STATUS_LABELS.READY
    : downloading
    ? MODEL_STATUS_LABELS.DOWNLOADING
    : MODEL_STATUS_LABELS.NOT_INSTALLED;

  return (
    <ThemedView
      type="backgroundElement"
      style={[commonStyles.card, modelCardStyles.container]}>
      <View style={layoutStyles.rowBetweenTop}>
        <View style={layoutStyles.flex1}>
          <ThemedText type="smallBold" style={modelCardStyles.title}>
            {title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {targetModel.name} ({targetModel.sizeFormatted})
          </ThemedText>
        </View>

        <View style={[commonStyles.badge, { backgroundColor: badgeColor }]}>
          <ThemedText type="smallBold" style={modelCardStyles.badgeText}>
            {badgeLabel}
          </ThemedText>
        </View>
      </View>

      {downloading ? (
        <View style={modelCardStyles.progressContainer}>
          <ProgressBar progress={progress} color={theme.tint} />
          <View style={[layoutStyles.rowBetween, modelCardStyles.progressRow]}>
            <ThemedText type="small" themeColor="textSecondary">
              {downloadedMb} MB de {targetModel.sizeFormatted}
            </ThemedText>

            <ThemedText type="smallBold" themeColor="tint">
              {progress}%
            </ThemedText>
          </View>
        </View>
      ) : null}

      <View style={modelCardStyles.footer}>
        {checking ? (
          <ThemedText type="small" themeColor="textSecondary">
            Verificando modelo local...
          </ThemedText>
        ) : isDownloaded ? (
          <View style={layoutStyles.rowBetween}>
            <ThemedText type="small" themeColor="success" style={modelCardStyles.statusText}>
              {readyDescription}
            </ThemedText>
            <Pressable onPress={handleDelete} style={modelCardStyles.deleteButton}>
              <ThemedText type="small" themeColor="danger">
                Borrar (Liberar {targetModel.sizeFormatted})
              </ThemedText>
            </Pressable>
          </View>
        ) : !downloading ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleDownload}
            style={({ pressed }) => [
              commonStyles.buttonPrimary,
              modelCardStyles.downloadButton,
              {
                backgroundColor: theme.tint,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <ThemedText type="smallBold" style={modelCardStyles.downloadButtonText}>
              Descargar Modelo ({targetModel.sizeFormatted})
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </ThemedView>
  );
}
