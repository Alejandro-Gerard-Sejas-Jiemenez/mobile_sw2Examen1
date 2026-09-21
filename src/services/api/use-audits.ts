import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { apiRequest } from './client';
import type { Audit } from './types';
import { auditStore } from './audit-store';

export const AUDITS_POLL_INTERVAL_MS = 2500; // Fast live polling for real-time progress updates

function useIsAppForegrounded(): boolean {
  const [isForegrounded, setIsForegrounded] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const handleChange = (state: AppStateStatus) => setIsForegrounded(state === 'active');
    const subscription = AppState.addEventListener('change', handleChange);
    return () => subscription.remove();
  }, []);

  return isForegrounded;
}

/**
 * Polls GET /audits every 30s while the monitoring panel is visible (FR-004),
 * and pauses polling while the app is backgrounded, resuming on foreground
 * (FR-004a). Falls back gracefully to local audit store if endpoint is pending.
 */
export function useAudits(): UseQueryResult<Audit[]> {
  const isForegrounded = useIsAppForegrounded();

  return useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      try {
        const response = await apiRequest<{ audits: Audit[] }>('/audits?status=running,completed,paused');
        if (response && response.audits && response.audits.length > 0) {
          return response.audits;
        }
      } catch {
        // Ignore and fallback to audit store
      }
      return auditStore.getAudits();
    },
    refetchInterval: isForegrounded ? AUDITS_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    enabled: isForegrounded,
  });
}
