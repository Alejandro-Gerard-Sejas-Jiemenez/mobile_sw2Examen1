import Constants from 'expo-constants';
// import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let Notifications: any = null;
// Push notifications disabled in development to prevent Expo Go crashes
// try {
//   Notifications = require('expo-notifications');
// } catch (e) {
//   // Ignored in Expo Go
// }

import { apiRequest } from '../api/client';
import { getAuditorSession } from '../auth/session-context';

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
  
  if (!Notifications) {
    if (__DEV__) {
      console.warn('[push] Push token registration skipped: expo-notifications unavailable in Expo Go.');
    }
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

    await apiRequest('/devices/push-token', {
      method: 'POST',
      body: { pushToken, platform: Platform.OS },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[push] Push token registration failed (non-fatal):', error);
    }
  }
}
