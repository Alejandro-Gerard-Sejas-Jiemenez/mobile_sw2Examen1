import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import {
  deleteReport,
  getReportById,
  listReports,
  type SavedReport,
} from '@/services/reports/report-synthesizer';
import { QUERY_KEYS } from '@/constants/api.constants';

/** All saved reports, or only the ones for one audit when `auditId` is passed. */
export function useSavedReports(auditId?: string): UseQueryResult<SavedReport[]> {
  return useQuery({
    queryKey: auditId ? QUERY_KEYS.SAVED_REPORTS_FOR_AUDIT(auditId) : QUERY_KEYS.SAVED_REPORTS,
    queryFn: () => listReports(auditId),
  });
}

export function useSavedReport(reportId: string): UseQueryResult<SavedReport | null> {
  return useQuery({
    queryKey: QUERY_KEYS.SAVED_REPORT_DETAIL(reportId),
    queryFn: () => getReportById(reportId),
    enabled: reportId.length > 0,
  });
}

export function useDeleteSavedReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVED_REPORTS });
    },
  });
}
