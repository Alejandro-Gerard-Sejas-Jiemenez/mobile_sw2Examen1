import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View } from 'react-native';

import { ThemedText, ThemedView } from '@/components';
import { tabsStyles } from '@/styles';
import { useSyncRemoteAudits } from '@/services/api';

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && tabsStyles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={tabsStyles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={tabsStyles.tabListContainer}>
      <ThemedView type="backgroundElement" style={tabsStyles.innerContainer}>
        <ThemedText type="smallBold" style={tabsStyles.brandText}>
          Auditor Mobile Console
        </ThemedText>
        {props.children}
      </ThemedView>
    </View>
  );
}

export default function AppTabs() {
  useSyncRemoteAudits();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Monitoring</TabButton>
          </TabTrigger>
          <TabTrigger name="alerts" href="/alerts" asChild>
            <TabButton>Alerts</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}
