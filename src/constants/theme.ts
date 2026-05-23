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
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Palette = {
  primary: '#426256',
  primarySoft: '#eef6f4',
  primaryTint: '#cfe5dc',
  primaryTintSubtle: '#f5faf8',
  primaryText: '#2f6b55',
  ink: '#17231f',
  inkMuted: '#24312e',
  inkSoft: '#33443e',
  textSubtle: '#5f746e',
  textMuted: '#6d8178',
  textPlaceholder: '#8a9b95',
  textDisabled: '#8f8f95',
  textHint: '#9aa6a1',
  white: '#ffffff',
  screen: '#f8faf9',
  surface: '#ffffff',
  border: '#e2ebe7',
  borderMuted: '#dce8e3',
  inputBorder: '#dce3e0',
  neutralBorder: '#c8c8c8',
  progressTrack: '#e0e0e0',
  reminderBorder: '#cfe5dc',
  successSurface: '#e8f7ef',
  successBorder: '#7bc49c',
  successText: '#26734b',
  danger: '#cf4c6b',
  dangerSurface: '#fff4f4',
  dangerBorder: '#f0b7b7',
  dangerBorderSoft: '#f3c4cf',
  dangerText: '#af4b4b',
  warningSurface: '#fff7ed',
  warningBorder: '#ffd0a1',
  warningText: '#ad5a00',
  segmentSelected: '#426256',
  doseSurface: '#eef6f4',
  meshListeningFallback: '#ead4ee',
} as const;

export const Gradients = {
  primaryBlue: ['#426256', '#5f8a78', '#cfe5dc'] as const,
  primaryBlueStrong: ['#2f6b55', '#426256'] as const,
  meshListeningBase: ['#ead1ee', '#f8c3d8', '#c8d8ff', '#dacbf2'] as const,
  meshBlueRadial: ['#b8caff', '#c9d9ffcc', '#c9d9ff00'] as const,
  meshPinkRadial: ['#ffaccd', '#f7b8d580', '#f7b8d500'] as const,
  meshWhiteRadial: ['#ffffffd9', '#ffffff60', '#ffffff00'] as const,
  meshLowerBlueRadial: ['#cfdcff', '#bfcfff66', '#bfcfff00'] as const,
  meshHighlight: ['#ffffff00', '#ffffff', '#ffffff00'] as const,
  profileAvatar: ['#f2fbf4', '#d6f4df', '#b8e8c8'] as const,
  voiceShubh: ['#5AA7A7', '#96D7C6'] as const,
  voicePriya: ['#96D7C6', '#BAC94A'] as const,
  voiceNeha: ['#BAC94A', '#E2D36B'] as const,
  voiceRahul: ['#E2D36B', '#96D7C6'] as const,
  voicePooja: ['#6C8CBF', '#96D7C6'] as const,
  voiceRohan: ['#5AA7A7', '#E2D36B'] as const,
  voiceKavya: ['#6C8CBF', '#BAC94A'] as const,
} as const;

export const Typography = {
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  control: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodyRelaxed: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
  },
  itemTitle: {
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: 0,
  },
  calendarNumber: {
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: 0,
  },
  glyph: {
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0,
  },
  listTitle: {
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: 0,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 0,
  },
  calendarTitle: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0,
  },
} as const;

export const Shadows = {
  primarySoft: {
    shadowColor: Palette.primary,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardSoft: {
    shadowColor: Palette.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: Palette.ink,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;

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

export const BottomTabInset = Platform.select({ ios: 20, android: 20 }) ?? 0;
export const MaxContentWidth = 800;
