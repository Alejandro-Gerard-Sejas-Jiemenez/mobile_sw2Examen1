import { StyleSheet } from 'react-native';
import { BorderRadius, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export const reportHistoryStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  centerMessage: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
  reportCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  reportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  reportAuditName: {
    flex: 1,
  },
  reportMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Detail screen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  detailContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  metaCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  bodyText: {
    lineHeight: 20,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
