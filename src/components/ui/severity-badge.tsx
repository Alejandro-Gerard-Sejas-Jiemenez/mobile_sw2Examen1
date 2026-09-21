import { View } from 'react-native';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import {
  FINDING_SEVERITIES,
  SEVERITY_COLOR_TOKENS,
  SEVERITY_GLYPHS,
} from '@/constants/risk.constants';
import { badgeStyles, layoutStyles } from '@/styles';

export type NormalizedSeverity =
  | (typeof FINDING_SEVERITIES)[keyof typeof FINDING_SEVERITIES]
  | 'unknown';

function normalize(label: string): NormalizedSeverity {
  const lower = label.trim().toLowerCase();
  if (
    lower === FINDING_SEVERITIES.CRITICAL ||
    lower === FINDING_SEVERITIES.HIGH ||
    lower === FINDING_SEVERITIES.MEDIUM ||
    lower === FINDING_SEVERITIES.LOW
  ) {
    return lower as NormalizedSeverity;
  }
  return 'unknown';
}

/**
 * Renders a free-form severity label as glyph + color + text badge.
 */
export function SeverityBadge({ label }: { label: string }) {
  const theme = useTheme();
  const severity = normalize(label);
  const color = theme[SEVERITY_COLOR_TOKENS[severity]];

  return (
    <View style={[layoutStyles.row, layoutStyles.gap1]}>
      <ThemedText style={[badgeStyles.severityGlyph, { color }]}>
        {SEVERITY_GLYPHS[severity]}
      </ThemedText>
      <ThemedText type="smallBold" style={{ color }}>
        {label.toUpperCase()}
      </ThemedText>
    </View>
  );
}
