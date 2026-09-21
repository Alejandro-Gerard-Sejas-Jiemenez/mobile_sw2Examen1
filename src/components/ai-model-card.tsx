import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  deleteAiModel,
  downloadAiModel,
  isModelDownloaded,
  TARGET_AI_MODEL,
  type DownloadProgress,
} from '@/services/ai/model-manager';

export function AiModelCard() {
  const theme = useTheme();
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadedMb, setDownloadedMb] = useState<string>('0');

  const checkStatus = async () => {
    setChecking(true);
    const result = await isModelDownloaded();
    setIsDownloaded(result.exists);
    setChecking(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setProgress(0);

      await downloadAiModel((p: DownloadProgress) => {
        setProgress(p.progressPercent);
        const mb = (p.totalBytesWritten / (1024 * 1024)).toFixed(1);
        setDownloadedMb(mb);
      });

      setIsDownloaded(true);
      setDownloading(false);
      Alert.alert('¡Modelo Listo!', `${TARGET_AI_MODEL.name} cargado correctamente en tu dispositivo.`);
    } catch (error) {
      setDownloading(false);
      console.error(error);
      Alert.alert('Error de Descarga', 'No se pudo descargar el modelo. Revisa tu conexión a internet.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Eliminar Modelo',
      '¿Deseas eliminar el modelo local de IA para liberar espacio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteAiModel();
            setIsDownloaded(false);
          },
        },
      ],
    );
  };

  const badgeColor = isDownloaded
    ? theme.success
    : downloading
    ? theme.severityMedium
    : theme.textSecondary;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <ThemedText type="smallBold" style={styles.title}>
            🧠 MODELO IA LOCAL DE REPORTES
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {TARGET_AI_MODEL.name} ({TARGET_AI_MODEL.sizeFormatted})
          </ThemedText>
        </View>

        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <ThemedText type="smallBold" style={{ color: '#FFF', fontSize: 10 }}>
            {isDownloaded ? 'LISTO' : downloading ? 'DESCARGANDO' : 'NO INSTALADO'}
          </ThemedText>
        </View>
      </View>

      {downloading ? (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} color={theme.tint} />
          <View style={styles.progressTextRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {downloadedMb} MB de {TARGET_AI_MODEL.sizeFormatted}
            </ThemedText>

            <ThemedText type="smallBold" themeColor="tint">
              {progress}%
            </ThemedText>
          </View>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        {checking ? (
          <ThemedText type="small" themeColor="textSecondary">
            Verificando modelo local...
          </ThemedText>
        ) : isDownloaded ? (
          <View style={styles.readyRow}>
            <ThemedText type="small" themeColor="success" style={styles.statusText}>
              ✓ Listo para generación de reportes offline
            </ThemedText>
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <ThemedText type="small" themeColor="danger">
                Borrar (Liberar 807MB)
              </ThemedText>
            </Pressable>
          </View>
        ) : !downloading ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleDownload}
            style={({ pressed }) => [
              styles.downloadButton,
              { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
            ]}>
            <ThemedText type="smallBold" style={{ color: '#FFF' }}>
              ⬇ Descargar Modelo IA (807 MB)
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: 12,
    marginVertical: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  title: {
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  progressContainer: {
    marginTop: Spacing.three,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  actionRow: {
    marginTop: Spacing.three,
  },
  readyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  downloadButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});
