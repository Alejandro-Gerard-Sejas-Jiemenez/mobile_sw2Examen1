import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Flat, color-filled progress track — no gradients/shadows (minimalism +
 * brutalist accents direction). The numeric label is monospace so digits
 * don't jitter in width as the value changes.
 */
export function ProgressBar({
  progress,
  color,
}: {
  /** 0-100 */
  progress: number;
  /** Theme color hex; defaults to tint. */
  color?: string;
}) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(100, progress));
  const fillColor = color ?? theme.tint;

  return (
    <View style={styles.row}>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fillColor }]} />
      </View>
      <ThemedText type="code" style={styles.percentLabel}>
        {String(clamped).padStart(3, ' ')}%
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  percentLabel: {
    minWidth: 44,
    textAlign: 'right',
  },
});
