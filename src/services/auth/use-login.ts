import { useCallback, useState } from 'react';

import { apiRequest } from '../api/client';
import { setRefreshToken } from './secure-token-store';
import { setAuditorSession, type AuditorSession } from './session-context';

type LoginResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  auditor: AuditorSession['auditor'];
};

export function useLogin(): {
  login: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
} {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiRequest<any>('/auth/login/', {
        method: 'POST',
        body: { username: email, email, password },
        skipAuth: true,
      });

      const accessToken = response.access || response.accessToken;
      const refreshToken = response.refresh || response.refreshToken;
      const auditor = response.user || response.auditor || { id: '1', email, name: email };

      // Persist only the refresh token (Constitution Principle I); the access
      // token goes straight into the in-memory session.
      await setRefreshToken(refreshToken);
      setAuditorSession({
        accessToken,
        accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        auditor,
      });
    } catch {
      // Generic message regardless of the actual backend error — covers both
      // invalid credentials and unexpected failures identically from the UI's
      // point of view, never surfacing a raw backend error (Constitution
      // Principle III).
      setError('Invalid email or password. Please try again.');
      throw new Error('login-failed');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { login, isSubmitting, error };
}
