/**
 * Design system tokens, color scales, typography and spacing constants.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A', // slate-900
    background: '#F8FAFC', // --color-app-bg
    backgroundElement: '#F1F5F9', // slate-100
    backgroundSelected: '#E2E8F0', // slate-200
    textSecondary: '#64748B', // slate-500
    tint: '#1E40AF', // --color-primary
    onTint: '#FFFFFF',
    danger: '#D0342C',
    success: '#2E7D32',
    severityCritical: '#B3261E',
    severityHigh: '#C4560C',
    severityMedium: '#A66A00',
    severityLow: '#3A6B35',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#1E293B', // slate-800
    backgroundSelected: '#1E3A8A', // --color-sidebar-active
    textSecondary: '#94A3B8', // slate-400
    tint: '#38BDF8', // --color-accent
    onTint: '#0F172A',
    danger: '#FF6B60',
    success: '#7BC67E',
    severityCritical: '#F2867B',
    severityHigh: '#F5A968',
    severityMedium: '#E8C468',
    severityLow: '#8FC48A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const OverlayColors = {
  modalBackdrop: 'rgba(0,0,0,0.6)',
  scannerHeader: 'rgba(0,0,0,0.85)',
  scannerUnfocused: 'rgba(0,0,0,0.55)',
  scannerGlass: 'rgba(255,255,255,0.2)',
  instructionBanner: 'rgba(0,0,0,0.6)',
  headerBorder: '#33415533',
  linkBlue: '#3B82F6',
  white: '#FFFFFF',
} as const;

export const Fonts = Platform.select({
  ios: {
    regular: 'system-ui',
    semiBold: 'system-ui',
    bold: 'system-ui',
    mono: 'ui-monospace',
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
  },
  default: {
    regular: 'normal',
    semiBold: 'normal',
    bold: 'normal',
    mono: 'monospace',
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
  },
  web: {
    regular: 'var(--font-display)',
    semiBold: 'var(--font-display)',
    bold: 'var(--font-display)',
    mono: 'var(--font-mono)',
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
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

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  full: 9999,
} as const;

export const Typography = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  title: 32,
  subtitle: 20,
} as const;

export const TypographyLineHeight = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  title: 32,
  subtitle: 24,
  link: 30,
} as const;

export const ComponentLayout = {
  QR_FRAME_SIZE: 260,
  MODAL_MAX_WIDTH: 480,
  PERMISSION_CARD_MAX_WIDTH: 360,
  BUTTON_MIN_WIDTH: 140,
  PROGRESS_BAR_HEIGHT: 8,
  PROGRESS_LABEL_MIN_WIDTH: 44,
} as const;

export const AnimationTokens = {
  SPLASH_DURATION_MS: 600,
  WEB_DURATION_MS: 300,
  GLOW_DURATION_MS: 240000,
  INITIAL_SCALE_DIVISOR: 90,
  ICON_SIZE: 128,
  GLOW_SIZE: 201,
  LOGO_WIDTH: 76,
  LOGO_HEIGHT: 71,
  LOGO_BORDER_RADIUS: 40,
  WEB_TOP_OFFSET: 202,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
