import { useState, useCallback } from 'react';
import { Alert, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as Clipboard from 'expo-clipboard';
import type { Audit } from '@/services/api/types';
import { auditStore } from '@/services/api/audit-store';
import { isModelDownloaded } from '@/services/ai/model-manager';
import {
  buildHtmlReport,
  buildMarkdownReport,
  generateReportMarkdown,
  generateReportPdf,
  type ReportTone,
} from '@/services/reports/report-synthesizer';
import { ReportError } from '@/errors/report-error';

export interface UseReportActionsProps {
  auditId: string;
  audit?: Audit;
  tone: ReportTone;
  customPrompt: string;
  onRefetchPreview?: () => Promise<unknown>;
}

export function useReportActions({
  auditId,
  audit,
  tone,
  customPrompt,
  onRefetchPreview,
}: UseReportActionsProps) {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getReportContent = useCallback(
    async (
      selectedTone: ReportTone = tone,
      directives: string = customPrompt
    ): Promise<{ html: string; markdown: string }> => {
      const findings = auditStore.getFindings(auditId);
      const aiStatus = await isModelDownloaded();
      const fallbackAudit: Audit = audit || {
        id: auditId,
        name: `Audit ${auditId}`,
        status: 'completed',
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
    },
    [auditId, audit, tone, customPrompt]
  );

  const handleSynthesize = useCallback(async () => {
    setIsSynthesizing(true);
    setErrorMessage(null);
    setStatusMessage('Re-sintetizando informe con IA local...');
    try {
      if (onRefetchPreview) {
        await onRefetchPreview();
      }
      setStatusMessage('Reporte actualizado con el tono y directivas dictadas.');
    } catch (err) {
      const reportErr = new ReportError(
        'REPORT_SYNTHESIS_FAILED',
        'No se pudo re-sintetizar el reporte.',
        { cause: err }
      );
      setErrorMessage(reportErr.message);
    } finally {
      setIsSynthesizing(false);
    }
  }, [onRefetchPreview]);

  const handlePrintOrSavePdf = useCallback(async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage('Abriendo diálogo del sistema para Guardar PDF / Imprimir...');

    try {
      const { html } = await getReportContent(tone, customPrompt);
      await Print.printAsync({ html });
      setStatusMessage('Ventana de impresión / Guardado en PDF ejecutada.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo abrir el diálogo de impresión.';
      console.error('[useReportActions] Print error:', err);
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [getReportContent, tone, customPrompt]);

  const handleSharePdf = useCallback(async () => {
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
        setStatusMessage('Menú de compartir ejecutado con éxito.');
      } else {
        setStatusMessage(`PDF guardado en: ${fileUri}`);
        Alert.alert('Reporte PDF', `Guardado en:\n${fileUri}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al exportar el PDF.';
      console.error('[useReportActions] Share PDF error:', err);
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [getReportContent, tone, customPrompt]);

  const handleShareMarkdownFile = useCallback(async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage('Generando archivo .md...');

    try {
      const { markdown } = await getReportContent(tone, customPrompt);
      const filename = `reporte-auditoria-${auditId}-${Date.now()}.md`;
      const fileUri = await generateReportMarkdown(markdown, filename);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Compartir Archivo Markdown (.md)',
        });
        setStatusMessage('Archivo Markdown exportado con éxito.');
      } else {
        await Share.share({
          title: `Reporte Ejecutivo Markdown`,
          message: markdown,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al exportar archivo Markdown.';
      console.error('[useReportActions] Share Markdown error:', err);
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [getReportContent, auditId, tone, customPrompt]);

  const handleCopyMarkdown = useCallback(async () => {
    try {
      const { markdown } = await getReportContent(tone, customPrompt);
      await Clipboard.setStringAsync(markdown);
      setStatusMessage('¡Texto Markdown copiado al portapapeles!');
      Alert.alert(
        'Copiado',
        'El contenido en Markdown se ha copiado al portapapeles. Puedes pegarlo en GitHub, Notion o notas.'
      );
    } catch {
      setErrorMessage('No se pudo copiar al portapapeles.');
    }
  }, [getReportContent, tone, customPrompt]);

  const handleShareMarkdownText = useCallback(async () => {
    try {
      const { markdown } = await getReportContent(tone, customPrompt);
      await Share.share({
        title: `Reporte Ejecutivo Markdown - ${audit?.name || 'LLM'}`,
        message: markdown,
      });
      setStatusMessage('Texto Markdown compartido.');
    } catch {
      setErrorMessage('Error al compartir texto.');
    }
  }, [getReportContent, audit?.name, tone, customPrompt]);

  return {
    isSynthesizing,
    isGenerating,
    statusMessage,
    errorMessage,
    setErrorMessage,
    setStatusMessage,
    getReportContent,
    handleSynthesize,
    handlePrintOrSavePdf,
    handleSharePdf,
    handleShareMarkdownFile,
    handleCopyMarkdown,
    handleShareMarkdownText,
  };
}
