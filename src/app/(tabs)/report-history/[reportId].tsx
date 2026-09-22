import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';

import { ThemedText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useSavedReport, useDeleteSavedReport } from '@/hooks/use-saved-reports';
import { generateReportMarkdown, generateReportPdf } from '@/services/reports/report-synthesizer';
import { reportHistoryStyles } from '@/styles';

export default function SavedReportDetailScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const resolvedReportId = reportId ?? '';
  const handleBack = useSafeBack('/(tabs)/report-history');
  const theme = useTheme();
  const { data: report, isLoading, isError } = useSavedReport(resolvedReportId);
  const deleteReportMutation = useDeleteSavedReport();
  const [isSharing, setIsSharing] = useState(false);

  const handleShareMarkdown = async () => {
    if (!report) return;
    setIsSharing(true);
    try {
      const filename = `reporte-auditoria-${report.auditId}-${Date.now()}.md`;
      const fileUri = await generateReportMarkdown(report.contentMarkdown, filename);
      await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Compartir Reporte Guardado (.md)' });
    } catch (err) {
      Alert.alert('Error', 'No se pudo compartir el archivo Markdown.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSharePdf = async () => {
    if (!report) return;
    setIsSharing(true);
    try {
      const fileUri = await generateReportPdf(report.contentHtml);
      await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf', dialogTitle: 'Compartir Reporte Guardado (PDF)' });
    } catch (err) {
      Alert.alert('Error', 'No se pudo compartir el PDF.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar reporte', '¿Eliminar este reporte guardado? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteReportMutation.mutate(resolvedReportId, { onSuccess: handleBack });
        },
      },
    ]);
  };

  return (
    <ThemedView style={reportHistoryStyles.container}>
      <SafeAreaView style={reportHistoryStyles.safeArea} edges={['top', 'bottom']}>
        <ThemedView style={reportHistoryStyles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={handleBack}
            style={({ pressed }) => [reportHistoryStyles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="chevron-back" size={22} color={theme.tint} />
          </Pressable>
          <ThemedText type="subtitle" style={reportHistoryStyles.headerTitle} numberOfLines={1}>
            REPORTE GUARDADO
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Eliminar reporte"
            onPress={handleDelete}
            style={({ pressed }) => [reportHistoryStyles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
          </Pressable>
        </ThemedView>

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={reportHistoryStyles.centerMessage}>
            Cargando reporte...
          </ThemedText>
        ) : isError || !report ? (
          <ThemedText type="small" themeColor="danger" style={reportHistoryStyles.centerMessage}>
            No se pudo cargar este reporte. Puede haber sido eliminado.
          </ThemedText>
        ) : (
          <>
            <ScrollView contentContainerStyle={reportHistoryStyles.detailContent}>
              <ThemedView type="backgroundElement" style={reportHistoryStyles.metaCard}>
                <ThemedText type="smallBold">{report.auditName.toUpperCase()}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Tono: {report.tone.toUpperCase()} · Riesgo: {report.riskLevel} ({report.riskScore.toFixed(1)}/10)
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {report.findingsCount} hallazgos · Generado el {new Date(report.generatedAt).toLocaleString()}
                </ThemedText>
              </ThemedView>

              <ThemedText type="default" style={reportHistoryStyles.bodyText}>
                {report.contentMarkdown}
              </ThemedText>
            </ScrollView>

            <View style={reportHistoryStyles.actionsRow}>
              <Pressable
                accessibilityRole="button"
                disabled={isSharing}
                onPress={handleShareMarkdown}
                style={({ pressed }) => [
                  reportHistoryStyles.actionButton,
                  { backgroundColor: theme.backgroundSelected, opacity: isSharing || pressed ? 0.7 : 1 },
                ]}>
                {isSharing ? (
                  <ActivityIndicator color={theme.text} size="small" />
                ) : (
                  <ThemedText type="smallBold">Compartir .MD</ThemedText>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSharing}
                onPress={handleSharePdf}
                style={({ pressed }) => [
                  reportHistoryStyles.actionButton,
                  { backgroundColor: theme.tint, opacity: isSharing || pressed ? 0.7 : 1 },
                ]}>
                {isSharing ? (
                  <ActivityIndicator color={theme.onTint} size="small" />
                ) : (
                  <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                    Compartir PDF
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
