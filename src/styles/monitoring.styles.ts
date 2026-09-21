import { StyleSheet } from 'react-native';
import { BorderRadius, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export const monitoringStyles = StyleSheet.create({
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  signOutButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    minHeight: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staleBanner: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    padding: Spacing.two,
    borderRadius: BorderRadius.xs,
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
  auditCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  accentStripe: {
    width: 6,
  },
  auditCardContent: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  auditHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  auditName: {
    flex: 1,
    letterSpacing: 0.3,
  },
  batteryList: {
    gap: Spacing.two,
  },
  batteryRow: {
    gap: Spacing.half,
  },
  batteryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batteryName: {
    flex: 1,
  },
  metricsLine: {
    marginTop: 0,
  },
  auditFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
    paddingTop: Spacing.one,
    borderTopWidth: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  cardActionBtnSecondary: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActionBtnPrimary: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  newAuditHeaderButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.sm,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  emptyActionBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
