import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export const modelCardStyles = StyleSheet.create({
  container: {
    marginVertical: Spacing.two,
  },
  title: {
    marginBottom: Spacing.half,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: Typography.xs,
  },
  progressContainer: {
    marginTop: Spacing.two,
  },
  progressRow: {
    marginTop: Spacing.one,
  },
  footer: {
    marginTop: Spacing.two,
  },
  statusText: {
    flex: 1,
  },
  deleteButton: {
    padding: Spacing.one,
  },
  downloadButton: {
    width: '100%',
    paddingVertical: Spacing.two + 2,
  },
  downloadButtonText: {
    color: '#FFFFFF',
  },
});
