import { StyleSheet } from 'react-native';
import { Fonts, Typography, TypographyLineHeight } from '@/constants/theme';

export const typographyStyles = StyleSheet.create({
  default: {
    fontSize: Typography.lg,
    lineHeight: TypographyLineHeight.lg,
    fontFamily: Fonts?.sans,
  },
  defaultSemiBold: {
    fontSize: Typography.lg,
    lineHeight: TypographyLineHeight.lg,
    fontWeight: '600',
    fontFamily: Fonts?.sans,
  },
  title: {
    fontSize: Typography.title,
    fontWeight: 'bold',
    lineHeight: TypographyLineHeight.title,
    fontFamily: Fonts?.sans,
  },
  subtitle: {
    fontSize: Typography.subtitle,
    fontWeight: 'bold',
    lineHeight: TypographyLineHeight.subtitle,
    fontFamily: Fonts?.sans,
  },
  link: {
    lineHeight: TypographyLineHeight.link,
    fontSize: Typography.lg,
    fontFamily: Fonts?.sans,
  },
  code: {
    fontFamily: Fonts?.mono,
    fontSize: Typography.sm,
    lineHeight: TypographyLineHeight.sm,
  },
  small: {
    fontSize: Typography.sm + 1,
    lineHeight: TypographyLineHeight.xl - 10,
    fontFamily: Fonts?.sans,
  },
  smallBold: {
    fontSize: Typography.sm + 1,
    lineHeight: TypographyLineHeight.xl - 10,
    fontWeight: '600',
    fontFamily: Fonts?.sans,
  },
});
