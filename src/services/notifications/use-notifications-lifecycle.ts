import { useEffect } from 'react';
import { useRouter } from 'expo-router';
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
 * Routes a tapped notification through the route whitelist resolver.
 */
export function useNotificationResponseHandler(): void {
  const router = useRouter();

  useEffect(() => {
    // Notifications listener hook - safe across platforms
    let subscription: { remove: () => void } | null = null;

    try {
      // Note: In development/Expo Go environments, remote push notifications
      // may be limited. If expo-notifications is loaded, register the listener.
      const Notifications = (globalThis as any).ExpoNotifications;
      if (Notifications?.addNotificationResponseReceivedListener) {
        subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
          navigateForNotification(router, response?.notification?.request?.content?.data);
        });
      }
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
