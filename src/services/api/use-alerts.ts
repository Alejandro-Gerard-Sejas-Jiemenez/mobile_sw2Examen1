import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { apiRequest } from './client';
import type { Alert } from './types';
import { API_ENDPOINTS, QUERY_KEYS } from '../../constants/api.constants';

/** GET /alerts (contracts/notifications.md) — delivered alerts the signed-in auditor can see. */
export function useAlerts(): UseQueryResult<Alert[]> {
  return useQuery({
    queryKey: QUERY_KEYS.ALERTS,
    queryFn: () => apiRequest<{ alerts: Alert[] }>(API_ENDPOINTS.ALERTS).then((r) => r.alerts),
  });
}

