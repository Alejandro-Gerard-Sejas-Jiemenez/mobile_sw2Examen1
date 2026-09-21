import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SeverityBadge } from '@/components/severity-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAlerts } from '@/services/api/use-alerts';
import type { Alert } from '@/services/api/types';

function AlertRow({ alert }: { alert: Alert }) {
  const theme = useTheme();
  const router = useRouter();
  const isUnread = alert.readState === 'unread';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/(tabs)/findings/[findingId]', params: { findingId: alert.findingId } })
      }
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <ThemedView type="backgroundElement" style={styles.alertCard}>
        {isUnread ? <View style={[styles.unreadDot, { backgroundColor: theme.tint }]} /> : null}
        <View style={styles.alertContent}>
          <View style={styles.alertHeaderRow}>
            <SeverityBadge label={alert.severityLabel} />
            <ThemedText type="small" themeColor="textSecondary">
              {new Date(alert.deliveredAt).toLocaleString()}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Finding {alert.findingId}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

export default function AlertsScreen() {
  const { data: alerts, isLoading, isError } = useAlerts();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            ALERTS
          </ThemedText>
        </ThemedView>

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerMessage}>
            Loading alerts…
          </ThemedText>
        ) : isError ? (
          <ThemedText type="small" themeColor="danger" style={styles.centerMessage}>
            Couldn't load alerts. Pull to refresh once connectivity is restored.
          </ThemedText>
        ) : alerts && alerts.length > 0 ? (
          <FlatList
            data={alerts}
            keyExtractor={(alert) => alert.id}
            renderItem={({ item }) => <AlertRow alert={item} />}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerMessage}>
            No alerts yet.
          </ThemedText>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  centerMessage: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  alertCard: {
    flexDirection: 'row',
    borderRadius: 6,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.one,
  },
  alertContent: {
    flex: 1,
    gap: Spacing.one,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
