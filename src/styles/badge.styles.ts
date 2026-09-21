import { StyleSheet } from 'react-native';
import { BorderRadius, ComponentLayout, Typography } from '@/constants/theme';

export const badgeStyles = StyleSheet.create({
  severityGlyph: {
    fontSize: Typography.md,
    lineHeight: 20,
  },
  statusDotDefault: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.xs,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.xs,
  },
  statusLabel: {
    letterSpacing: 0.5,
  },
  progressLabel: {
    minWidth: ComponentLayout.PROGRESS_LABEL_MIN_WIDTH,
    textAlign: 'right',
  },
});
