import { useState, useCallback } from 'react';
import { Alert, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as Clipboard from 'expo-clipboard';
import type { Audit } from '@/services/api/types';
import { getAuditorSession } from '@/services/auth/session-context';
import { resolveAuditFindings } from '@/services/api/resolve-findings';
import { isModelDownloaded } from '@/services/ai/model-manager';
import { generateLocalNarrative } from '@/services/ai/llama-inference';
import {
  buildHtmlReport,
  buildMarkdownReport,
  calculateRiskAssessment,
  generateReportMarkdown,
  generateReportPdf,
  saveReport,
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
      const findings = await resolveAuditFindings(auditId);
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

      // Deterministic score/narrative first (always succeeds, never depends on the
      // model). If the on-device Llama model is downloaded, ask it to redraft ONLY
      // the narrative paragraph, grounded in this already-computed score/findings —
      // it never invents the numbers. Falls back to the template narrative above on
      // any failure or timeout (`generateLocalNarrative` never throws).
      const diagnosis = calculateRiskAssessment(findings, selectedTone, directives, fallbackAudit.name);
      const narrativeOverride = aiStatus.exists
        ? await generateLocalNarrative({
            audit: fallbackAudit,
            findings,
            overallRiskLevel: diagnosis.overallRiskLevel,
            riskScore: diagnosis.riskScore,
            tone: selectedTone,
            auditorDirectives: directives,
          })
        : null;

      const html = buildHtmlReport({
        audit: fallbackAudit,
        findings,
        isAiLocalActive: aiStatus.exists,
        tone: selectedTone,
        auditorCustomDirectives: directives,
        narrativeOverride: narrativeOverride ?? undefined,
      });

      const markdown = buildMarkdownReport({
        audit: fallbackAudit,
        findings,
        isAiLocalActive: aiStatus.exists,
        tone: selectedTone,
        auditorCustomDirectives: directives,
        narrativeOverride: narrativeOverride ?? undefined,
      });

      // Persist a snapshot to the local reports DB so it can be browsed later
      // (Historial de Reportes). Never let a DB failure break the actual
      // export/share action the user asked for.
      try {
        const auditor = getAuditorSession()?.auditor;
        await saveReport({
          auditId,
          auditName: fallbackAudit.name,
          tone: selectedTone,
          riskLevel: diagnosis.overallRiskLevel,
          riskScore: diagnosis.riskScore,
          findingsCount: findings.length,
          contentHtml: html,
          contentMarkdown: markdown,
          userId: auditor?.id ?? auditor?.auditorId ?? null,
        });
      } catch (err) {
        console.warn('[useReportActions] Failed to save report to local DB:', err);
      }

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
