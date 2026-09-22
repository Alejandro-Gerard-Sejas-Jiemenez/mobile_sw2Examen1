import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { SeverityBadge } from '../ui/severity-badge';
import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { type Finding } from '@/services/api';
import { auditFindingsStyles } from '@/styles';

interface FindingRowProps {
  finding: Finding;
}

export function FindingRow({ finding }: FindingRowProps) {
  const router = useRouter();
  const isPreliminary = finding.confirmationState === 'preliminary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Hallazgo: ${finding.summary}`}
      onPress={() =>
        router.push({ pathname: '/(tabs)/findings/[findingId]', params: { findingId: finding.id } })
      }
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <ThemedView type="backgroundElement" style={auditFindingsStyles.findingCard}>
        <View style={auditFindingsStyles.findingHeaderRow}>
          <SeverityBadge label={finding.severity} />
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
