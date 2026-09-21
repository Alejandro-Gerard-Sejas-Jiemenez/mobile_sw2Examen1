/**
 * T040 (tasks.md) — Constitution Principle I: concurrent 401s must be serialized behind a single
 * in-flight `/auth/refresh` call, and a failed refresh must clear the session rather than retry.
 */
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';

import { refreshSession } from '../../src/services/auth/refresh-mutex';
import { getAuditorSession, setAuditorSession } from '../../src/services/auth/session-context';

const API_BASE_URL = 'http://localhost:4000';

/** Minimal fetch Response stand-in — only `.ok`/`.status`/`.json()` are used by the code under test. */
function fakeResponse(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('refreshSession (refresh mutex)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuditorSession(null);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('initial-refresh-token');
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('serializes two concurrent refreshes behind a single /auth/refresh call', async () => {
    let resolveFetch!: (value: Response) => void;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = jest.fn().mockReturnValue(pendingResponse);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    // Both calls happen before the network response arrives — the second
    // must NOT trigger its own /auth/refresh call.
    const first = refreshSession(API_BASE_URL);
    const second = refreshSession(API_BASE_URL);

    // performRefresh awaits getRefreshToken() (itself backed by a mocked,
    // promise-returning SecureStore call) before it reaches fetch() — flush
    // the microtask queue so that has happened before asserting the count.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(
      fakeResponse(200, {
        accessToken: 'new-access-token',
        accessTokenExpiresAt: '2026-01-01T00:00:00.000Z',
        refreshToken: 'rotated-refresh-token',
        auditor: { auditorId: 'u1', displayName: 'Ana Auditora', role: 'auditor' },
      }),
    );

    const [firstResult, secondResult] = await Promise.all([first, second]);

    // The second caller received the exact result of the first's in-flight
    // refresh — not a second, competing rotation.
    expect(firstResult).toBe(secondResult);
    expect(firstResult.accessToken).toBe('new-access-token');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Rotation: the new refresh token overwrote the old one; the in-memory
    // session reflects the new access token (Constitution Principle I).
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth.refreshToken', 'rotated-refresh-token');
    expect(getAuditorSession()?.accessToken).toBe('new-access-token');
  });

  it('clears the session and rejects on a failed refresh, without retrying', async () => {
    setAuditorSession({
      accessToken: 'stale-access-token',
      accessTokenExpiresAt: '2020-01-01T00:00:00.000Z',
      auditor: { auditorId: 'u1', displayName: 'Ana Auditora', role: 'auditor' },
    });
    const fetchMock = jest.fn().mockResolvedValue(fakeResponse(401));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(refreshSession(API_BASE_URL)).rejects.toThrow();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth.refreshToken');
    expect(getAuditorSession()).toBeNull();
  });
});
