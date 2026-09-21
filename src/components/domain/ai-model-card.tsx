import React from 'react';
import { Pressable, View } from 'react-native';

import { ProgressBar } from '../ui/progress-bar';
import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAiModelManager } from '@/hooks/use-ai-model-manager';
import { MODEL_STATUS_LABELS } from '@/constants/ai.constants';
import { commonStyles, layoutStyles, modelCardStyles } from '@/styles';

export function AiModelCard() {
  const theme = useTheme();
  const {
    isDownloaded,
    checking,
    downloading,
    progress,
    downloadedMb,
    targetModel,
    handleDownload,
    handleDelete,
  } = useAiModelManager();

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
            MODELO IA LOCAL DE REPORTES
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
              Disponible para generación de reportes offline
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
              Descargar Modelo IA ({targetModel.sizeFormatted})
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </ThemedView>
  );
}
