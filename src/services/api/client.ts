import { refreshSession } from '../auth/refresh-mutex';
import { getAuditorSession } from '../auth/session-context';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// Constitution Principle III: HTTPS only, with an explicit loopback exception
// for local development against a backend running on the same machine/emulator
// (10.0.2.2 is the Android emulator's alias for the host machine). Checked
// lazily (on first actual request) rather than at module load, so a
// misconfigured URL surfaces as a clear runtime error instead of crashing the
// whole bundle before anything can render (e.g. during `expo export`).
const LOOPBACK_BASE_URL = /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?(\/|$)/;

function assertSecureBaseUrl(url: string): void {
  if (!url || (!url.startsWith('https://') && !LOOPBACK_BASE_URL.test(url))) {
    throw new Error(
      'EXPO_PUBLIC_API_URL must be an HTTPS URL (http://localhost is allowed for local ' +
        'development only). See .env.example.',
    );
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** Skip attaching the Authorization header and the 401-refresh retry (e.g. login itself). */
  skipAuth?: boolean;
};

async function rawRequest(path: string, options: ApiRequestOptions): Promise<Response> {
  assertSecureBaseUrl(API_BASE_URL);

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (!options.skipAuth) {
    const session = getAuditorSession();
    if (session) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
    }
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

/**
 * Authenticated request helper. On a 401, refreshes the session (via the
 * shared refresh mutex) and retries the original request exactly once
 * (Constitution Principle I). Errors surfaced to callers are sanitized to a
 * status code + generic message — never the raw backend response body
 * (Constitution Principle III).
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  let response = await rawRequest(path, options);

  if (response.status === 401 && !options.skipAuth) {
    // Throws (and clears the session) if the refresh itself fails — that
    // rejection propagates to the caller, and the auth guard reacts to the
    // now-null session by returning the auditor to sign-in.
    await refreshSession(API_BASE_URL);
    response = await rawRequest(path, options);
  }

  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
