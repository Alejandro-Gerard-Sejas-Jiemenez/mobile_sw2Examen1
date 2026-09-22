import { StyleSheet } from 'react-native';
import { Spacing, Typography } from '@/constants/theme';

export const voicePromptStyles = StyleSheet.create({
  container: {
    marginBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: Typography.sm,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: Typography.sm,
    lineHeight: 16,
  },
  chipText: {
    fontSize: Typography.xs + 1,
  },
  input: {
    minHeight: 40,
    maxHeight: 70,
  },
  recordButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.md - 1,
  },
  audioPlaybackContainer: {
    marginVertical: Spacing.half,
  },
  audioPlaybackButton: {
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  audioPlaybackText: {
    fontSize: Typography.sm,
  },
  presetsRow: {
    gap: Spacing.one + 2,
  },
  recordingNotice: {
    fontSize: Typography.xs + 1,
    fontStyle: 'italic',
  },
  synthesizeButton: {
    marginTop: Spacing.half,
    width: '100%',
  },
  synthesizeText: {
    fontSize: Typography.md - 1,
  },
});
