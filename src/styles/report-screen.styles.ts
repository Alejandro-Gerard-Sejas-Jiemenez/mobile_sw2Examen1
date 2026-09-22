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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: OverlayColors.headerBorder,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    letterSpacing: 0.5,
    flex: 1,
  },
  formatToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  formatButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  voiceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.two,
    minHeight: 44,
  },
  previewScroll: {
    flex: 1,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  previewContent: {
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  centerMessage: {
    textAlign: 'center',
    marginVertical: Spacing.four,
  },
  previewCard: {
    padding: Spacing.three,
    borderRadius: BorderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OverlayColors.headerBorder,
    overflow: 'hidden',
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
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionsRow: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: OverlayColors.headerBorder,
  },
  buttonGroup: {
    gap: Spacing.two,
  },
  primaryActionButton: {
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionButton: {
    paddingVertical: Spacing.two,
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
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonTextLg: {
    fontSize: 14,
  },
  actionButtonTextMd: {
    fontSize: 13,
  },
  actionButtonTextSm: {
    fontSize: 12,
  },
});

