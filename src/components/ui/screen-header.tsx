import { View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';

interface ScreenHeaderProps {
  title: string;
  rightSlot?: React.ReactNode;
}

/**
 * Header consistente para todas las pantallas tab.
 * Solo título bold — sin subtítulos para mantener peso visual uniforme.
 */
export function ScreenHeader({ title, rightSlot }: ScreenHeaderProps) {
  return (
    <ThemedView style={screenHeaderStyles.container}>
      <ThemedText type="title" style={screenHeaderStyles.title} numberOfLines={1}>
        {title}
      </ThemedText>
      {rightSlot ? <View style={screenHeaderStyles.right}>{rightSlot}</View> : null}
    </ThemedView>
  );
}

const screenHeaderStyles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  title: {
    flex: 1,
  },
  right: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.two,
  },
};
