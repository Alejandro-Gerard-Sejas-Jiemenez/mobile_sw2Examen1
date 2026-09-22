import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { apiRequest } from './client';
import type { Audit } from './types';
import { auditStore } from './audit-store';
import { IS_MOCK_MODE } from './mock-mode';
import { useIsAppForegrounded } from '../../hooks/use-is-app-foregrounded';
import { API_ENDPOINTS, API_POLL_INTERVALS_MS, QUERY_KEYS } from '../../constants/api.constants';

export const AUDITS_POLL_INTERVAL_MS = API_POLL_INTERVALS_MS.AUDITS_FAST;

/**
 * Polls GET /audits every 30s while the monitoring panel is visible (FR-004),
 * and pauses polling while the app is backgrounded, resuming on foreground
 * (FR-004a). Falls back gracefully to local audit store if endpoint is pending.
 *
 * The local audit store is now populated passively by `useSyncRemoteAudits`
 * (audits are discovered from the injection backend, never created from this
 * app), so this hook's fallback branch is what most builds actually render.
 */
export function useAudits(): UseQueryResult<Audit[]> {
  const isForegrounded = useIsAppForegrounded();

  return useQuery({
    queryKey: QUERY_KEYS.AUDITS,
    queryFn: async () => {
      if (!IS_MOCK_MODE) {
        try {
          const response = await apiRequest<{ audits: Audit[] }>(API_ENDPOINTS.AUDITS_QUERY);
          if (response && response.audits && response.audits.length > 0) {
            return response.audits;
          }
        } catch {
          // Ignore and fallback to audit store
        }
      }
      return auditStore.getAudits();
    },
    refetchInterval: isForegrounded ? AUDITS_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    enabled: isForegrounded,
  });
}
