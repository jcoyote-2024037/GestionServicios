export const ROLES = {
  ADMIN: 'ADMIN_ROLE',
  USER: 'USER_ROLE',
} as const

export const SERVICE_STATUS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
} as const

export const SOLICITUD_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const

export const SOLICITUD_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  expired: 'Expirada',
}

export const SOLICITUD_STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24',
  accepted: '#4ade80',
  rejected: '#f87171',
  completed: '#60a5fa',
  cancelled: '#a78bfa',
  expired: '#6b7280',
}

export const REVIEW_STATUS = {
  VISIBLE: 'VISIBLE',
  HIDDEN: 'HIDDEN',
  FLAGGED: 'FLAGGED',
} as const

export const REPORT_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const

export const REPORT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  under_review: 'En revisión',
  resolved: 'Resuelto',
  dismissed: 'Desestimado',
}

export const REPORT_STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24',
  under_review: '#60a5fa',
  resolved: '#4ade80',
  dismissed: '#6b7280',
}

export const LOG_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export const LOG_SEVERITY_COLORS: Record<string, string> = {
  LOW: '#6b7280',
  MEDIUM: '#fbbf24',
  HIGH: '#fb923c',
  CRITICAL: '#f87171',
}

export const BADGE_TYPES = {
  CALIFICACION: 'CALIFICACION',
  SOLICITUDES: 'SOLICITUDES',
  VERIFICADO: 'VERIFICADO',
  RECOMENDADO: 'RECOMENDADO',
} as const

export const PATHS = {
  LOGIN: '/(auth)/login',
  REGISTER: '/(auth)/register',
  FORGOT_PASSWORD: '/(auth)/forgot-password',
  VERIFY_EMAIL: '/(auth)/verify-email',
  DASHBOARD: '/(tabs)',
  SERVICES: '/(tabs)/services',
  SERVICE_NEW: '/(tabs)/services/new',
  SOLICITUDES: '/(tabs)/solicitudes',
  FAVORITES: '/(tabs)/favorites',
  PROFILE: '/(tabs)/profile',
  ADMIN: '/(tabs)/admin',
} as const

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3006/gestionservicio/v1'
