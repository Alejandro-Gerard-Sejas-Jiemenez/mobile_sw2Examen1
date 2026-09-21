import { refreshSession } from '../auth/refresh-mutex';
import { getAuditorSession } from '../auth/session-context';
import { NETWORK_ERROR_CODES, NetworkError, type NetworkErrorCode } from '../../errors/network-error';
import { HTTP_STATUS } from '../../constants/api.constants';
import type { ApiRequestOptions } from './types';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// Constitution Principle III: HTTPS only in a real (production) build. In a
// dev/Metro-connected build (__DEV__), any http:// URL is allowed, since a
// developer may legitimately point EXPO_PUBLIC_API_URL at localhost, a LAN IP
// (physical device on Wi-Fi), 10.0.2.2 (Android emulator), or a tunnel URL —
// there is no fixed list of "local" hosts that covers all of those. Checked
// lazily (on first actual request) rather than at module load, so a
// misconfigured URL surfaces as a clear runtime error instead of crashing the
// whole bundle before anything can render (e.g. during `expo export`).
function assertSecureBaseUrl(url: string): void {
  if (!url || (!url.startsWith('https://') && !(__DEV__ && url.startsWith('http://')))) {
    throw new NetworkError(
      NETWORK_ERROR_CODES.NETWORK_REQUEST_FAILED,
      'EXPO_PUBLIC_API_URL must be an HTTPS URL (a plain http:// URL is only allowed in a ' +
        'development build). See .env.example.',
    );
  }
}

export class ApiError extends NetworkError {
  public readonly status: number;

  constructor(status: number, message: string, context?: Record<string, unknown>) {
    const code: NetworkErrorCode =
      status === HTTP_STATUS.UNAUTHORIZED
        ? NETWORK_ERROR_CODES.NETWORK_UNAUTHORIZED
        : status === HTTP_STATUS.FORBIDDEN
        ? NETWORK_ERROR_CODES.NETWORK_FORBIDDEN
        : status === HTTP_STATUS.NOT_FOUND
        ? NETWORK_ERROR_CODES.NETWORK_NOT_FOUND
        : status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
        ? NETWORK_ERROR_CODES.NETWORK_SERVER_ERROR
        : NETWORK_ERROR_CODES.NETWORK_REQUEST_FAILED;

    super(code, message, status, context);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type { ApiRequestOptions };


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
 * Shared authenticated-request core. On a 401, refreshes the session (via the
 * shared refresh mutex) and retries the original request exactly once
 * (Constitution Principle I). Throws a sanitized `ApiError` (status + generic
 * message, never the raw backend response body — Constitution Principle III)
 * for any non-OK response.
 */
async function authenticatedFetch(path: string, options: ApiRequestOptions): Promise<Response> {
  let response = await rawRequest(path, options);

  if (response.status === HTTP_STATUS.UNAUTHORIZED && !options.skipAuth) {
    // Throws (and clears the session) if the refresh itself fails — that
    // rejection propagates to the caller, and the auth guard reacts to the
    // now-null session by returning the auditor to sign-in.
    await refreshSession(API_BASE_URL);
    response = await rawRequest(path, options);
  }

  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
  }

  return response;
}

/** JSON-decoding request helper — the default for every endpoint except the raw HTML/Markdown
 *  report preview (see `apiRequestText`). */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await authenticatedFetch(path, options);

  if (response.status === HTTP_STATUS.NO_CONTENT) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Same auth/refresh/retry behavior as `apiRequest`, but decodes the body as text instead of JSON —
 * for the one endpoint that returns a raw body (the report preview, contracts/monitoring.md:
 * HTML for `format=pdf`, a plain Markdown string for `format=markdown`).
 */
export async function apiRequestText(path: string, options: ApiRequestOptions = {}): Promise<string> {
  const response = await authenticatedFetch(path, options);
  return response.text();
}
