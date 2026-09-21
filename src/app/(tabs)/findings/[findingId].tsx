import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SeverityBadge } from '@/components/severity-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useFindingDetail } from '@/services/api/use-finding-detail';

export default function FindingDetailScreen() {
  const { findingId } = useLocalSearchParams<{ findingId: string }>();
  const resolvedFindingId = findingId ?? '';
  const router = useRouter();
  const { data: finding, isLoading, isUnavailable, isError } = useFindingDetail(resolvedFindingId);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="smallBold">←</ThemedText>
          </Pressable>
          <ThemedText type="smallBold">FINDING</ThemedText>
        </View>

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centerMessage}>
            Loading finding…
          </ThemedText>
        ) : isUnavailable ? (
          // T032 — explicit "no longer available" instead of stale cached content.
          <ThemedText type="small" themeColor="danger" style={styles.centerMessage}>
            This finding is no longer available. It may have been removed, or you no longer have
            permission to view it.
          </ThemedText>
        ) : isError || !finding ? (
          <ThemedText type="small" themeColor="danger" style={styles.centerMessage}>
            Couldn't load this finding. Pull to refresh once connectivity is restored.
          </ThemedText>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.summaryHeaderRow}>
              <SeverityBadge label={finding.severity} />
              <ThemedText
                type="smallBold"
                themeColor={finding.confirmationState === 'preliminary' ? 'textSecondary' : 'success'}>
                {finding.confirmationState.toUpperCase()}
              </ThemedText>
            </View>

            <ThemedText type="small" themeColor="textSecondary">
              {finding.type.toUpperCase()}
            </ThemedText>

            <ThemedText type="subtitle" style={styles.summary}>
              {finding.summary}
            </ThemedText>

            {finding.reclassifiedAt ? (
              <ThemedView type="backgroundSelected" style={styles.reclassifiedBanner}>
                <ThemedText type="small">
                  Reclassified on {new Date(finding.reclassifiedAt).toLocaleString()} — this may
                  differ from the severity shown in an earlier alert.
                </ThemedText>
              </ThemedView>
            ) : null}

            {finding.evidence ? (
              <ThemedView type="backgroundElement" style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  EVIDENCE
                </ThemedText>
                <ThemedText type="default">{finding.evidence}</ThemedText>
              </ThemedView>
            ) : null}

            {finding.impactParameters && Object.keys(finding.impactParameters).length > 0 ? (
              <ThemedView type="backgroundElement" style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  IMPACT PARAMETERS
                </ThemedText>
                {Object.entries(finding.impactParameters).map(([key, value]) => (
                  <View key={key} style={styles.impactRow}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.impactKey}>
                      {key}
                    </ThemedText>
                    <ThemedText type="code" numberOfLines={1} ellipsizeMode="middle">
                      {String(value)}
                    </ThemedText>
                  </View>
                ))}
              </ThemedView>
            ) : null}
          </ScrollView>
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
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMessage: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summary: {
    fontSize: 22,
    lineHeight: 28,
  },
  reclassifiedBanner: {
    padding: Spacing.three,
    borderRadius: 6,
  },
  section: {
    borderRadius: 6,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionTitle: {
    letterSpacing: 0.5,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  impactKey: {
    flexShrink: 0,
  },
});
