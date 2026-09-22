import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { injectionRequest } from './injection-resolver';
import { attackTurnsToFindings } from './attack-mapper';
import type { AttackTurn } from './injection-types';
import type { Finding } from './types';
import { INJECTION_ENDPOINTS, QUERY_KEYS } from '../../constants/api.constants';

/**
 * GET /api/ataques/{sessionId}/turnos/ on the injection backend, mapped to the
 * `Finding[]` the report pipeline consumes. `auditId` is the local audit these
 * findings belong to (used only to tag the mapped findings).
 */
export function useAttackTurns(
  sessionId: string,
  auditId: string,
): UseQueryResult<Finding[]> {
  return useQuery({
    queryKey: QUERY_KEYS.ATTACK_TURNS(sessionId),
    queryFn: async () => {
      const turns = await injectionRequest<AttackTurn[]>(
        INJECTION_ENDPOINTS.ataqueTurnos(sessionId),
      );
      return attackTurnsToFindings(turns, auditId);
    },
    enabled: sessionId.length > 0,
  });
}
