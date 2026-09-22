import { StyleSheet } from 'react-native';
import { Fonts, TypographyLineHeight } from '@/constants/theme';

// Typography scale (skill: clear hierarchy, no visual clash)
// title(22) > subtitle(17) > default(15) > small(13) > code(12)
export const typographyStyles = StyleSheet.create({
  default: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts?.sans,
  },
  defaultSemiBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: Fonts?.sans,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.3,
    fontFamily: Fonts?.sans,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    fontFamily: Fonts?.sans,
  },
  link: {
    lineHeight: TypographyLineHeight.link,
    fontSize: 15,
    fontFamily: Fonts?.sans,
  },
  code: {
    fontFamily: Fonts?.mono,
    fontSize: 12,
    lineHeight: 17,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts?.sans,
  },
  smallBold: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: Fonts?.sans,
  },
});
