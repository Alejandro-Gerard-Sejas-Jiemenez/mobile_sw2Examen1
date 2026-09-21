import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuditorSession } from './session-context';
import { AUTH_ROUTES } from '../../constants/api.constants';

/**
 * Redirects between the (auth) and (tabs) route groups based on session state.
 * This is a UX redirect only — it MUST NOT be treated as the authorization
 * boundary; the backend enforces access on every request (Constitution
 * Principle III). `skip` postpones any redirect until session bootstrap
 * (use-session-bootstrap.ts) has had a chance to restore a persisted session.
 */
export function useProtectedRoute(skip: boolean): void {
  const { isAuthenticated } = useAuditorSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (skip) {
      return;
    }

    const inAuthGroup = segments[0] === AUTH_ROUTES.AUTH_GROUP;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace(AUTH_ROUTES.SIGN_IN);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace(AUTH_ROUTES.TABS);
    }
  }, [skip, isAuthenticated, segments, router]);
}

