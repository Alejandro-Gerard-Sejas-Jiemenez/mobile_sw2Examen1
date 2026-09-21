import { View } from 'react-native';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { layoutStyles, commonStyles, badgeStyles } from '@/styles';

export interface ProgressBarProps {
  /** 0-100 */
  progress: number;
  /** Theme color hex; defaults to tint. */
  color?: string;
}

/**
 * Flat, color-filled reusable progress track.
 */
export function ProgressBar({ progress, color }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(100, progress));
  const fillColor = color ?? theme.tint;

  return (
    <View style={[layoutStyles.row, layoutStyles.gap2]}>
      <View style={[commonStyles.progressBarTrack, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[commonStyles.progressBarFill, { width: `${clamped}%`, backgroundColor: fillColor }]} />
      </View>
      <ThemedText
        type="code"
        style={badgeStyles.progressLabel}>
        {String(clamped).padStart(3, ' ')}%
      </ThemedText>
    </View>
  );
}
