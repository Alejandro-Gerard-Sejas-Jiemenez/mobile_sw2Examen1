import { useCallback, useState } from 'react';

import { apiRequest } from '../api/client';
import { setRefreshToken } from './secure-token-store';
import { setAuditorSession } from './session-context';
import type { LoginResponse, UseLoginReturn } from './types';
import { API_ENDPOINTS, API_RETRY_CONFIG } from '../../constants/api.constants';
import { NETWORK_ERROR_CODES, NetworkError } from '../../errors/network-error';
import { MOCK_CREDENTIALS, MOCK_LOGIN_RESPONSE } from '../api/mock/mock-data';
import { IS_MOCK_MODE as IS_MOCK } from '../api/mock-mode';

/** How long (ms) to wait for the login POST before giving up. */
const LOGIN_TIMEOUT_MS = API_RETRY_CONFIG.REQUEST_TIMEOUT_MS; // 15 000 ms

/**
 * Simulates the login request using local fixture data.
 * In mock/dev mode accepts any non-empty email + password.
 */
async function mockLogin(email: string, password: string): Promise<LoginResponse> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 600));

  if (!email.trim() || !password) {
    throw new Error('Email and password are required');
  }

  // Return fixture session with the entered email so the UI feels natural.
  return {
    ...MOCK_LOGIN_RESPONSE,
    user: { ...MOCK_LOGIN_RESPONSE.user, email: email.trim() },
  };
}

export function useLogin(): UseLoginReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let response: LoginResponse;

      if (IS_MOCK) {
        // ── MOCK MODE ─────────────────────────────────────────────────────────
        // No network call — uses fixture credentials from mock-data.ts.
        response = await mockLogin(email, password);
      } else {
        // ── REAL MODE ─────────────────────────────────────────────────────────
        // Abort the fetch automatically after LOGIN_TIMEOUT_MS so the user
        // gets a fast error instead of a frozen spinner when the backend is
        // unreachable (Constitution Principle III).
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), LOGIN_TIMEOUT_MS);
        try {
          response = await apiRequest<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, {
            method: 'POST',
            body: { username: email, email, password },
            skipAuth: true,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      }

      const accessToken = response.access || response.accessToken || '';
      const refreshToken = response.refresh || response.refreshToken || '';
      const auditor = response.user || response.auditor || { id: '1', email, name: email };

      // Persist only the refresh token (Constitution Principle I); the access
      // token goes straight into the in-memory session.
      if (refreshToken) {
        await setRefreshToken(refreshToken);
      }

      setAuditorSession({
        accessToken,
        accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        auditor,
      });
    } catch (err) {
      // Generic message regardless of the actual error — never surfaces a raw
      // backend response (Constitution Principle III).
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      const failureMessage = isTimeout
        ? 'No se pudo conectar al servidor. Verifica tu red e intenta de nuevo.'
        : IS_MOCK
        ? 'Ingresa un email y contraseña para continuar.'
        : 'Invalid email or password. Please try again.';

      setError(failureMessage);
      throw new NetworkError(NETWORK_ERROR_CODES.NETWORK_UNAUTHORIZED, failureMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { login, isSubmitting, error };
}
