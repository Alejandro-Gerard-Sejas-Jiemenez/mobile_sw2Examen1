import { StyleSheet } from 'react-native';
import { OverlayColors, Spacing } from '@/constants/theme';

export const layoutStyles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBetweenTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerFlex: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: OverlayColors.modalBackdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  gap1: {
    gap: Spacing.one,
  },
  gap2: {
    gap: Spacing.two,
  },
  gap3: {
    gap: Spacing.three,
  },
  gap4: {
    gap: Spacing.four,
  },
});
