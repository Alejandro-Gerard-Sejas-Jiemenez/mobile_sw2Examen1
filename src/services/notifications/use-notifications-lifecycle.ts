import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { registerPushToken } from './register-push-token';
import { navigateForNotification } from './handle-notification-response';

/**
 * Registers this device's push token once the auditor has an active authenticated session.
 */
export function usePushTokenRegistration(isAuthenticated: boolean): void {
  useEffect(() => {
    if (isAuthenticated) {
      registerPushToken();
    }
  }, [isAuthenticated]);
}

/**
 * Routes a tapped notification (push or local — e.g. a phase-change alert
 * fired by `useSyncRemoteAudits`) through the route whitelist resolver.
 */
export function useNotificationResponseHandler(): void {
  const router = useRouter();

  useEffect(() => {
    let subscription: Notifications.EventSubscription | null = null;

    try {
      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        navigateForNotification(router, response?.notification?.request?.content?.data);
      });
    } catch (err) {
      if (__DEV__) {
        console.warn('[notifications] Failed to attach notification listener:', err);
      }
    }

    return () => {
      subscription?.remove?.();
    };
  }, [router]);
}
