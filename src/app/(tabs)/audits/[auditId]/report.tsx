import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as Clipboard from 'expo-clipboard';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAudits } from '@/services/api/use-audits';
import { useReportPreview } from '@/services/api/use-report-preview';
import type { ReportFormat } from '@/services/api/types';
import { generateReportMarkdown } from '@/services/reports/generate-markdown';
import { generateReportPdf } from '@/services/reports/generate-pdf';
import { auditStore } from '@/services/api/audit-store';
import { buildHtmlReport, buildMarkdownReport, type ReportTone } from '@/services/reports/report-synthesizer';
import { isModelDownloaded } from '@/services/ai/model-manager';
import { VoicePromptInput } from '@/components/voice-prompt-input';

const FORMATS: ReportFormat[] = ['pdf', 'markdown'];

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export default function AuditReportScreen() {
  const { auditId } = useLocalSearchParams<{ auditId: string }>();
  const resolvedAuditId = auditId ?? '';
  const router = useRouter();
  const theme = useTheme();

  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [tone, setTone] = useState<ReportTone>('executive');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const preview = useReportPreview(resolvedAuditId, format, tone, customPrompt);
  const { data: audits } = useAudits();
  const audit = audits?.find((a) => a.id === resolvedAuditId) || auditStore.getAuditById(resolvedAuditId);

  const previewText = preview.data ? (format === 'pdf' ? stripHtml(preview.data) : preview.data) : '';

  function selectFormat(next: ReportFormat) {
    if (next === format) return;
    setFormat(next);
    setErrorMessage(null);
    setStatusMessage(null);
  }

  async function getReportContent(
    selectedTone: ReportTone = tone,
    directives: string = customPrompt
  ): Promise<{ html: string; markdown: string }> {
    const findings = auditStore.getFindings(resolvedAuditId);
    const aiStatus = await isModelDownloaded();
    const fallbackAudit = audit || {
      id: resolvedAuditId,
      name: `Audit ${resolvedAuditId}`,
      status: 'completed' as const,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      metrics: { requestsSent: 48, pagesScanned: 2 },
      testBatteries: [],
    };

    const html = buildHtmlReport({
      audit: fallbackAudit,
      findings,
      isAiLocalActive: aiStatus.exists,
      tone: selectedTone,
      auditorCustomDirectives: directives,
    });
    const markdown = buildMarkdownReport({
      audit: fallbackAudit,
      findings,
      isAiLocalActive: aiStatus.exists,
      tone: selectedTone,
      auditorCustomDirectives: directives,
    });
    return { html, markdown };
  }

  async function handleSynthesize() {
    setIsSynthesizing(true);
    setErrorMessage(null);
    setStatusMessage('🧠 Re-sintetizando informe con IA local...');
    try {
      await preview.refetch();
      setStatusMessage('✅ Reporte actualizado con el tono y directivas dictadas.');
    } catch {
      setErrorMessage('No se pudo re-sintetizar el reporte.');
    } finally {
      setIsSynthesizing(false);
    }
  }

  /**
   * Option 1: Native Print / Save to PDF directly into Android's Downloads / Drive
   */
  async function handlePrintOrSavePdf() {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage('Abriendo diálogo del sistema para Guardar PDF / Imprimir...');

    try {
      const { html } = await getReportContent(tone, customPrompt);
      await Print.printAsync({ html });
      setStatusMessage('✅ Ventana de impresión / Guardado en PDF ejecutada.');
    } catch (err: any) {
      console.error('[report] Print error:', err);
      setErrorMessage(err?.message || 'No se pudo abrir el diálogo de impresión.');
    } finally {
      setIsGenerating(false);
    }
  }

  /**
   * Option 2: Share PDF via WhatsApp, Gmail, Slack, Drive
   */
  async function handleSharePdf() {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage('Preparando archivo PDF...');

    try {
      const { html } = await getReportContent(tone, customPrompt);
      const fileUri = await generateReportPdf(html);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir Reporte Ejecutivo PDF',
        });
        setStatusMessage('✅ Menú de compartir ejecutado con éxito.');
      } else {
        setStatusMessage(`✅ PDF guardado en: ${fileUri}`);
        Alert.alert('Reporte PDF', `Guardado en:\n${fileUri}`);
      }
    } catch (err: any) {
      console.error('[report] Share PDF error:', err);
      setErrorMessage(err?.message || 'Error al exportar el PDF.');
    } finally {
      setIsGenerating(false);
    }
  }

  /**
   * Option 3: Share Markdown as attached .md file
   */
  async function handleShareMarkdownFile() {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage('Generando archivo .md...');

    try {
      const { markdown } = await getReportContent(tone, customPrompt);
      const filename = `reporte-auditoria-${resolvedAuditId}-${Date.now()}.md`;
      const fileUri = await generateReportMarkdown(markdown, filename);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Compartir Archivo Markdown (.md)',
        });
        setStatusMessage('✅ Archivo Markdown exportado con éxito.');
      } else {
        await Share.share({
          title: `Reporte Ejecutivo Markdown`,
          message: markdown,
        });
      }
    } catch (err: any) {
      console.error('[report] Share Markdown error:', err);
      setErrorMessage(err?.message || 'Error al exportar archivo Markdown.');
    } finally {
      setIsGenerating(false);
    }
  }

  /**
   * Option 4: Copy Markdown text to clipboard
   */
  async function handleCopyMarkdown() {
    try {
      const { markdown } = await getReportContent(tone, customPrompt);
      await Clipboard.setStringAsync(markdown);
      setStatusMessage('✅ ¡Texto Markdown copiado al portapapeles!');
      Alert.alert('Copiado', 'El contenido en Markdown se ha copiado al portapapeles. Puedes pegarlo en GitHub, Notion o notas.');
    } catch (err: any) {
      setErrorMessage('No se pudo copiar al portapapeles.');
    }
  }

  /**
   * Option 5: Share Markdown as message text
   */
  async function handleShareMarkdownText() {
    try {
      const { markdown } = await getReportContent(tone, customPrompt);
      await Share.share({
        title: `Reporte Ejecutivo Markdown - ${audit?.name || 'LLM'}`,
        message: markdown,
      });
      setStatusMessage('✅ Texto Markdown compartido.');
    } catch (err: any) {
      setErrorMessage('Error al compartir texto.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="smallBold" themeColor="tint">
              ← Volver
            </ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            REPORTE EJECUTIVO
          </ThemedText>
        </ThemedView>

        <View style={styles.formatToggleRow}>
          {FORMATS.map((option) => {
            const isSelected = format === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`${option} format`}
                onPress={() => selectFormat(option)}
                style={({ pressed }) => [
                  styles.formatButton,
                  {
                    backgroundColor: isSelected ? theme.tint : theme.backgroundElement,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: isSelected ? theme.onTint : theme.text }}>
                  {option === 'pdf' ? '📄 DOCUMENTO PDF' : '📝 MARKDOWN (.MD)'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ScrollView style={styles.previewScroll} contentContainerStyle={styles.previewContent}>
          <VoicePromptInput
            value={customPrompt}
            onChangeText={setCustomPrompt}
            selectedTone={tone}
            onSelectTone={setTone}
            onSynthesize={handleSynthesize}
            isSynthesizing={isSynthesizing || preview.isFetching}
          />

          {preview.isLoading ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerMessage}>
              Cargando previsualización con IA…
            </ThemedText>
          ) : preview.isError ? (
            <ThemedText type="small" themeColor="danger" style={styles.centerMessage}>
              No se pudo cargar la vista previa. Utiliza los botones de abajo para exportar.
            </ThemedText>
          ) : (
            <ThemedView type="backgroundElement" style={styles.previewCard}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.previewHint}>
                Vista previa del contenido ({format.toUpperCase()}):
              </ThemedText>
              <ThemedText type="default" style={styles.previewBodyText}>
                {previewText}
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        {statusMessage ? (
          <ThemedText type="small" themeColor="tint" style={styles.statusLine}>
            {statusMessage}
          </ThemedText>
        ) : null}

        {errorMessage ? (
          <ThemedText type="small" themeColor="danger" style={styles.statusLine}>
            {errorMessage}
          </ThemedText>
        ) : null}

        <View style={styles.actionsRow}>
          {format === 'pdf' ? (
            <View style={styles.buttonGroup}>
              <Pressable
                accessibilityRole="button"
                disabled={isGenerating}
                onPress={handlePrintOrSavePdf}
                style={({ pressed }) => [
                  styles.primaryActionButton,
                  { backgroundColor: theme.tint, opacity: isGenerating || pressed ? 0.7 : 1 },
                ]}>
                {isGenerating ? (
                  <ActivityIndicator color={theme.onTint} size="small" />
                ) : (
                  <ThemedText type="smallBold" style={{ color: theme.onTint, fontSize: 14 }}>
                    📥 GUARDAR / IMPRIMIR PDF EN MÓVIL
                  </ThemedText>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isGenerating}
                onPress={handleSharePdf}
                style={({ pressed }) => [
                  styles.secondaryActionButton,
                  { backgroundColor: theme.backgroundSelected, opacity: isGenerating || pressed ? 0.7 : 1 },
                ]}>
                <ThemedText type="smallBold" style={{ fontSize: 13 }}>
                  📱 Compartir PDF (WhatsApp / Correo / Drive)
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.buttonGroup}>
              <Pressable
                accessibilityRole="button"
                disabled={isGenerating}
                onPress={handleShareMarkdownFile}
                style={({ pressed }) => [
                  styles.primaryActionButton,
                  { backgroundColor: theme.tint, opacity: isGenerating || pressed ? 0.7 : 1 },
                ]}>
                {isGenerating ? (
                  <ActivityIndicator color={theme.onTint} size="small" />
                ) : (
                  <ThemedText type="smallBold" style={{ color: theme.onTint, fontSize: 14 }}>
                    📁 EXPORTAR ARCHIVO .MD (Adjunto)
                  </ThemedText>
                )}
              </Pressable>

              <View style={styles.secondaryBtnRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleCopyMarkdown}
                  style={({ pressed }) => [
                    styles.halfButton,
                    { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <ThemedText type="smallBold" style={{ fontSize: 12 }}>
                    📋 Copiar Markdown
                  </ThemedText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleShareMarkdownText}
                  style={({ pressed }) => [
                    styles.halfButton,
                    { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <ThemedText type="smallBold" style={{ fontSize: 12 }}>
                    📱 Enviar Texto
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  backBtn: {
    paddingVertical: Spacing.one,
    paddingRight: Spacing.two,
  },
  headerTitle: {
    letterSpacing: 0.5,
  },
  formatToggleRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  formatButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMessage: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  previewScroll: {
    flex: 1,
  },
  previewContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  previewCard: {
    borderRadius: 8,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  previewHint: {
    marginBottom: Spacing.one,
  },
  previewBodyText: {
    lineHeight: 20,
  },
  statusLine: {
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    fontSize: 13,
  },
  actionsRow: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  buttonGroup: {
    gap: Spacing.two,
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  halfButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionButton: {
    borderRadius: 10,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionButton: {
    borderRadius: 10,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
