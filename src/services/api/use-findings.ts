import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { apiRequest } from './client';
import { injectionRequest } from './injection-resolver';
import { attackTurnsToFindings } from './attack-mapper';
import type { AttackTurn } from './injection-types';
import type { Finding } from './types';
import { auditStore } from './audit-store';
import { IS_MOCK_MODE } from './mock-mode';
import { API_ENDPOINTS, INJECTION_ENDPOINTS, QUERY_KEYS } from '../../constants/api.constants';

/**
 * Findings for an audit's triage list. Prefers REAL judge-scored turns from the
 * injection backend once a red-team session exists on the audit; otherwise falls
 * back to the core backend and finally the local audit store.
 */
export function useFindings(auditId: string): UseQueryResult<Finding[]> {
  const sessionId = auditStore.getAuditById(auditId)?.attackSessionId ?? '';

  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_FINDINGS(auditId), sessionId],
    queryFn: async () => {
      // Real attack turns take precedence when a red-team session exists. A
      // successful fetch is authoritative EVEN IF empty — zero notable turns
      // means the target resisted every payload, which is a real result, not
      // a reason to silently substitute the fabricated local findings below.
      if (sessionId) {
        try {
          const turns = await injectionRequest<AttackTurn[]>(INJECTION_ENDPOINTS.ataqueTurnos(sessionId));
          return attackTurnsToFindings(turns, auditId);
        } catch {
          // Injection backend unreachable — fall through to core/local sources.
        }
      }

      if (!IS_MOCK_MODE) {
        try {
          const response = await apiRequest<{ findings: Finding[] }>(API_ENDPOINTS.auditFindings(auditId));
          if (response && response.findings && response.findings.length > 0) {
            return response.findings;
          }
        } catch {
          // Fallback to audit store
        }
      }
      return auditStore.getFindings(auditId);
    },
    enabled: auditId.length > 0,
  });
}
