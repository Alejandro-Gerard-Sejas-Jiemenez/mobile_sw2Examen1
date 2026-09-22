import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { apiRequest } from './client';
import { auditStore } from './audit-store';
import { IS_MOCK_MODE } from './mock-mode';
import type { Alert } from './types';
import { API_ENDPOINTS, QUERY_KEYS } from '../../constants/api.constants';

/**
 * GET /alerts (contracts/notifications.md) — delivered alerts the signed-in
 * auditor can see, merged with the local phase alerts `useSyncRemoteAudits`
 * writes to the audit store (scan/attack status changes are detected purely
 * on-device by polling the injection backend, so they never come from a
 * server "alerts" endpoint).
 */
export function useAlerts(): UseQueryResult<Alert[]> {
  return useQuery({
    queryKey: QUERY_KEYS.ALERTS,
    queryFn: async () => {
      const localAlerts = auditStore.getAlerts();
      if (IS_MOCK_MODE) {
        return localAlerts;
      }
      try {
        const remote = await apiRequest<{ alerts: Alert[] }>(API_ENDPOINTS.ALERTS);
        return [...localAlerts, ...(remote?.alerts ?? [])];
      } catch {
        return localAlerts;
      }
    },
  });
}
