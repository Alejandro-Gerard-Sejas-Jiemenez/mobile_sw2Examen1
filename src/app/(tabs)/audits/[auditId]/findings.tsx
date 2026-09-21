import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SeverityBadge } from '@/components/severity-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAudits } from '@/services/api/use-audits';
import { useFindings } from '@/services/api/use-findings';
import type { Finding } from '@/services/api/types';

function FindingRow({ finding }: { finding: Finding }) {
  const router = useRouter();
  const isPreliminary = finding.confirmationState === 'preliminary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/(tabs)/findings/[findingId]', params: { findingId: finding.id } })
      }
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <ThemedView type="backgroundElement" style={styles.findingCard}>
        <View style={styles.findingHeaderRow}>
          <SeverityBadge label={finding.severity} />
          {/* Confirmation state = color + text together (FR-010), same rule the
              severity-data-display skill applies to severity. */}
          <ThemedText
            type="smallBold"
            themeColor={isPreliminary ? 'textSecondary' : 'success'}>
            {finding.confirmationState.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {finding.type.toUpperCase()}
        </ThemedText>
        <ThemedText type="default">{finding.summary}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export default function AuditFindingsScreen() {
  const { auditId } = useLocalSearchParams<{ auditId: string }>();
  const resolvedAuditId = auditId ?? '';
  const router = useRouter();
  const { data: findings, isLoading, isError } = useFindings(resolvedAuditId);
  // Best-effort title lookup from the already-cached audits list (T018) — falls
  // back to the raw id if that list hasn't loaded yet.
  const { data: audits } = useAudits();
  const auditName = audits?.find((audit) => audit.id === resolvedAuditId)?.name ?? resolvedAuditId;

  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitles}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', marginBottom: 2 }]}>
                <ThemedText type="smallBold" themeColor="tint">
                  ← Volver a Monitoreo
                </ThemedText>
              </Pressable>
              <ThemedText type="title" style={styles.headerTitle} numberOfLines={1}>
                {auditName.toUpperCase()}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/(tabs)/audits/[auditId]/report', params: { auditId: resolvedAuditId } })
              }
              style={({ pressed }) => [
                styles.reportHeaderBtn,
                { backgroundColor: theme.tint, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                📄 Reporte IA →
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerMessage}>
            Loading findings…
          </ThemedText>
        ) : isError ? (
          <ThemedText type="small" themeColor="danger" style={styles.centerMessage}>
            Couldn't load findings. Pull to refresh once connectivity is restored.
          </ThemedText>
        ) : findings && findings.length > 0 ? (
          <FlatList
            data={findings}
            keyExtractor={(finding) => finding.id}
            renderItem={({ item }) => <FindingRow finding={item} />}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerMessage}>
            No findings for this audit yet.
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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  headerTitles: {
    flex: 1,
    gap: Spacing.half,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0.3,
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
  findingCard: {
    borderRadius: 6,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  findingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  reportHeaderBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
