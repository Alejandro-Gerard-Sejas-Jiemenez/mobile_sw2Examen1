import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AiModelCard,
  colorTokenFor,
  NewAuditModal,
  ProgressBar,
  StatusBadge,
  ThemedText,
  ThemedView,
} from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { AUDITS_POLL_INTERVAL_MS, useAudits, type Audit } from '@/services/api';
import { useLogout } from '@/services/auth';
import { monitoringStyles } from '@/styles';

const STALE_THRESHOLD_MS = AUDITS_POLL_INTERVAL_MS * 1.5;

function AuditRow({ audit }: { audit: Audit }) {
  const theme = useTheme();
  const router = useRouter();
  const accentColor = theme[colorTokenFor(audit.status)];
  const isCompleted = audit.status === 'completed';

  return (
    <ThemedView type="backgroundElement" style={monitoringStyles.auditCard}>
      <View style={[monitoringStyles.accentStripe, { backgroundColor: accentColor }]} />
      <View style={monitoringStyles.auditCardContent}>
        <View style={monitoringStyles.auditHeaderRow}>
          <ThemedText type="smallBold" style={monitoringStyles.auditName}>
            {audit.name.toUpperCase()}
          </ThemedText>
          <StatusBadge status={audit.status} />
        </View>

        <View style={monitoringStyles.batteryList}>
          {audit.testBatteries.map((battery) => (
            <View key={battery.id} style={monitoringStyles.batteryRow}>
              <View style={monitoringStyles.batteryHeaderRow}>
                <ThemedText type="small" themeColor="textSecondary" style={monitoringStyles.batteryName}>
                  {battery.name}
                </ThemedText>
                <StatusBadge status={battery.status} size="small" />
              </View>
              <ProgressBar progress={battery.progressPercent} color={theme[colorTokenFor(battery.status)]} />
            </View>
          ))}
        </View>

        <View style={[monitoringStyles.auditFooterRow, { borderTopColor: theme.backgroundSelected }]}>
          <ThemedText type="code" themeColor="textSecondary" style={monitoringStyles.metricsLine}>
            {audit.metrics.requestsSent} req · {audit.metrics.pagesScanned} pages
          </ThemedText>

          <View style={monitoringStyles.cardActionsRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/(tabs)/audits/[auditId]/findings', params: { auditId: audit.id } })
              }
              style={({ pressed }) => [
                monitoringStyles.cardActionBtnSecondary,
                { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ fontSize: 12 }}>
                Hallazgos
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/(tabs)/audits/[auditId]/report', params: { auditId: audit.id } })
              }
              style={({ pressed }) => [
                monitoringStyles.cardActionBtnPrimary,
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
                Reporte IA
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
    <ThemedView style={monitoringStyles.container}>
      <SafeAreaView style={monitoringStyles.safeArea} edges={['top']}>
        <ThemedView style={monitoringStyles.header}>
          <View>
            <ThemedText type="title" style={monitoringStyles.headerTitle}>
              MONITORING
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Consola de Auditoría & Inyecciones
            </ThemedText>
          </View>
          <View style={monitoringStyles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nueva Auditoría"
              onPress={() => setIsNewAuditModalOpen(true)}
              style={({ pressed }) => [
                monitoringStyles.newAuditHeaderButton,
                { backgroundColor: theme.tint, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                + AUDITAR
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              onPress={() => logout()}
              style={({ pressed }) => [
                monitoringStyles.signOutButton,
                { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.6 : 1 },
              ]}>
              <ThemedText type="smallBold">SALIR</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        <AiModelCard />

        {isDataStale ? (
          <ThemedView type="backgroundSelected" style={monitoringStyles.staleBanner}>
            <ThemedText type="small">
              Showing data from {Math.round((now - dataUpdatedAt) / 1000)}s ago — connection may be
              interrupted.
            </ThemedText>
          </ThemedView>
        ) : null}

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={monitoringStyles.centerMessage}>
            Loading audits…
          </ThemedText>
        ) : isError ? (
          <ThemedText type="small" themeColor="danger" style={monitoringStyles.centerMessage}>
            Couldn't load audits. Pull to refresh once connectivity is restored.
          </ThemedText>
        ) : audits && audits.length > 0 ? (
          <FlatList
            data={audits}
            keyExtractor={(audit) => audit.id}
            renderItem={({ item }) => <AuditRow audit={item} />}
            contentContainerStyle={monitoringStyles.listContent}
          />
        ) : (
          <ThemedView style={monitoringStyles.emptyContainer}>
            <ThemedText type="small" themeColor="textSecondary" style={monitoringStyles.centerMessage}>
              No audits are currently running.
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Iniciar Nueva Auditoría"
              style={[monitoringStyles.emptyActionBtn, { backgroundColor: theme.tint }]}
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
