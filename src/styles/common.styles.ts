import { StyleSheet } from 'react-native';
import {
  BorderRadius,
  ComponentLayout,
  Spacing,
  Typography,
} from '@/constants/theme';

export const commonStyles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: BorderRadius.xl,
    gap: Spacing.two,
  },
  modalCard: {
    width: '100%',
    maxWidth: ComponentLayout.MODAL_MAX_WIDTH,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  permissionCard: {
    width: '100%',
    maxWidth: ComponentLayout.PERMISSION_CARD_MAX_WIDTH,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: Typography.md,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.sm,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.sm,
  },
  buttonPrimary: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: ComponentLayout.BUTTON_MIN_WIDTH,
  },
  buttonSecondary: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarTrack: {
    flex: 1,
    height: ComponentLayout.PROGRESS_BAR_HEIGHT,
    borderRadius: BorderRadius.xs / 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.xs / 2,
  },
  errorBox: {
    padding: Spacing.two,
    borderRadius: BorderRadius.sm,
  },
});
