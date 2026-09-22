import { StyleSheet } from 'react-native';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export const settingsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  sectionLabel: {
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.one,
  },
});
