export const colors = {
  brand: '#f43f5e',
  brandHover: '#e11d48',
  brandGlow: 'rgba(244, 63, 94, 0.25)',
  brandGradient: ['#f43f5e', '#ec4899'] as const,
  accent: '#ec4899',
  accentGlow: 'rgba(236, 72, 153, 0.25)',
  surface: '#09090b',
  surfaceRaised: 'rgba(24, 24, 36, 0.85)',
  surfaceOverlay: 'rgba(12, 12, 20, 0.96)',
  surfaceGlass: 'rgba(255, 255, 255, 0.04)',
  border: 'rgba(255, 255, 255, 0.07)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  textPrimary: 'rgba(255, 255, 255, 0.92)',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textMuted: 'rgba(255, 255, 255, 0.28)',
  purple: '#a78bfa',
  purpleGlow: 'rgba(167, 139, 250, 0.2)',
  green: '#4ade80',
  greenGlow: 'rgba(74, 222, 128, 0.2)',
  red: '#f87171',
  redGlow: 'rgba(248, 113, 113, 0.2)',
  yellow: '#fbbf24',
  yellowGlow: 'rgba(251, 191, 36, 0.2)',
  blue: '#60a5fa',
  blueGlow: 'rgba(96, 165, 250, 0.2)',
  orange: '#fb923c',
  orangeGlow: 'rgba(251, 146, 60, 0.2)',
  pink: '#f472b6',
  pinkGlow: 'rgba(244, 114, 182, 0.2)',
}

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 32,
  full: 9999,
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

export const shadows = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  md: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  lg: {
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  glow: (color: string) => ({
    elevation: 8,
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  }),
}

export const glass = {
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardGlow: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  overlay: {
    backgroundColor: colors.surfaceOverlay,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
}
