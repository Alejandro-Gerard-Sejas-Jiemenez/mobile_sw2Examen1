import { Tabs } from 'expo-router';
import { Image } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { tabsStyles } from '@/styles';

export default function AppTabs() {
  const theme = useTheme();

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
            <Image
              source={require('@/assets/images/tabIcons/home.png')}
              style={[tabsStyles.tabIcon, { width: size || 24, height: size || 24, tintColor: color }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@/assets/images/tabIcons/explore.png')}
              style={[tabsStyles.tabIcon, { width: size || 24, height: size || 24, tintColor: color }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="audits/[auditId]/findings"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="audits/[auditId]/report"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="findings/[findingId]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
