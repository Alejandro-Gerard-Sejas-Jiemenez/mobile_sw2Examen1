/**
 * Single source of truth for whether the app runs against local fixture data
 * instead of any backend (core `apiRequest`/`apiRequestText` AND the
 * injection `injectionRequest`). Controlled by `EXPO_PUBLIC_MOCK_INJECTION`
 * (see .env.example) — every hook that fetches data should check this before
 * attempting a network call, not just the injection-specific ones.
 */
export const IS_MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_INJECTION === 'true';
