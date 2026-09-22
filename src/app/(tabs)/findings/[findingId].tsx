import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SeverityBadge, ThemedText, ThemedView } from '@/components';
import { useSafeBack } from '@/hooks/use-safe-back';
import { useFindingDetail } from '@/services/api';
import { findingDetailStyles } from '@/styles';

export default function FindingDetailScreen() {
  const { findingId } = useLocalSearchParams<{ findingId: string }>();
  const resolvedFindingId = findingId ?? '';
  const handleBack = useSafeBack('/(tabs)');
  const { data: finding, isLoading, isUnavailable, isError } = useFindingDetail(resolvedFindingId);

  return (
    <ThemedView style={findingDetailStyles.container}>
      <SafeAreaView style={findingDetailStyles.safeArea} edges={['top']}>
        <View style={findingDetailStyles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={handleBack}
            style={({ pressed }) => [findingDetailStyles.backButton, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="smallBold">Volver</ThemedText>
          </Pressable>
          <ThemedText type="smallBold">FINDING</ThemedText>
        </View>

        {isLoading ? (
          <ThemedText type="small" themeColor="textSecondary" style={findingDetailStyles.centerMessage}>
            Loading finding...
          </ThemedText>
        ) : isUnavailable ? (
          <ThemedText type="small" themeColor="danger" style={findingDetailStyles.centerMessage}>
            This finding is no longer available. It may have been removed, or you no longer have
            permission to view it.
          </ThemedText>
        ) : isError || !finding ? (
          <ThemedText type="small" themeColor="danger" style={findingDetailStyles.centerMessage}>
            No se pudo cargar este hallazgo. Desliza para actualizar cuando se restablezca la conexion.
          </ThemedText>
        ) : (
          <ScrollView contentContainerStyle={findingDetailStyles.content}>
            <View style={findingDetailStyles.summaryHeaderRow}>
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

            <ThemedText type="subtitle" style={findingDetailStyles.summary}>
              {finding.summary}
            </ThemedText>

            {finding.reclassifiedAt ? (
              <ThemedView type="backgroundSelected" style={findingDetailStyles.reclassifiedBanner}>
                <ThemedText type="small">
                  Reclassified on {new Date(finding.reclassifiedAt).toLocaleString()} - this may
                  differ from the severity shown in an earlier alert.
                </ThemedText>
              </ThemedView>
            ) : null}

            {finding.evidence ? (
              <ThemedView type="backgroundElement" style={findingDetailStyles.section}>
                <ThemedText type="smallBold" style={findingDetailStyles.sectionTitle}>
                  EVIDENCE
                </ThemedText>
                <ThemedText type="default">{finding.evidence}</ThemedText>
              </ThemedView>
            ) : null}

            {finding.impactParameters && Object.keys(finding.impactParameters).length > 0 ? (
              <ThemedView type="backgroundElement" style={findingDetailStyles.section}>
                <ThemedText type="smallBold" style={findingDetailStyles.sectionTitle}>
                  IMPACT PARAMETERS
                </ThemedText>
                {Object.entries(finding.impactParameters).map(([key, value]) => (
                  <View key={key} style={findingDetailStyles.impactRow}>
                    <ThemedText type="small" themeColor="textSecondary" style={findingDetailStyles.impactKey}>
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
