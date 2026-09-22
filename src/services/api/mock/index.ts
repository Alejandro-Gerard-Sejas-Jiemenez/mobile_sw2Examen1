/**
 * Mock layer index.
 *
 * Import `injectionRequest` from here when you need the mock-aware version.
 * In production the env flag is absent, so the real client is used.
 *
 * Usage in hooks (use-descubrimientos.ts, use-attack-turns.ts, etc.):
 *
 *   import { injectionRequest } from '../mock';
 *
 * This re-exports either the real or the mock implementation depending on
 * EXPO_PUBLIC_MOCK_INJECTION at build time. For a simpler conditional that
 * works at runtime (useful during development) use `getMockInjectionClient`.
 */

export { injectionRequest, INJECTION_API_BASE_URL } from './mock-injection-client';
export * from './mock-data';
