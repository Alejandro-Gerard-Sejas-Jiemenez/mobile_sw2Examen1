import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
// import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';

let Notifications: any = null;
// Push notifications disabled in development to prevent Expo Go crashes
// try {
//   Notifications = require('expo-notifications');
// } catch (e) {
//   if (__DEV__) {
//     console.warn('[push] expo-notifications unavailable in Expo Go. Push notifications disabled.');
//   }
// }
import { useEffect } from 'react';
import { useColorScheme, LogBox } from 'react-native';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { queryClient } from '@/services/api/query-client';
import { useAuditorSession } from '@/services/auth/session-context';
import { useProtectedRoute } from '@/services/auth/use-protected-route';
import { useSessionBootstrap } from '@/services/auth/use-session-bootstrap';
import { navigateForNotification } from '@/services/notifications/handle-notification-response';
import { registerPushToken } from '@/services/notifications/register-push-token';

SplashScreen.preventAutoHideAsync();

// Foreground display policy only — the payload itself stays generic
// regardless of how it's shown (Constitution Principle IV).
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Registers this device's push token once the auditor has a session (T023). */
function usePushTokenRegistration(isAuthenticated: boolean): void {
  useEffect(() => {
    if (isAuthenticated) {
      registerPushToken();
    }
  }, [isAuthenticated]);
}

/** Routes a tapped notification through the whitelist resolver (T025, T027). */
function useNotificationResponseHandler(): void {
  const router = useRouter();

  useEffect(() => {
    if (!Notifications) return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      navigateForNotification(router, response.notification.request.content.data);
    });
    return () => subscription.remove();
  }, [router]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isBootstrapping = useSessionBootstrap();
  const { isAuthenticated } = useAuditorSession();
  useProtectedRoute(isBootstrapping);
  usePushTokenRegistration(isAuthenticated);
  useNotificationResponseHandler();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
