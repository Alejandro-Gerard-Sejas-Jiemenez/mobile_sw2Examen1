import { StyleSheet } from 'react-native';
import { BorderRadius, MaxContentWidth, Spacing } from '@/constants/theme';

export const signInStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  form: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    minHeight: 48,
  },
  error: {
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.three,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
