import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Status = 'running' | 'completed' | 'paused' | 'queued' | 'failed';

export function colorTokenFor(status: Status): ThemeColor {
  switch (status) {
    case 'running':
      return 'tint';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    case 'paused':
    case 'queued':
      return 'textSecondary';
  }
}

/**
 * Status = colored dot + uppercase text, always together (same rule as
 * severity: color alone is never the only signal — see severity-data-display
 * skill).
 */
export function StatusBadge({ status, size = 'default' }: { status: Status; size?: 'default' | 'small' }) {
  const theme = useTheme();
  const color = theme[colorTokenFor(status)];
  const isSmall = size === 'small';

  return (
    <View style={styles.row}>
      <View style={[styles.dot, isSmall && styles.dotSmall, { backgroundColor: color }]} />
      <ThemedText type={isSmall ? 'small' : 'smallBold'} style={[styles.label, { color }]}>
        {status.toUpperCase()}
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    letterSpacing: 0.5,
  },
});
