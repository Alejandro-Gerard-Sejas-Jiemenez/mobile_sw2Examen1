import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiRequest } from './client';
import { API_ENDPOINTS, API_POLL_INTERVALS_MS, QUERY_KEYS } from '../../constants/api.constants';
import type { DescubrimientoItem, DescubrimientoResultado } from './types';

export type { DescubrimientoItem, DescubrimientoResultado };


export function useDescubrimientos(): UseQueryResult<DescubrimientoItem[]> {
  return useQuery({
    queryKey: QUERY_KEYS.DESCUBRIMIENTOS,
    queryFn: () => apiRequest<DescubrimientoItem[]>(API_ENDPOINTS.DESCUBRIMIENTOS),
    refetchInterval: API_POLL_INTERVALS_MS.DESCUBRIMIENTOS,
  });
}
