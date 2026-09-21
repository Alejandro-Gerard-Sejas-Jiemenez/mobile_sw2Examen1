import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText, ThemedView, VoicePromptInput } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useReportActions } from '@/hooks/use-report-actions';
import {
  useAudits,
  useReportPreview,
  auditStore,
  type ReportFormat,
} from '@/services/api';
import { stripHtml, type ReportTone } from '@/services/reports';
import { reportScreenStyles } from '@/styles';

const FORMATS: ReportFormat[] = ['pdf', 'markdown'];

export default function AuditReportScreen() {
  const { auditId } = useLocalSearchParams<{ auditId: string }>();
  const resolvedAuditId = auditId ?? '';
  const router = useRouter();
  const theme = useTheme();

  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [tone, setTone] = useState<ReportTone>('executive');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const preview = useReportPreview(resolvedAuditId, format, tone, customPrompt);
  const { data: audits } = useAudits();
  const audit =
    audits?.find((a) => a.id === resolvedAuditId) ||
    auditStore.getAuditById(resolvedAuditId);

  const {
    isSynthesizing,
    isGenerating,
    statusMessage,
    errorMessage,
    setErrorMessage,
    setStatusMessage,
    handleSynthesize,
    handlePrintOrSavePdf,
    handleSharePdf,
    handleShareMarkdownFile,
    handleCopyMarkdown,
    handleShareMarkdownText,
  } = useReportActions({
    auditId: resolvedAuditId,
    audit,
    tone,
    customPrompt,
    onRefetchPreview: async () => {
      await preview.refetch();
    },
  });

  const previewText = preview.data
    ? format === 'pdf'
      ? stripHtml(preview.data)
      : preview.data
    : '';

  function selectFormat(next: ReportFormat) {
    if (next === format) return;
    setFormat(next);
    setErrorMessage(null);
    setStatusMessage(null);
  }

  return (
    <ThemedView style={reportScreenStyles.container}>
      <SafeAreaView style={reportScreenStyles.safeArea} edges={['top']}>
        <ThemedView style={reportScreenStyles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            style={({ pressed }) => [reportScreenStyles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="smallBold" themeColor="tint">
              Volver
            </ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={reportScreenStyles.headerTitle}>
            REPORTE EJECUTIVO
          </ThemedText>
        </ThemedView>

        <View style={reportScreenStyles.formatToggleRow}>
          {FORMATS.map((option) => {
            const isSelected = format === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`${option} format`}
                onPress={() => selectFormat(option)}
                style={({ pressed }) => [
                  reportScreenStyles.formatButton,
                  {
                    backgroundColor: isSelected ? theme.tint : theme.backgroundElement,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: isSelected ? theme.onTint : theme.text }}>
                  {option === 'pdf' ? 'DOCUMENTO PDF' : 'MARKDOWN (.MD)'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {/* AI Engine Status Badges */}
        <View style={reportScreenStyles.aiBadgesRow}>
          <View style={[reportScreenStyles.aiBadge, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold" style={{ fontSize: 10, color: theme.tint }}>
              Memoria Persistente
            </ThemedText>
          </View>
          <View style={[reportScreenStyles.aiBadge, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold" style={{ fontSize: 10, color: theme.tint }}>
              Vector RAG Activo
            </ThemedText>
          </View>
          <View style={[reportScreenStyles.aiBadge, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold" style={{ fontSize: 10, color: theme.tint }}>
              System Prompt Inmutable
            </ThemedText>
          </View>
        </View>

        <ScrollView style={reportScreenStyles.previewScroll} contentContainerStyle={reportScreenStyles.previewContent}>
          <VoicePromptInput
            value={customPrompt}
            onChangeText={setCustomPrompt}
            selectedTone={tone}
            onSelectTone={setTone}
            onSynthesize={handleSynthesize}
            isSynthesizing={isSynthesizing || preview.isFetching}
          />

          {preview.isLoading ? (
            <ThemedText type="small" themeColor="textSecondary" style={reportScreenStyles.centerMessage}>
              Cargando previsualizacion con IA...
            </ThemedText>
          ) : preview.isError ? (
            <ThemedText type="small" themeColor="danger" style={reportScreenStyles.centerMessage}>
              No se pudo cargar la vista previa. Utiliza los botones de abajo para exportar.
            </ThemedText>
          ) : (
            <ThemedView type="backgroundElement" style={reportScreenStyles.previewCard}>
              <ThemedText type="small" themeColor="textSecondary" style={reportScreenStyles.previewHint}>
                Vista previa del contenido ({format.toUpperCase()}):
              </ThemedText>
              <ThemedText type="default" style={reportScreenStyles.previewBodyText}>
                {previewText}
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        {statusMessage ? (
          <ThemedText type="small" themeColor="tint" style={reportScreenStyles.statusLine}>
            {statusMessage}
          </ThemedText>
        ) : null}

        {errorMessage ? (
          <ThemedText type="small" themeColor="danger" style={reportScreenStyles.statusLine}>
            {errorMessage}
          </ThemedText>
        ) : null}

        <View style={reportScreenStyles.actionsRow}>
          {format === 'pdf' ? (
            <View style={reportScreenStyles.buttonGroup}>
              <Pressable
                accessibilityRole="button"
                disabled={isGenerating}
                onPress={handlePrintOrSavePdf}
                style={({ pressed }) => [
                  reportScreenStyles.primaryActionButton,
                  { backgroundColor: theme.tint, opacity: isGenerating || pressed ? 0.7 : 1 },
                ]}>
                {isGenerating ? (
                  <ActivityIndicator color={theme.onTint} size="small" />
                ) : (
                  <ThemedText type="smallBold" style={{ color: theme.onTint, fontSize: 14 }}>
                    GUARDAR / IMPRIMIR PDF EN MOVIL
                  </ThemedText>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isGenerating}
                onPress={handleSharePdf}
                style={({ pressed }) => [
                  reportScreenStyles.secondaryActionButton,
                  { backgroundColor: theme.backgroundSelected, opacity: isGenerating || pressed ? 0.7 : 1 },
                ]}>
                <ThemedText type="smallBold" style={{ fontSize: 13 }}>
                  Compartir PDF (WhatsApp / Correo / Drive)
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={reportScreenStyles.buttonGroup}>
              <Pressable
                accessibilityRole="button"
                disabled={isGenerating}
                onPress={handleShareMarkdownFile}
                style={({ pressed }) => [
                  reportScreenStyles.primaryActionButton,
                  { backgroundColor: theme.tint, opacity: isGenerating || pressed ? 0.7 : 1 },
                ]}>
                {isGenerating ? (
                  <ActivityIndicator color={theme.onTint} size="small" />
                ) : (
                  <ThemedText type="smallBold" style={{ color: theme.onTint, fontSize: 14 }}>
                    EXPORTAR ARCHIVO .MD (Adjunto)
                  </ThemedText>
                )}
              </Pressable>

              <View style={reportScreenStyles.twoButtonsRow}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isGenerating}
                  onPress={handleCopyMarkdown}
                  style={({ pressed }) => [
                    reportScreenStyles.flexHalfButton,
                    { backgroundColor: theme.backgroundSelected, opacity: isGenerating || pressed ? 0.7 : 1 },
                  ]}>
                  <ThemedText type="smallBold" style={{ fontSize: 12 }}>
                    Copiar Texto
                  </ThemedText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={isGenerating}
                  onPress={handleShareMarkdownText}
                  style={({ pressed }) => [
                    reportScreenStyles.flexHalfButton,
                    { backgroundColor: theme.backgroundSelected, opacity: isGenerating || pressed ? 0.7 : 1 },
                  ]}>
                  <ThemedText type="smallBold" style={{ fontSize: 12 }}>
                    Compartir Texto
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
