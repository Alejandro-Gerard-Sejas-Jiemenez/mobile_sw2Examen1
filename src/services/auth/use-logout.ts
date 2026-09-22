import { useCallback } from 'react';

import { apiRequest } from '../api/client';
import { IS_MOCK_MODE } from '../api/mock-mode';
import { clearRefreshToken } from './secure-token-store';
import { clearAuditorSession } from './session-context';
import { API_ENDPOINTS } from '../../constants/api.constants';

/**
 * Signs the auditor out. Local session state is cleared regardless of whether
 * the backend calls succeed — logout is client-effective even if the network
 * requests fail (contracts/auth.md).
 */
export function useLogout(): () => Promise<void> {
  return useCallback(async () => {
    if (!IS_MOCK_MODE) {
      try {
        // Disassociate this device's push token first (Constitution Principle
        // IV / contracts/notifications.md), while the access token can still
        // authenticate the call — before /auth/logout invalidates it.
        await apiRequest(API_ENDPOINTS.DEVICES_PUSH_TOKEN, { method: 'DELETE' });
      } catch {
        // Ignored: no token may have been registered, or the call failed —
        // either way, sign-out must still proceed.
      }

      try {
        await apiRequest(API_ENDPOINTS.AUTH_LOGOUT, { method: 'POST' });
      } catch {
        // Ignored: we still clear local state below.
      }
    }

    await clearRefreshToken();
    clearAuditorSession();
  }, []);
}

