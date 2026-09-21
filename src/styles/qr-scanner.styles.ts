import { Platform, StyleSheet } from 'react-native';
import { BorderRadius, OverlayColors, Spacing } from '@/constants/theme';
import { QR_SCANNER_CONSTANTS } from '@/constants/audit.constants';

export const qrScannerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'ios' ? 54 : 34,
    paddingBottom: Spacing.two,
    backgroundColor: OverlayColors.scannerHeader,
    zIndex: 10,
  },
  headerTitle: {
    color: OverlayColors.white,
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: Spacing.two,
    backgroundColor: OverlayColors.scannerGlass,
    borderRadius: BorderRadius.sm,
  },
  closeButtonText: {
    color: OverlayColors.white,
  },
  permissionLoadingText: {
    color: OverlayColors.white,
    marginTop: Spacing.two,
  },
  permissionTitle: {
    textAlign: 'center',
  },
  permissionDescription: {
    textAlign: 'center',
  },
  permissionButton: {
    width: '100%',
    paddingVertical: Spacing.three,
  },
  permissionCancelButton: {
    paddingVertical: Spacing.one,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: OverlayColors.scannerUnfocused,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetFrameRow: {
    flexDirection: 'row',
    height: QR_SCANNER_CONSTANTS.FRAME_SIZE,
  },
  targetFrame: {
    width: QR_SCANNER_CONSTANTS.FRAME_SIZE,
    height: QR_SCANNER_CONSTANTS.FRAME_SIZE,
    borderWidth: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: QR_SCANNER_CONSTANTS.CORNER_SIZE,
    height: QR_SCANNER_CONSTANTS.CORNER_SIZE,
    borderWidth: QR_SCANNER_CONSTANTS.CORNER_BORDER_WIDTH,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    color: OverlayColors.white,
    textAlign: 'center',
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    backgroundColor: OverlayColors.instructionBanner,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.sm,
  },
});
