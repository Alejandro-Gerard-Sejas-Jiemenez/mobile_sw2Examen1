/**
 * Injection client resolver.
 *
 * Returns `injectionRequest` from the REAL backend client or the MOCK client
 * depending on the `EXPO_PUBLIC_MOCK_INJECTION` environment variable.
 *
 * This file is the SINGLE place that decides which implementation to use.
 * All hooks (use-descubrimientos, use-attack-turns, use-sync-remote-audits)
 * should import from here instead of directly from `injection-client.ts`.
 *
 * HOW TO ENABLE MOCK MODE:
 *   Add  EXPO_PUBLIC_MOCK_INJECTION=true  to your .env.local
 *   Then restart the Metro bundler.
 */

import { injectionRequest as realInjectionRequest } from './injection-client';
import { injectionRequest as mockInjectionRequest } from './mock/mock-injection-client';
import type { ApiRequestOptions } from './types';
import { IS_MOCK_MODE as IS_MOCK } from './mock-mode';

if (__DEV__ && IS_MOCK) {
  console.info(
    '[injection-resolver] MOCK MODE ACTIVE — all injection backend calls return fixture data.'
  );
}

/**
 * Unified `injectionRequest<T>` — automatically routed to real or mock based
 * on `EXPO_PUBLIC_MOCK_INJECTION`. Drop-in replacement for the old direct
 * import of `injectionRequest` from `injection-client`.
 */
export function injectionRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  if (IS_MOCK) {
    return mockInjectionRequest<T>(path);
  }
  return realInjectionRequest<T>(path, options);
}
