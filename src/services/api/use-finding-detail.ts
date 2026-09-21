import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { apiRequest, ApiError } from './client';
import type { Finding } from './types';
import { auditStore } from './audit-store';
import { API_ENDPOINTS, HTTP_STATUS, QUERY_KEYS } from '../../constants/api.constants';

/**
 * GET /findings/{findingId} (contracts/monitoring.md).
 */
export function useFindingDetail(
  findingId: string,
): UseQueryResult<Finding> & { isUnavailable: boolean } {
  const query = useQuery({
    queryKey: QUERY_KEYS.FINDING_DETAIL(findingId),
    queryFn: async () => {
      try {
        return await apiRequest<Finding>(API_ENDPOINTS.findingDetail(findingId));
      } catch (err) {
        const stored = auditStore.getFindingById(findingId);
        if (stored) return stored;
        throw err;
      }
    },
    enabled: findingId.length > 0,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === HTTP_STATUS.FORBIDDEN || error.status === HTTP_STATUS.NOT_FOUND)
      ) {
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
    (query.error.status === HTTP_STATUS.FORBIDDEN || query.error.status === HTTP_STATUS.NOT_FOUND) &&
    !auditStore.getFindingById(findingId);

  return { ...query, isUnavailable };
}
