/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Brand palette shared with the web console (parcial_front/src/index.css
    // @theme block) + Tailwind's slate scale, which the web app already uses
    // for its own neutrals (bg-slate-50, text-slate-900, text-slate-500...).
    text: '#0F172A', // slate-900
    background: '#F8FAFC', // --color-app-bg
    backgroundElement: '#F1F5F9', // slate-100
    backgroundSelected: '#E2E8F0', // slate-200
    textSecondary: '#64748B', // slate-500
    tint: '#1E40AF', // --color-primary
    // Text/icon color to use ON TOP of a `tint`-filled surface (e.g. a
    // primary button). Kept separate from `tint` because light/dark use
    // opposite polarities here — see dark.onTint below.
    onTint: '#FFFFFF',
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
    backgroundElement: '#1E293B', // slate-800, same hex as web's --color-sidebar-hover
    backgroundSelected: '#1E3A8A', // --color-sidebar-active
    textSecondary: '#94A3B8', // slate-400
    tint: '#38BDF8', // --color-accent
    // Accent is light, so text/icons on top of it need a dark foreground —
    // reusing the web's --color-sidebar navy reads as "on-brand" rather than
    // a generic black.
    onTint: '#0F172A',
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
