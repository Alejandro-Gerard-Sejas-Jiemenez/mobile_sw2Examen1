import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { apiRequest } from './client';
import type { Alert } from './types';

/** GET /alerts (contracts/notifications.md) — delivered alerts the signed-in auditor can see. */
export function useAlerts(): UseQueryResult<Alert[]> {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiRequest<{ alerts: Alert[] }>('/alerts').then((r) => r.alerts),
  });
}
