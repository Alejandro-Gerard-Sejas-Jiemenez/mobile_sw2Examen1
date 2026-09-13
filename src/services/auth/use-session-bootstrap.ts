import { useEffect, useState } from 'react';

import { API_BASE_URL } from '../api/client';
import { getRefreshToken } from './secure-token-store';
import { refreshSession } from './refresh-mutex';

/**
 * On cold start, the in-memory access token (session-context.ts) is always
 * empty even if a refresh token survived from a previous run. This attempts a
 * silent refresh from the persisted refresh token before the auth guard makes
 * its sign-in-vs-monitoring decision, so an auditor with a still-valid session
 * is not asked to sign in again on every app launch (FR-002).
 */
export function useSessionBootstrap(): boolean {
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const storedRefreshToken = await getRefreshToken();
        if (storedRefreshToken) {
          await refreshSession(API_BASE_URL);
        }
      } catch {
        // No valid session to restore — the guard will route to sign-in.
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return isBootstrapping;
}
