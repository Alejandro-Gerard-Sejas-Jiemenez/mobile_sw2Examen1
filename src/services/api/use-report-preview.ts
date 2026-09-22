import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { apiRequestText } from './client';
import { resolveAuditFindings } from './resolve-findings';
import type { Alert, ReportFormat } from './types';
import { auditStore } from './audit-store';
import { IS_MOCK_MODE } from './mock-mode';
import { buildHtmlReport, buildMarkdownReport, type ReportTone } from '../reports/report-synthesizer';
import { isModelDownloaded } from '../ai/model-manager';
import { generateLocalNarrative } from '../ai/llama-inference';
import { calculateRiskAssessment } from '../reports/risk-calculator';
import { scheduleLocalNotification } from '../notifications/schedule-local-notification';
import {
  API_ENDPOINTS,
  NOTIFICATION_SCREENS,
  QUERY_KEYS,
  REPORT_NOTIFY_THRESHOLD_MS,
} from '../../constants/api.constants';

/**
 * GET /audits/{auditId}/report/preview?format=pdf|markdown — a preview of the report.
 * Falls back to on-device Llama synthesis when the backend is offline.
 *
 * FIX: Previously `generateLocalNarrative` was never called — the model was found
 * on disk but `narrativeOverride` was never passed to buildHtmlReport/buildMarkdownReport,
 * so the report always used the heuristic text. Now we call the LLM first when the
 * model is available and forward its output as `narrativeOverride`.
 */
export function useReportPreview(
  auditId: string,
  format: ReportFormat,
  tone: ReportTone = 'executive',
  customPrompt: string = ''
): UseQueryResult<string> {
  const sessionId = auditStore.getAuditById(auditId)?.attackSessionId ?? '';
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...QUERY_KEYS.REPORT_PREVIEW(auditId, format, tone, customPrompt), sessionId],
    queryFn: async () => {
      console.log(
        `[use-report-preview] 🔄 queryFn auditId=${auditId} format=${format} tone=${tone}` +
          ` sessionId=${sessionId || '(none)'}`
      );

      const genStart = Date.now();
      // Fires a "reporte listo" local notification + Alerts-tab entry, but only
      // if this generation actually took a while (the on-device Llama path) —
      // an instant/cached result isn't worth interrupting the auditor for, and
      // this is exactly the case the auditor asked for: leave the report
      // screen while Llama grinds through ~60s of CPU inference, get notified
      // and pulled back to it the moment it's done.
      const notifyReportReady = (content: string): string => {
        const elapsedMs = Date.now() - genStart;
        if (elapsedMs < REPORT_NOTIFY_THRESHOLD_MS) return content;

        const auditName = auditStore.getAuditById(auditId)?.name || `Audit ${auditId}`;
        const message = `${auditName}: el reporte ${format.toUpperCase()} ya está listo.`;
        const alert: Alert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          findingId: '',
          severityLabel: 'INFO',
          deliveredAt: new Date().toISOString(),
          readState: 'unread',
          kind: 'report',
          auditId,
          message,
        };
        auditStore.addAlert(alert);
        void scheduleLocalNotification('Reporte listo', message, {
          route: NOTIFICATION_SCREENS.REPORT_READY,
          auditId,
        });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS });
        return content;
      };

      // ── 1. Intentar reporte remoto (solo fuera de modo mock) ───────────────
      if (IS_MOCK_MODE) {
        console.log('[use-report-preview] 🧪 MOCK MODE — saltando backend remoto, síntesis local directa.');
      } else {
        try {
          console.log(
            `[use-report-preview] 📡 Intentando reporte remoto: GET ${API_ENDPOINTS.reportPreview(auditId, format, tone)}`
          );
          const remote = await apiRequestText(API_ENDPOINTS.reportPreview(auditId, format, tone));
          if (remote && remote.trim().length > 0) {
            console.log(
              `[use-report-preview] ✅ Reporte remoto recibido (${remote.length} chars). Usando backend.`
            );
            return notifyReportReady(remote);
          }
          console.warn('[use-report-preview] ⚠️  Reporte remoto vacío — cayendo a síntesis local.');
        } catch (err) {
          console.warn(
            '[use-report-preview] ⚠️  Backend remoto inalcanzable:',
            (err as Error)?.message ?? err,
            '— cayendo a síntesis local.'
          );
        }
      }

      // ── 2. Síntesis 100 % local ───────────────────────────────────────────
      const audit = auditStore.getAuditById(auditId) || {
        id: auditId,
        name: `Audit ${auditId}`,
        status: 'completed' as const,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        metrics: { requestsSent: 48, pagesScanned: 2 },
        testBatteries: [],
      };

      const findings = await resolveAuditFindings(auditId);
      console.log(
        `[use-report-preview] 📊 Findings resueltos: ${findings.length} hallazgos para auditId=${auditId}`
      );

      const aiStatus = await isModelDownloaded();
      console.log(
        `[use-report-preview] 🤖 Modelo IA local: ${
          aiStatus.exists
            ? `DISPONIBLE (${(aiStatus.sizeBytes / 1024 / 1024).toFixed(1)} MB)`
            : 'NO DISPONIBLE — usará heurístico'
        }`
      );

      // ── 3. Invocar Llama local si el modelo está descargado ───────────────
      let narrativeOverride: string | undefined;
      if (aiStatus.exists) {
        console.log('[use-report-preview] 🧠 Lanzando generateLocalNarrative…');
        const riskAssessment = calculateRiskAssessment(findings, tone, customPrompt, audit.name);
        const narrative = await generateLocalNarrative({
          audit,
          findings,
          overallRiskLevel: riskAssessment.overallRiskLevel,
          riskScore: riskAssessment.riskScore,
          tone,
          auditorDirectives: customPrompt,
        });
        if (narrative) {
          narrativeOverride = narrative;
          console.log(
            `[use-report-preview] ✅ Narrativa IA local generada (${narrative.length} chars).`
          );
        } else {
          console.warn(
            '[use-report-preview] ⚠️  generateLocalNarrative devolvió null — usando heurístico.'
          );
        }
      }

      // ── 4. Construir el reporte con (o sin) narrativa Llama ───────────────
      if (format === 'markdown') {
        console.log('[use-report-preview] 📄 Construyendo reporte MARKDOWN local…');
        return notifyReportReady(
          buildMarkdownReport({
            audit,
            findings,
            isAiLocalActive: aiStatus.exists,
            tone,
            auditorCustomDirectives: customPrompt,
            narrativeOverride,
          })
        );
      }

      console.log('[use-report-preview] 🌐 Construyendo reporte HTML local…');
      return notifyReportReady(
        buildHtmlReport({
          audit,
          findings,
          isAiLocalActive: aiStatus.exists,
          tone,
          auditorCustomDirectives: customPrompt,
          narrativeOverride,
        })
      );
    },
    enabled: auditId.length > 0,
    // The local synthesis path can take ~60s (on-device Llama inference), so
    // an accidental remount (Fast Refresh, navigating away and back, etc.)
    // must NOT silently re-trigger it. Only an explicit `refetch()` (the
    // "Sintetizar" action) or a change in the query key (tone/format/prompt)
    // should generate a new report.
    staleTime: Infinity,
  });
}
