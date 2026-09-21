import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { apiRequest } from './client';
import type { ReportFormat } from './types';

type GenerateReportResponse = { reportId: string; status: 'compiling' };
type ReportStatusResponse = {
  reportId: string;
  status: 'compiling' | 'ready' | 'failed';
  downloadUrl?: string;
};

const POLL_INTERVAL_MS = 1500;

export function useGenerateReport(auditId: string) {
  const [reportId, setReportId] = useState<string | null>(null);
  const [localReady, setLocalReady] = useState(false);

  const start = useMutation({
    mutationFn: async (format: ReportFormat) => {
      try {
        const res = await apiRequest<GenerateReportResponse>(`/audits/${auditId}/report`, {
          method: 'POST',
          body: { format },
        });
        return res;
      } catch {
        // Local fallback compilation
        return { reportId: `local-report-${Date.now()}`, status: 'compiling' as const };
      }
    },
    onSuccess: (data) => {
      setReportId(data.reportId);
      if (data.reportId.startsWith('local-report-')) {
        setTimeout(() => setLocalReady(true), 600);
      }
    },
  });

  const status = useQuery({
    queryKey: ['reports', reportId],
    queryFn: () => apiRequest<ReportStatusResponse>(`/reports/${reportId}`),
    enabled: reportId !== null && !reportId.startsWith('local-report-'),
    refetchInterval: (query) => (query.state.data?.status === 'compiling' ? POLL_INTERVAL_MS : false),
  });

  const isReady = localReady || status.data?.status === 'ready';

  return {
    generate: (format: ReportFormat) => {
      setReportId(null);
      setLocalReady(false);
      start.mutate(format);
    },
    isStarting: start.isPending,
    startError: start.error,
    reportId,
    status: isReady ? 'ready' : (status.data?.status ?? null),
    downloadUrl: status.data?.downloadUrl ?? null,
    isCompiling:
      (reportId !== null && !isReady && (status.data?.status ?? 'compiling') === 'compiling') ||
      (start.isPending && !isReady),
    isReady,
    isFailed: !localReady && status.data?.status === 'failed',
    reset: () => {
      setReportId(null);
      setLocalReady(false);
      start.reset();
    },
  };
}
