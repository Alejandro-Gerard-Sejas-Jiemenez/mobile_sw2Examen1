import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../constants/storage.constants';
import { STORAGE_ERROR_CODES, StorageError } from '../../errors/storage-error';
import type { ISecureTokenStore } from './types';

// Single fixed key. This module is the ONLY place in the codebase allowed to
// persist the refresh token, and it is the ONLY token ever written to disk
// (Constitution Principle I) — always via SecureStore, never AsyncStorage.
const REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN;

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (err) {
    throw new StorageError(
      STORAGE_ERROR_CODES.STORAGE_READ_FAILED,
      'Failed to read secure refresh token from device keychain',
      { error: String(err) }
    );
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (err) {
    throw new StorageError(
      STORAGE_ERROR_CODES.STORAGE_WRITE_FAILED,
      'Failed to persist secure refresh token to device keychain',
      { error: String(err) }
    );
  }
}

export async function clearRefreshToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (err) {
    throw new StorageError(
      STORAGE_ERROR_CODES.STORAGE_DELETE_FAILED,
      'Failed to remove secure refresh token from device keychain',
      { error: String(err) }
    );
  }
}

export const secureTokenStore: ISecureTokenStore = {
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
};

