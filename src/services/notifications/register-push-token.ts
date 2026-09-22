import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { apiRequest } from '../api/client';
import { getAuditorSession } from '../auth/session-context';
import { API_ENDPOINTS } from '../../constants/api.constants';
import type { PushTokenRegistrationPayload } from './types';

/**
 * Registers this device's Expo push token with the backend
 * (contracts/notifications.md → POST /devices/push-token).
 *
 * Constitution Principle IV: this call MUST only be made when the auditor has
 * a valid, authenticated session — never before sign-in. Callers are expected
 * to invoke this only after `AuditorSession` is populated (see
 * `src/app/_layout.tsx`).
 *
 * Fails silently (dev-only console warning) rather than throwing: push
 * alerting is a secondary channel, not a blocker for sign-in or monitoring —
 * this matters during development, where there is often no EAS project
 * configured yet, and on Android + Expo Go, where remote push is unsupported
 * entirely (local notifications still work; see expo-notifications docs).
 */
export async function registerPushToken(): Promise<void> {
  if (!getAuditorSession()) {
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      if (__DEV__) {
        console.warn('[push] Skipping push registration: no EAS projectId configured in app.json.');
      }
      return;
    }

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

    // The auditor may have signed out while the permission prompt or the
    // token fetch above was pending — re-check before sending anything.
    if (!getAuditorSession()) {
      return;
    }

    const payload: PushTokenRegistrationPayload = {
      pushToken,
      platform: Platform.OS,
    };

    await apiRequest(API_ENDPOINTS.DEVICES_PUSH_TOKEN, {
      method: 'POST',
      body: payload,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[push] Push token registration failed (non-fatal):', error);
    }
  }
}

