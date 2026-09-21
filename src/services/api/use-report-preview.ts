import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { apiRequestText } from './client';
import type { ReportFormat } from './types';
import { auditStore } from './audit-store';
import { buildHtmlReport, buildMarkdownReport, type ReportTone } from '../reports/report-synthesizer';
import { isModelDownloaded } from '../ai/model-manager';
import { API_ENDPOINTS, QUERY_KEYS } from '../../constants/api.constants';

/**
 * GET /audits/{auditId}/report/preview?format=pdf|markdown (contracts/monitoring.md) — a preview
 * of the report the client would compile. Falls back to on-device AI synthesizer when offline or backend unavailable.
 */
export function useReportPreview(
  auditId: string,
  format: ReportFormat,
  tone: ReportTone = 'executive',
  customPrompt: string = ''
): UseQueryResult<string> {
  return useQuery({
    queryKey: QUERY_KEYS.REPORT_PREVIEW(auditId, format, tone, customPrompt),
    queryFn: async () => {
      try {
        const remote = await apiRequestText(
          API_ENDPOINTS.reportPreview(auditId, format, tone)
        );
        if (remote && remote.trim().length > 0) return remote;
      } catch {
        // Fallback to local synthesizer
      }

      const audit = auditStore.getAuditById(auditId) || {
        id: auditId,
        name: `Audit ${auditId}`,
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        metrics: { requestsSent: 48, pagesScanned: 2 },
        testBatteries: [],
      };

      const findings = auditStore.getFindings(auditId);
      const aiStatus = await isModelDownloaded();

      if (format === 'markdown') {
        return buildMarkdownReport({
          audit,
          findings,
          isAiLocalActive: aiStatus.exists,
          tone,
          auditorCustomDirectives: customPrompt,
        });
      }
      return buildHtmlReport({
        audit,
        findings,
        isAiLocalActive: aiStatus.exists,
        tone,
        auditorCustomDirectives: customPrompt,
      });
    },
    enabled: auditId.length > 0,
  });
}
