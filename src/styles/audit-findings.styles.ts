import { StyleSheet } from 'react-native';
import { BorderRadius, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export const auditFindingsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  headerTitles: {
    flex: 1,
    gap: Spacing.half,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    minHeight: 32,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  centerMessage: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  findingCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  findingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  reportHeaderBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
