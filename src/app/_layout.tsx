import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, LogBox } from 'react-native';

import { AnimatedSplashOverlay } from '@/components';
import { queryClient } from '@/services/api';
import {
  useAuditorSession,
  useProtectedRoute,
  useSessionBootstrap,
} from '@/services/auth';
import {
  usePushTokenRegistration,
  useNotificationResponseHandler,
} from '@/services/notifications';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

SplashScreen.preventAutoHideAsync();

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
