export const Colors = {
  bg: '#0a0a0f',
  bgCard: '#1a1a2e',
  bgCardAlt: '#0f0f1a',
  bgInput: '#12121f',
  border: '#2d2d4a',
  borderLight: '#3d3d5c',

  primary: '#7c3aed',
  primaryLight: '#a78bfa',
  primaryDark: '#5b21b6',
  primaryAlpha: 'rgba(124, 58, 237, 0.15)',

  secondary: '#6366f1',
  accent: '#0ea5e9',
  accentAlpha: 'rgba(14, 165, 233, 0.15)',

  success: '#10b981',
  successAlpha: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  warningAlpha: 'rgba(245, 158, 11, 0.15)',
  error: '#ef4444',
  errorAlpha: 'rgba(239, 68, 68, 0.15)',

  text: '#f9fafb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  textDisabled: '#4b5563',

  white: '#ffffff',
  black: '#000000',

  gradientPrimary: ['#7c3aed', '#6366f1'] as const,
  gradientDark: ['#1a1a2e', '#0a0a0f'] as const,
  gradientHero: ['#1a0a3e', '#0a0a1f', '#0a0a0f'] as const,

  subjectColors: [
    '#7c3aed', '#6366f1', '#0ea5e9', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
  ],
};

export type ColorKey = keyof typeof Colors;
