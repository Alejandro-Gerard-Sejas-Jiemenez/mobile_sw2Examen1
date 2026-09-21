import { StyleSheet } from 'react-native';
import { BorderRadius, MaxContentWidth, OverlayColors, Spacing } from '@/constants/theme';

export const reportScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: OverlayColors.headerBorder,
  },
  backBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    marginRight: Spacing.two,
    minHeight: 36,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  formatToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  formatButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  aiBadgesRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  aiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  previewScroll: {
    flex: 1,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  previewContent: {
    paddingBottom: Spacing.four,
  },
  centerMessage: {
    textAlign: 'center',
    marginVertical: Spacing.four,
  },
  previewCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: OverlayColors.headerBorder,
  },
  previewHint: {
    marginBottom: Spacing.two,
    fontSize: 12,
  },
  previewBodyText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  statusLine: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionsRow: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: OverlayColors.headerBorder,
  },
  buttonGroup: {
    gap: Spacing.two,
  },
  primaryActionButton: {
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionButton: {
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flexHalfButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
