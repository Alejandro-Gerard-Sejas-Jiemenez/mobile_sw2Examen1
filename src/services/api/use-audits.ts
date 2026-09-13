import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { apiRequest } from './client';
import type { Audit } from './types';

export const AUDITS_POLL_INTERVAL_MS = 30_000; // FR-004 default (spec.md Assumptions)

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
 * (FR-004a) — implemented by disabling the query rather than letting
 * TanStack Query's own background-refetch setting handle it, so the pause is
 * explicit and testable.
 */
export function useAudits(): UseQueryResult<Audit[]> {
  const isForegrounded = useIsAppForegrounded();

  return useQuery({
    queryKey: ['audits'],
    queryFn: () => apiRequest<{ audits: Audit[] }>('/audits?status=running,completed,paused').then((r) => r.audits),
    refetchInterval: isForegrounded ? AUDITS_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    enabled: isForegrounded,
  });
}
