import * as SecureStore from 'expo-secure-store';

// Single fixed key. This module is the ONLY place in the codebase allowed to
// persist the refresh token, and it is the ONLY token ever written to disk
// (Constitution Principle I) — always via SecureStore, never AsyncStorage.
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function clearRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
