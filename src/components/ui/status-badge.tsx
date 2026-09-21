import { View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  AUDIT_STATUSES,
  STATUS_COLOR_TOKENS,
} from '@/constants/audit.constants';
import { badgeStyles, layoutStyles } from '@/styles';

export type Status = (typeof AUDIT_STATUSES)[keyof typeof AUDIT_STATUSES];

export function colorTokenFor(status: Status): ThemeColor {
  return STATUS_COLOR_TOKENS[status] || 'textSecondary';
}

/**
 * Status = colored dot + uppercase text, always together.
 */
export function StatusBadge({
  status,
  size = 'default',
}: {
  status: Status;
  size?: 'default' | 'small';
}) {
  const theme = useTheme();
  const color = theme[colorTokenFor(status)];
  const isSmall = size === 'small';

  return (
    <View style={[layoutStyles.row, layoutStyles.gap1]}>
      <View
        style={[
          isSmall ? badgeStyles.statusDotSmall : badgeStyles.statusDotDefault,
          { backgroundColor: color },
        ]}
      />
      <ThemedText
        type={isSmall ? 'small' : 'smallBold'}
        style={[badgeStyles.statusLabel, { color }]}>
        {status.toUpperCase()}
      </ThemedText>
    </View>
  );
}
