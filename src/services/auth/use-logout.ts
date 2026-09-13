import { useCallback } from 'react';

import { apiRequest } from '../api/client';
import { clearRefreshToken } from './secure-token-store';
import { clearAuditorSession } from './session-context';

/**
 * Signs the auditor out. Local session state is cleared regardless of whether
 * the backend call succeeds — logout is client-effective even if the network
 * request fails (contracts/auth.md).
 */
export function useLogout(): () => Promise<void> {
  return useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignored: we still clear local state below.
    } finally {
      await clearRefreshToken();
      clearAuditorSession();
    }
  }, []);
}
