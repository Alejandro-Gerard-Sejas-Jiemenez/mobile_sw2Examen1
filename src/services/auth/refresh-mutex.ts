import { clearRefreshToken, getRefreshToken, setRefreshToken } from './secure-token-store';
import { clearAuditorSession, setAuditorSession } from './session-context';
import type { AuditorSession, RefreshResponse } from './types';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { NETWORK_ERROR_CODES, NetworkError } from '../../errors/network-error';

let inFlightRefresh: Promise<AuditorSession> | null = null;

/**
 * Ensures at most one POST /auth/refresh call is in flight at a time.
 *
 * The backend rotates refresh tokens (invalidates the previous one on use), so
 * two concurrent refresh attempts would race and the loser would always fail.
 * Every caller that arrives while a refresh is already in flight awaits that
 * same promise instead of starting a second one (Constitution Principle I).
 */
export function refreshSession(apiBaseUrl: string): Promise<AuditorSession> {
  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh(apiBaseUrl).finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

async function performRefresh(apiBaseUrl: string): Promise<AuditorSession> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    clearAuditorSession();
    throw new NetworkError(
      NETWORK_ERROR_CODES.NETWORK_UNAUTHORIZED,
      'No refresh token available'
    );
  }

  const endpoint = `${apiBaseUrl}${API_ENDPOINTS.AUTH_REFRESH}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    // Invalid, expired, or already-rotated refresh token: treat this as the end
    // of the session. Never retry with the same (now known-bad) refreshToken —
    // that reuse is exactly the signal a rotating-refresh backend treats as
    // theft (Constitution Principle I).
    await clearRefreshToken();
    clearAuditorSession();
    throw new NetworkError(
      NETWORK_ERROR_CODES.NETWORK_UNAUTHORIZED,
      'Session refresh failed',
      response.status
    );
  }

  const data = (await response.json()) as RefreshResponse;

  // Rotation: overwrite the stored refresh token with the new one immediately.
  await setRefreshToken(data.refreshToken);

  const session: AuditorSession = {
    accessToken: data.accessToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
    auditor: data.auditor,
  };
  setAuditorSession(session);
  return session;
}

