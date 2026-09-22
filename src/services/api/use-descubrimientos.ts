import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { injectionRequest } from './injection-resolver';
import { INJECTION_ENDPOINTS, API_POLL_INTERVALS_MS, QUERY_KEYS } from '../../constants/api.constants';
import type { DescubrimientoItem, DescubrimientoResultado } from './types';

export type { DescubrimientoItem, DescubrimientoResultado };


export function useDescubrimientos(): UseQueryResult<DescubrimientoItem[]> {
  return useQuery({
    queryKey: QUERY_KEYS.DESCUBRIMIENTOS,
    queryFn: () => injectionRequest<DescubrimientoItem[]>(INJECTION_ENDPOINTS.DESCUBRIMIENTOS),
    refetchInterval: API_POLL_INTERVALS_MS.DESCUBRIMIENTOS,
  });
}
