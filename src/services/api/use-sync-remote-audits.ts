import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { injectionRequest } from './injection-resolver';
import { auditStore } from './audit-store';
import type { DescubrimientoItem } from './types';
import type { AttackSession } from './injection-types';
import { ESTADO_ATAQUE_LABELS, ESTADO_ESCANEO_LABELS } from './injection-types';
import {
  INJECTION_ENDPOINTS,
  API_POLL_INTERVALS_MS,
  QUERY_KEYS,
  NOTIFICATION_SCREENS,
} from '../../constants/api.constants';
import { scheduleLocalNotification } from '../notifications/schedule-local-notification';
import { useIsAppForegrounded } from '../../hooks/use-is-app-foregrounded';
import type { Alert } from './types';

/**
 * Passive follow-up engine: this app never creates a scan or attack session —
 * both are created on the web, directly against the injection backend. This
 * hook polls `GET /descubrimientos/` and `GET /ataques/`, mirrors what it
 * finds onto the local audit store (`upsertFromRemoteScan`/
 * `upsertFromRemoteAttack`), and raises a local alert + push notification the
 * moment it observes a phase change (scan completed/failed, attack
 * succeeded/failed, a new turn landed). Mount once, near the app root — see
 * `app/(tabs)/_layout.tsx`.
 */
export function useSyncRemoteAudits(): void {
  const isForegrounded = useIsAppForegrounded();
  const queryClient = useQueryClient();
  const isFirstScanTick = useRef(true);
  const isFirstAttackTick = useRef(true);

  const scansQuery = useQuery({
    queryKey: QUERY_KEYS.DESCUBRIMIENTOS,
    queryFn: () => injectionRequest<DescubrimientoItem[]>(INJECTION_ENDPOINTS.DESCUBRIMIENTOS),
    refetchInterval: isForegrounded ? API_POLL_INTERVALS_MS.DESCUBRIMIENTOS : false,
    refetchIntervalInBackground: false,
    enabled: isForegrounded,
  });

  const attacksQuery = useQuery({
    queryKey: QUERY_KEYS.ATAQUES,
    queryFn: () => injectionRequest<AttackSession[]>(INJECTION_ENDPOINTS.ATAQUES),
    refetchInterval: isForegrounded ? API_POLL_INTERVALS_MS.DESCUBRIMIENTOS : false,
    refetchIntervalInBackground: false,
    enabled: isForegrounded,
  });

  const raiseAlert = (auditId: string, message: string, severityLabel: string) => {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      findingId: '',
      severityLabel,
      deliveredAt: new Date().toISOString(),
      readState: 'unread',
      kind: 'phase',
      auditId,
      message,
    };
    auditStore.addAlert(alert);
    void scheduleLocalNotification('Auditoría actualizada', message, {
      route: NOTIFICATION_SCREENS.AUDIT_DETAIL,
      auditId,
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUDITS });
  };

  useEffect(() => {
    if (!scansQuery.data) return;

    // Skip alerting on the very first tick after mount — that would fire one
    // alert per already-existing scan just from opening the app.
    const shouldAlert = !isFirstScanTick.current;
    isFirstScanTick.current = false;

    for (const scan of scansQuery.data) {
      const { audit, statusChanged } = auditStore.upsertFromRemoteScan(scan);
      if (shouldAlert && statusChanged) {
        const label = ESTADO_ESCANEO_LABELS[scan.status] ?? scan.status;
        raiseAlert(
          audit.id,
          `${audit.name}: el escaneo cambió a "${label}".`,
          scan.status === 'fallido' ? 'ALTO' : 'INFO'
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scansQuery.data]);

  useEffect(() => {
    if (!attacksQuery.data) return;

    const shouldAlert = !isFirstAttackTick.current;
    isFirstAttackTick.current = false;

    for (const attack of attacksQuery.data) {
      const result = auditStore.upsertFromRemoteAttack(attack);
      if (!result) continue; // No local audit tracks this scan yet.
      const { audit, statusChanged, turnosChanged } = result;
      if (!shouldAlert) continue;

      if (statusChanged) {
        const label = ESTADO_ATAQUE_LABELS[attack.status] ?? attack.status;
        const isFailure = attack.status === 'fallido';
        const isSuccess = attack.status === 'exito' || attack.status === 'exito_persistido';
        raiseAlert(
          audit.id,
          `${audit.name}: el ataque cambió a "${label}".`,
          isFailure ? 'ALTO' : isSuccess ? 'CRÍTICO' : 'INFO'
        );
      } else if (turnosChanged) {
        raiseAlert(
          audit.id,
          `${audit.name}: turno ${attack.turnos_ejecutados}/${attack.max_turnos} completado.`,
          'INFO'
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attacksQuery.data]);
}
