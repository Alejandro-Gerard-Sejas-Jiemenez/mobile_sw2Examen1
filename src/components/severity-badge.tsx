import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type NormalizedSeverity = 'critical' | 'high' | 'medium' | 'low' | 'unknown';

// Glyph + color + text together, never color alone (severity-data-display
// skill, rule 1) — plain Unicode glyphs so no new icon library dependency is
// needed just for this.
const GLYPH_BY_SEVERITY: Record<NormalizedSeverity, string> = {
  critical: '⛔',
  high: '▲',
  medium: 'ⓘ',
  low: '✓',
  unknown: '•',
};

const COLOR_TOKEN_BY_SEVERITY: Record<NormalizedSeverity, ThemeColor> = {
  critical: 'severityCritical',
  high: 'severityHigh',
  medium: 'severityMedium',
  low: 'severityLow',
  unknown: 'textSecondary',
};

function normalize(label: string): NormalizedSeverity {
  const lower = label.trim().toLowerCase();
  if (lower === 'critical' || lower === 'high' || lower === 'medium' || lower === 'low') {
    return lower;
  }
  return 'unknown';
}

/**
 * Renders a free-form severity label (e.g. `Alert.severityLabel`, which is a
 * generic display string, not the strict `FindingSeverity` enum) as a
 * glyph + color + text badge. Falls back to a neutral style for a label that
 * doesn't match one of the four known severities, rather than guessing.
 */
export function SeverityBadge({ label }: { label: string }) {
  const theme = useTheme();
  const severity = normalize(label);
  const color = theme[COLOR_TOKEN_BY_SEVERITY[severity]];

  return (
    <View style={styles.row}>
      <ThemedText style={[styles.glyph, { color }]}>{GLYPH_BY_SEVERITY[severity]}</ThemedText>
      <ThemedText type="smallBold" style={{ color }}>
        {label.toUpperCase()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  glyph: {
    fontSize: 14,
    lineHeight: 20,
  },
});
