import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { AUDITS_POLL_INTERVAL_MS, useAudits } from '@/services/api/use-audits';
import { useLogout } from '@/services/auth/use-logout';
import type { Audit } from '@/services/api/types';

const STALE_THRESHOLD_MS = AUDITS_POLL_INTERVAL_MS * 1.5;

function AuditRow({ audit }: { audit: Audit }) {
  return (
    <ThemedView type="backgroundElement" style={styles.auditCard}>
      <ThemedText type="smallBold">{audit.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Status: {audit.status}
      </ThemedText>
      {audit.testBatteries.map((battery) => (
        <ThemedText key={battery.id} type="small">
          {battery.name} — {battery.status} ({battery.progressPercent}%)
        </ThemedText>
      ))}
      <ThemedText type="small" themeColor="textSecondary">
        {audit.metrics.requestsSent} requests · {audit.metrics.pagesScanned} pages scanned
      </ThemedText>
    </ThemedView>
  );
}

export default function MonitoringPanelScreen() {
  const { data: audits, dataUpdatedAt, isLoading, isError } = useAudits();
  const logout = useLogout();
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
            Monitoring
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={() => logout()}>
            <ThemedText type="link">Sign out</ThemedText>
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
  },
  staleBanner: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    padding: Spacing.two,
    borderRadius: Spacing.two,
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
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
