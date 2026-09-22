import { auditStore } from './audit-store';
import { injectionRequest } from './injection-resolver';
import { attackTurnsToFindings } from './attack-mapper';
import type { AttackTurn } from './injection-types';
import type { Finding } from './types';
import { INJECTION_ENDPOINTS } from '../../constants/api.constants';

/**
 * Single source of truth for "what findings does this audit have right now",
 * shared by the report preview, the export/share/save actions, and the
 * findings list — so a PDF you save and a report you saved to the local DB
 * always match what's on screen. Prefers REAL judge-scored attack turns from
 * the injection backend once a red-team session exists; a successful fetch is
 * authoritative EVEN IF empty (the target resisted every payload — that's a
 * real result, not a reason to fall back to the fabricated local findings).
 * Falls back to the local audit store only when there's no session yet or the
 * injection backend is unreachable.
 */
export async function resolveAuditFindings(auditId: string): Promise<Finding[]> {
  const sessionId = auditStore.getAuditById(auditId)?.attackSessionId ?? '';

  if (sessionId) {
    try {
      const turns = await injectionRequest<AttackTurn[]>(INJECTION_ENDPOINTS.ataqueTurnos(sessionId));
      return attackTurnsToFindings(turns, auditId);
    } catch {
      // Injection backend unreachable — fall through to local findings.
    }
  }

  return auditStore.getFindings(auditId);
}
