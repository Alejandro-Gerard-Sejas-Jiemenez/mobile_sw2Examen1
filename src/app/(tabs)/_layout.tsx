import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { useSyncRemoteAudits } from '@/services/api';

export default function AppTabs() {
  const theme = useTheme();
  useSyncRemoteAudits();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundElement,
        },
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.textSecondary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Monitoring',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-half-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="audits/[auditId]/findings" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="audits/[auditId]/report" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="findings/[findingId]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="report-history" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="report-history/[reportId]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}

