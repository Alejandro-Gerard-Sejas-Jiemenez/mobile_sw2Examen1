/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    tint: '#208AEF',
    danger: '#D0342C',
    success: '#2E7D32',
    // Severity badges (see severity-data-display skill) — color + icon + text
    // together, never color alone.
    severityCritical: '#B3261E',
    severityHigh: '#C4560C',
    severityMedium: '#A66A00',
    severityLow: '#3A6B35',
  },
  dark: {
    text: '#ffffff',
    // Pure black on purpose: OLED screens draw ~zero power per black pixel.
    // Do not "soften" this to a dark gray for aesthetics — see
    // severity-data-display skill, section 5.
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    tint: '#3C9FFE',
    danger: '#FF6B60',
    success: '#7BC67E',
    // Deliberately lighter/less saturated than the light-mode values above —
    // a saturated "red-500"-equivalent on a black background is harder to
    // read in bright/outdoor conditions. Never reuse the light-mode hex here.
    severityCritical: '#F2867B',
    severityHigh: '#F5A968',
    severityMedium: '#E8C468',
    severityLow: '#8FC48A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
