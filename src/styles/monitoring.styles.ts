import { StyleSheet } from 'react-native';
import { BorderRadius, MaxContentWidth, Spacing } from '@/constants/theme';

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
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.4,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    paddingHorizontal: Spacing.three,
    // FAB sits at bottom: Spacing.four, is 56 tall — clear it plus a gap
    paddingBottom: Spacing.four + 56 + Spacing.two,
    gap: Spacing.two,
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
    padding: Spacing.two,
    gap: Spacing.one,
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
    gap: Spacing.one,
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
  cardActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActionText: {
    fontSize: 12,
  },
  batteryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  fab: {
    position: 'absolute',
    // expo-router's Tabs content area already sits above the tab bar
    // (tabBarStyle has no position:'absolute'), so no BottomTabInset offset needed here.
    bottom: Spacing.four,
    right: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // Android elevation
    elevation: 6,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
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
