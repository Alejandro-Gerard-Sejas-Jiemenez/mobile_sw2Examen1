import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText, ThemedView, VoicePromptInput } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { useReportActions } from '@/hooks/use-report-actions';
import { useSafeBack } from '@/hooks/use-safe-back';
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
  const handleBack = useSafeBack('/(tabs)');
  const theme = useTheme();

  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [tone, setTone] = useState<ReportTone>('executive');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [voiceExpanded, setVoiceExpanded] = useState(false);

  // `tone`/`customPrompt` above are the LIVE draft (bound to the tone chips
  // and the voice/text input as the auditor edits them). `appliedTone`/
  // `appliedPrompt` are what actually feeds `useReportPreview`'s query key —
  // they only change when the auditor presses "Aplicar directivas de voz &
  // actualizar reporte". Wiring the live draft straight into the query key
  // would fire a brand-new ~60s on-device Llama generation on every keystroke.
  const [appliedTone, setAppliedTone] = useState<ReportTone>('executive');
  const [appliedPrompt, setAppliedPrompt] = useState<string>('');

  const preview = useReportPreview(resolvedAuditId, format, appliedTone, appliedPrompt);
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
      if (tone === appliedTone && customPrompt === appliedPrompt) {
        // Nothing changed — the auditor wants a fresh regeneration of the
        // exact same request, so force it explicitly.
        await preview.refetch();
      } else {
        // Committing a new tone/prompt changes the query key, which makes
        // React Query fetch it automatically — no explicit refetch() needed
        // (calling it here would race against the still-current query).
        setAppliedTone(tone);
        setAppliedPrompt(customPrompt);
      }
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
      <SafeAreaView style={reportScreenStyles.safeArea} edges={['top', 'bottom']}>
        {/* ── Header ── */}
        <ThemedView style={reportScreenStyles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={handleBack}
            style={({ pressed }) => [reportScreenStyles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="chevron-back" size={22} color={theme.tint} />
          </Pressable>
          <ThemedText type="subtitle" style={reportScreenStyles.headerTitle}>
            REPORTE EJECUTIVO
          </ThemedText>
        </ThemedView>

        {/* ── Formato PDF / MD ── */}
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
                  {option === 'pdf' ? 'PDF' : 'MARKDOWN'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ScrollView style={reportScreenStyles.previewScroll} contentContainerStyle={reportScreenStyles.previewContent}>

          {/* ── Copilot IA — colapsable para no pesar la pantalla por defecto ── */}
          <Pressable
            onPress={() => setVoiceExpanded((v) => !v)}
            style={[reportScreenStyles.voiceToggle, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">Copilot IA</ThemedText>
            <Ionicons
              name={voiceExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.textSecondary}
            />
          </Pressable>

          {voiceExpanded ? (
            <VoicePromptInput
              value={customPrompt}
              onChangeText={setCustomPrompt}
              selectedTone={tone}
              onSelectTone={setTone}
              onSynthesize={handleSynthesize}
              isSynthesizing={isSynthesizing || preview.isFetching}
            />
          ) : null}

          {/* ── Vista previa ── */}
          {preview.isLoading ? (
            <ThemedText type="small" themeColor="textSecondary" style={reportScreenStyles.centerMessage}>
              Cargando vista previa…
            </ThemedText>
          ) : preview.isError ? (
            <ThemedText type="small" themeColor="danger" style={reportScreenStyles.centerMessage}>
              No se pudo cargar la vista previa.
            </ThemedText>
          ) : (
            <ThemedView type="backgroundElement" style={reportScreenStyles.previewCard}>
              <ThemedText type="small" themeColor="textSecondary" style={reportScreenStyles.previewHint}>
                Vista previa ({format.toUpperCase()}):
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

        {/* ── Acciones ── */}
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
                  <ThemedText type="smallBold" style={[reportScreenStyles.actionButtonTextLg, { color: theme.onTint }]}>
                    Guardar / Imprimir PDF
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
                <ThemedText type="smallBold" style={reportScreenStyles.actionButtonTextMd}>
                  Compartir PDF
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
                  <ThemedText type="smallBold" style={[reportScreenStyles.actionButtonTextLg, { color: theme.onTint }]}>
                    Exportar .MD
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
                  <ThemedText type="smallBold" style={reportScreenStyles.actionButtonTextSm}>
                    Copiar
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
                  <ThemedText type="smallBold" style={reportScreenStyles.actionButtonTextSm}>
                    Compartir
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
