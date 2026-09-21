import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { apiRequest } from './client';
import type { Finding } from './types';
import { auditStore } from './audit-store';

/**
 * GET /audits/{auditId}/findings (contracts/monitoring.md) — list view only, enough for FR-008's
 * triage list. Full evidence is a separate call (`use-finding-detail.ts`).
 */
export function useFindings(auditId: string): UseQueryResult<Finding[]> {
  return useQuery({
    queryKey: ['audits', auditId, 'findings'],
    queryFn: async () => {
      try {
        const response = await apiRequest<{ findings: Finding[] }>(`/audits/${auditId}/findings`);
        if (response && response.findings && response.findings.length > 0) {
          return response.findings;
        }
      } catch {
        // Fallback to audit store
      }
      return auditStore.getFindings(auditId);
    },
    enabled: auditId.length > 0,
  });
}
