import { useRouter } from 'expo-router';
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
import { useAuditorSession } from '@/services/auth/session-context';
import { useLogout } from '@/services/auth/use-logout';
import { AiModelCard } from '@/components/ai-model-card';
import { NewAuditModal } from '@/components/new-audit-modal';

const STALE_THRESHOLD_MS = AUDITS_POLL_INTERVAL_MS * 1.5;

function AuditRow({ audit }: { audit: Audit }) {
  const theme = useTheme();
  const router = useRouter();
  const accentColor = theme[colorTokenFor(audit.status)];
  const isCompleted = audit.status === 'completed';

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

        <View style={styles.auditFooterRow}>
          <ThemedText type="code" themeColor="textSecondary" style={styles.metricsLine}>
            {audit.metrics.requestsSent} req · {audit.metrics.pagesScanned} pages
          </ThemedText>

          <View style={styles.cardActionsRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/(tabs)/audits/[auditId]/findings', params: { auditId: audit.id } })
              }
              style={({ pressed }) => [
                styles.cardActionBtnSecondary,
                { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ fontSize: 12 }}>
                🔍 Hallazgos
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/(tabs)/audits/[auditId]/report', params: { auditId: audit.id } })
              }
              style={({ pressed }) => [
                styles.cardActionBtnPrimary,
                {
                  backgroundColor: isCompleted ? theme.tint : theme.backgroundSelected,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <ThemedText
                type="smallBold"
                style={{
                  fontSize: 12,
                  color: isCompleted ? theme.onTint : theme.text,
                }}>
                📄 Reporte IA
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

export default function MonitoringPanelScreen() {
  const { data: audits, dataUpdatedAt, isLoading, isError } = useAudits();
  const logout = useLogout();
  const theme = useTheme();
  const [now, setNow] = useState(() => Date.now());
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);

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
          <View>
            <ThemedText type="title" style={styles.headerTitle}>
              MONITORING
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Consola de Auditoría & Inyecciones
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nueva Auditoría"
              onPress={() => setIsNewAuditModalOpen(true)}
              style={({ pressed }) => [
                styles.newAuditHeaderButton,
                { backgroundColor: theme.tint, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                + AUDITAR
              </ThemedText>
            </Pressable>
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
          </View>
        </ThemedView>

        <AiModelCard />

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
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerMessage}>
              No audits are currently running.
            </ThemedText>
            <Pressable
              style={[styles.emptyActionBtn, { backgroundColor: theme.tint }]}
              onPress={() => setIsNewAuditModalOpen(true)}>
              <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                + Iniciar Nueva Auditoría
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}

        <NewAuditModal
          visible={isNewAuditModalOpen}
          onClose={() => setIsNewAuditModalOpen(false)}
        />
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
    marginTop: 0,
  },
  auditFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
    paddingTop: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  cardActionBtnSecondary: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: 6,
  },
  cardActionBtnPrimary: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  newAuditHeaderButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  emptyActionBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
});
