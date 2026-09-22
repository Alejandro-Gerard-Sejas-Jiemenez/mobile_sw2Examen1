import * as Notifications from 'expo-notifications';

import type { NotificationDataPayload } from './types';

let hasConfiguredHandler = false;

/**
 * Ensures the app shows local notifications while foregrounded (default
 * Expo behavior suppresses the in-app banner unless a handler is set).
 * Idempotent — safe to call multiple times.
 */
function ensureHandlerConfigured(): void {
  if (hasConfiguredHandler) return;
  hasConfiguredHandler = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

let permissionPromise: Promise<boolean> | null = null;

async function ensurePermission(): Promise<boolean> {
  if (!permissionPromise) {
    permissionPromise = (async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus === 'granted') return true;
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      } catch (err) {
        if (__DEV__) {
          console.warn('[notifications] Permission check failed:', err);
        }
        return false;
      }
    })();
  }
  return permissionPromise;
}

/**
 * Fires a local notification immediately (no server round-trip — this is the
 * device notifying itself, used by `useSyncRemoteAudits` when it detects a
 * scan/attack phase change on the injection backend). Never throws: alerting
 * is a secondary channel, not something that should break the polling loop.
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationDataPayload
): Promise<void> {
  try {
    ensureHandlerConfigured();
    const granted = await ensurePermission();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null,
    });
  } catch (err) {
    if (__DEV__) {
      console.warn('[notifications] Failed to schedule local notification (non-fatal):', err);
    }
  }
}
