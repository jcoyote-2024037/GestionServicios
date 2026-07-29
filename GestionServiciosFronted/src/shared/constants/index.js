export const ROLES = {
  ADMIN: 'ADMIN_ROLE',
  USER: 'USER_ROLE',
  DUENO: 'DUENO_ROLE',
}

export const SERVICE_STATUS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
}

export const SOLICITUD_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
}

export const SOLICITUD_STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  expired: 'Expirada',
}

export const SOLICITUD_STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  accepted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  expired: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export const REVIEW_STATUS = {
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
  FLAGGED: 'flagged',
}

export const REPORT_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
}

export const REPORT_MOTIVES = {
  estafa: 'Estafa',
  contenido_inapropiado: 'Contenido inapropiado',
  informacion_falsa: 'Información falsa',
  spam: 'Spam',
  otro: 'Otro',
}

export const REPORT_STATUS_LABELS = {
  pending: 'Pendiente',
  under_review: 'En revisión',
  resolved: 'Resuelto',
  dismissed: 'Desestimado',
}

export const REPORT_STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  under_review: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  resolved: 'bg-green-500/20 text-green-300 border-green-500/30',
  dismissed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
}

export const LOG_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
}

export const LOG_SEVERITY_COLORS = {
  LOW: 'bg-gray-500/20 text-gray-300',
  MEDIUM: 'bg-yellow-500/20 text-yellow-300',
  HIGH: 'bg-orange-500/20 text-orange-300',
  CRITICAL: 'bg-red-500/20 text-red-300',
}

export const BADGE_TYPES = {
  CALIFICACION: 'CALIFICACION',
  SOLICITUDES: 'SOLICITUDES',
  VERIFICADO: 'VERIFICADO',
  RECOMENDADO: 'RECOMENDADO',
}

export const PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',
  SERVICE_NEW: '/services/new',
  SERVICE_EDIT: '/services/:id/edit',
  SOLICITUDES: '/solicitudes',
  SOLICITUD_DETAIL: '/solicitudes/:id',
  FAVORITES: '/favorites',
  PROFILE: '/profile',
  CHAT: '/chat',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_LOCATIONS: '/admin/locations',
  ADMIN_TAGS: '/admin/tags',
  ADMIN_BADGES: '/admin/badges',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_LOGS: '/admin/logs',
  NOTIFICATIONS: '/notifications',
}

export const DAYS_OF_WEEK = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
]
