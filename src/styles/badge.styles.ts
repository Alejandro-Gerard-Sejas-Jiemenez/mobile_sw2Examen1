import { StyleSheet } from 'react-native';
import { BorderRadius, ComponentLayout } from '@/constants/theme';

export const badgeStyles = StyleSheet.create({
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
