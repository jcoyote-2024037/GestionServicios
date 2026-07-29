export const colors = {
  brand: '#f43f5e',
  brandHover: '#e11d48',
  brandGlow: 'rgba(244, 63, 94, 0.3)',
  accent: '#ec4899',
  surface: '#09090b',
  surfaceRaised: 'rgba(17, 25, 40, 0.72)',
  surfaceOverlay: 'rgba(17, 25, 40, 0.95)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 255, 255, 0.14)',
  textPrimary: 'rgba(255, 255, 255, 0.92)',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textMuted: 'rgba(255, 255, 255, 0.3)',
  purple: '#a78bfa',
  purpleBg: 'rgba(167, 139, 250, 0.08)',
  green: '#4ade80',
  greenBg: 'rgba(74, 222, 128, 0.08)',
  red: '#f87171',
  redBg: 'rgba(248, 113, 113, 0.08)',
  yellow: '#fbbf24',
  yellowBg: 'rgba(251, 191, 36, 0.08)',
  blue: '#60a5fa',
  blueBg: 'rgba(96, 165, 250, 0.08)',
  orange: '#fb923c',
  orangeBg: 'rgba(251, 146, 60, 0.08)',
  pink: '#f472b6',
  pinkBg: 'rgba(244, 114, 182, 0.08)',
}

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 44,
  '3xl': 56,
}

export const typography = {
  fontFamily: undefined,
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
}

export const glass = {
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
}
