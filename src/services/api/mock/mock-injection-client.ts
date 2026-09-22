/**
 * Mock Injection Client
 *
 * Drop-in replacement for `injection-client.ts` when
 * `EXPO_PUBLIC_MOCK_INJECTION=true`. Returns local fixture data with a small
 * artificial delay to simulate network latency, so every screen that calls
 * `injectionRequest` renders exactly as it would against the real backend.
 *
 * HOW TO ENABLE:
 *   Set  EXPO_PUBLIC_MOCK_INJECTION=true  in your .env.local file.
 *
 * ENDPOINTS COVERED (from the Postman collection "Genvulnai"):
 *   GET  /sistema/ollama/            → MOCK_OLLAMA_STATUS
 *   GET  /descubrimientos/           → MOCK_DESCUBRIMIENTOS  (list)
 *   GET  /descubrimientos/{id}/      → single DescubrimientoItem
 *   GET  /ataques/                   → MOCK_ATAQUES          (list)
 *   GET  /ataques/{id}/              → single AttackSession
 *   GET  /ataques/{id}/turnos/       → MOCK_ATTACK_TURNS[id]
 *
 * Any path not matched logs a warning and returns an empty object so the app
 * never crashes — it just shows empty / skeleton states.
 */

import {
  MOCK_OLLAMA_STATUS,
  MOCK_DESCUBRIMIENTOS,
  MOCK_ATAQUES,
  MOCK_ATTACK_TURNS,
} from './mock-data';

/** Simulated network round-trip (ms). Keep it realistic but not annoying. */
const MOCK_LATENCY_MS = 350;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves the right fixture for a given injection-backend path.
 * Mirrors the path patterns defined in `INJECTION_ENDPOINTS` (api.constants.ts).
 */
function resolveMockResponse(path: string): unknown {
  // GET /sistema/ollama/
  if (path.startsWith('/sistema/ollama')) {
    return MOCK_OLLAMA_STATUS;
  }

  // GET /ataques/{id}/turnos/
  const turnosMatch = path.match(/^\/ataques\/([^/]+)\/turnos\//);
  if (turnosMatch) {
    const sessionId = turnosMatch[1]!;
    return MOCK_ATTACK_TURNS[sessionId] ?? [];
  }

  // GET /ataques/{id}/
  const ataqueDetailMatch = path.match(/^\/ataques\/([^/]+)\//);
  if (ataqueDetailMatch) {
    const sessionId = ataqueDetailMatch[1]!;
    return MOCK_ATAQUES.find((a) => a.id === sessionId) ?? null;
  }

  // GET /ataques/  (list)
  if (path.startsWith('/ataques/') || path === '/ataques') {
    return MOCK_ATAQUES;
  }

  // GET /descubrimientos/{id}/
  const descDetailMatch = path.match(/^\/descubrimientos\/([^/]+)\//);
  if (descDetailMatch) {
    const scanId = descDetailMatch[1]!;
    return MOCK_DESCUBRIMIENTOS.find((d) => d.id === scanId) ?? null;
  }

  // GET /descubrimientos/  (list)
  if (path.startsWith('/descubrimientos/') || path === '/descubrimientos') {
    return MOCK_DESCUBRIMIENTOS;
  }

  console.warn('[mock-injection-client] No mock for path:', path, '— returning {}');
  return {};
}

/**
 * Mock replacement for `injectionRequest<T>` from `injection-client.ts`.
 * Signature is identical — callers need zero changes.
 */
export async function injectionRequest<T>(path: string): Promise<T> {
  await delay(MOCK_LATENCY_MS);
  return resolveMockResponse(path) as T;
}

/** Re-export so any import of INJECTION_API_BASE_URL still compiles. */
export const INJECTION_API_BASE_URL = 'mock://injection';
