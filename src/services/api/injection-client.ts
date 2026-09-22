import { NETWORK_ERROR_CODES, NetworkError } from '../../errors/network-error';
import { ApiError } from './client';
import type { ApiRequestOptions } from './types';

/**
 * Base URL of the INJECTION backend (offensive engine: descubrimientos, ataques,
 * ollama health). This is a SEPARATE Django project from the core/identity backend
 * and is UNAUTHENTICATED — so this client never attaches a Bearer token and never
 * runs the 401-refresh retry that `client.ts` does. Mixing the two would send the
 * core backend's JWT to a server that doesn't own that session.
 */
export const INJECTION_API_BASE_URL = process.env.EXPO_PUBLIC_INJECTION_API_URL ?? '';

// Same HTTPS-in-prod / http-in-dev rule as the core client (Constitution Principle III),
// checked lazily on first request so a misconfigured URL is a clear runtime error.
function assertSecureInjectionUrl(url: string): void {
  if (!url || (!url.startsWith('https://') && !(__DEV__ && url.startsWith('http://')))) {
    throw new NetworkError(
      NETWORK_ERROR_CODES.NETWORK_REQUEST_FAILED,
      'EXPO_PUBLIC_INJECTION_API_URL must be an HTTPS URL (a plain http:// URL is only ' +
        'allowed in a development build). See .env.example.',
    );
  }
}

async function injectionFetch(path: string, options: ApiRequestOptions): Promise<Response> {
  assertSecureInjectionUrl(INJECTION_API_BASE_URL);

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${INJECTION_API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Injection request to ${path} failed with status ${response.status}`);
  }

  return response;
}

/** JSON-decoding request against the injection backend (no auth, no refresh). */
export async function injectionRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await injectionFetch(path, options);
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
