import { Text, type TextProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { typographyStyles } from '@/styles';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'code' | 'small' | 'smallBold';
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  themeColor = 'text',
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const color = theme[themeColor];

  return (
    <Text
      style={[
        { color },
        type === 'default' ? typographyStyles.default : undefined,
        type === 'title' ? typographyStyles.title : undefined,
        type === 'defaultSemiBold' ? typographyStyles.defaultSemiBold : undefined,
        type === 'subtitle' ? typographyStyles.subtitle : undefined,
        type === 'link' ? [typographyStyles.link, { color: theme.tint }] : undefined,
        type === 'code' ? typographyStyles.code : undefined,
        type === 'small' ? typographyStyles.small : undefined,
        type === 'smallBold' ? typographyStyles.smallBold : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
