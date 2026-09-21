/**
 * Authentication Domain Types & Interfaces
 * Single source of truth for Auditor sessions, credentials, token contracts, and auth hook returns.
 */

export interface AuditorIdentity {
  auditorId?: string;
  id?: string;
  displayName?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface AuditorSession {
  accessToken: string;
  accessTokenExpiresAt: string; // ISO datetime
  auditor: AuditorIdentity;
}

export interface LoginResponse {
  accessToken?: string;
  access?: string;
  accessTokenExpiresAt?: string;
  refreshToken?: string;
  refresh?: string;
  auditor?: AuditorIdentity;
  user?: AuditorIdentity;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  auditor: AuditorIdentity;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UseLoginReturn {
  login: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export interface UseAuditorSessionReturn {
  session: AuditorSession | null;
  isAuthenticated: boolean;
}

export interface ISecureTokenStore {
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  clearRefreshToken(): Promise<void>;
}
