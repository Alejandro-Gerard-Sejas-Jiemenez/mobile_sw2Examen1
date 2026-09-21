import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { apiRequest, ApiError } from './client';
import type { Finding } from './types';
import { auditStore } from './audit-store';

/**
 * GET /findings/{findingId} (contracts/monitoring.md).
 */
export function useFindingDetail(
  findingId: string,
): UseQueryResult<Finding> & { isUnavailable: boolean } {
  const query = useQuery({
    queryKey: ['findings', findingId],
    queryFn: async () => {
      try {
        return await apiRequest<Finding>(`/findings/${findingId}`);
      } catch (err) {
        const stored = auditStore.getFindingById(findingId);
        if (stored) return stored;
        throw err;
      }
    },
    enabled: findingId.length > 0,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
        return false;
      }
      return failureCount < 1;
    },
  });

  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (findingId.length > 0) {
        refetch();
      }
    }, [findingId, refetch]),
  );

  const isUnavailable =
    query.isError &&
    query.error instanceof ApiError &&
    (query.error.status === 403 || query.error.status === 404) &&
    !auditStore.getFindingById(findingId);

  return { ...query, isUnavailable };
}
