import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '../ui/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

const AI_ENGINE_BADGE_LABELS = ['Memoria Persistente', 'Vector RAG Activo', 'System Prompt Inmutable'];

export function AiEngineBadges() {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.aiBadgesRow}>
      {AI_ENGINE_BADGE_LABELS.map((label) => (
        <View key={label} style={[styles.aiBadge, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" style={[styles.aiBadgeText, { color: theme.tint }]}>
            {label}
          </ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aiBadgesRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  aiBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.full,
  },
  aiBadgeText: {
    fontSize: 11,
  },
});

