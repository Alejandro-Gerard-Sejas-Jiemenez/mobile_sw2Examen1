import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/progress-bar';
import { colorTokenFor, StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AUDITS_POLL_INTERVAL_MS, useAudits } from '@/services/api/use-audits';
import type { Audit } from '@/services/api/types';
import { useLogout } from '@/services/auth/use-logout';

const STALE_THRESHOLD_MS = AUDITS_POLL_INTERVAL_MS * 1.5;

function AuditRow({ audit }: { audit: Audit }) {
  const theme = useTheme();
  const accentColor = theme[colorTokenFor(audit.status)];

  return (
    <ThemedView type="backgroundElement" style={styles.auditCard}>
      <View style={[styles.accentStripe, { backgroundColor: accentColor }]} />
      <View style={styles.auditCardContent}>
        <View style={styles.auditHeaderRow}>
          <ThemedText type="smallBold" style={styles.auditName}>
            {audit.name.toUpperCase()}
          </ThemedText>
          <StatusBadge status={audit.status} />
        </View>

        <View style={styles.batteryList}>
          {audit.testBatteries.map((battery) => (
            <View key={battery.id} style={styles.batteryRow}>
              <View style={styles.batteryHeaderRow}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.batteryName}>
                  {battery.name}
                </ThemedText>
                <StatusBadge status={battery.status} size="small" />
              </View>
              <ProgressBar progress={battery.progressPercent} color={theme[colorTokenFor(battery.status)]} />
            </View>
          ))}
        </View>

        <ThemedText type="code" themeColor="textSecondary" style={styles.metricsLine}>
          {audit.metrics.requestsSent} req · {audit.metrics.pagesScanned} pages
        </ThemedText>
      </View>
    </ThemedView>
  );
}

export default function MonitoringPanelScreen() {
  const { data: audits, dataUpdatedAt, isLoading, isError } = useAudits();
  const logout = useLogout();
  const theme = useTheme();
  const [now, setNow] = useState(() => Date.now());

  // Re-evaluate staleness once a second so the indicator updates even if no
  // new poll has landed (FR-015 — never present stale data as live).
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isDataStale = dataUpdatedAt > 0 && now - dataUpdatedAt > STALE_THRESHOLD_MS;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            MONITORING
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={() => logout()}
            style={({ pressed }) => [
              styles.signOutButton,
              { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.6 : 1 },
            ]}>
            <ThemedText type="smallBold">⏻</ThemedText>
          </Pressable>
        </ThemedView>

        {isDataStale ? (
          <ThemedView type="backgroundSelected" style={styles.staleBanner}>
            <ThemedText type="small">
              Showing data from {Math.round((now - dataUpdatedAt) / 1000)}s ago — connection may be
              interrupted.
            </ThemedText>
          </ThemedView>
        ) : null}

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerMessage}>
            Loading audits…
          </ThemedText>
        ) : isError ? (
          <ThemedText type="small" themeColor="danger" style={styles.centerMessage}>
            Couldn't load audits. Pull to refresh once connectivity is restored.
          </ThemedText>
        ) : audits && audits.length > 0 ? (
          <FlatList
            data={audits}
            keyExtractor={(audit) => audit.id}
            renderItem={({ item }) => <AuditRow audit={item} />}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerMessage}>
            No audits are currently running.
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staleBanner: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    padding: Spacing.two,
    borderRadius: 4,
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
  auditCard: {
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
  },
  accentStripe: {
    width: 6,
  },
  auditCardContent: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  auditHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  auditName: {
    flex: 1,
    letterSpacing: 0.3,
  },
  batteryList: {
    gap: Spacing.two,
  },
  batteryRow: {
    gap: Spacing.half,
  },
  batteryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batteryName: {
    flex: 1,
  },
  metricsLine: {
    marginTop: Spacing.one,
  },
});
