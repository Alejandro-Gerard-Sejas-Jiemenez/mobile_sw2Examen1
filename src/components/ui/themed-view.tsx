import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  type?: 'background' | 'backgroundElement' | 'backgroundSelected';
};

export function ThemedView({
  style,
  type = 'background',
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();
  const backgroundColor = theme[type];

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
