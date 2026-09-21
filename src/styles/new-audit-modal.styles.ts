import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export const newAuditModalStyles = StyleSheet.create({
  title: {
    letterSpacing: 0.5,
  },
  description: {
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: Typography.md,
  },
  chipActiveText: {
    color: '#FFFFFF',
  },
  presetsContainer: {
    marginTop: Spacing.one,
  },
  presetChipText: {
    fontSize: Typography.sm,
  },
  actionsRow: {
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 140,
  },
});
