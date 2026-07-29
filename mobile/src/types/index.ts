export interface User {
  id: string
  role: 'ADMIN_ROLE' | 'USER_ROLE'
  name: string
  surname: string
  username: string
  email: string
}

export interface Service {
  _id: string
  nombre: string
  descripcion: string
  categoriaId: Category | string
  locationId: Location_l | string
  imagenes: string[]
  telefono: string
  contactEmail: string
  serviceAreaRadius: number
  estado: 'activo' | 'inactivo'
  usuarioId: string
  viewsCount: number
  favoritosCount: number
  reviewsCount: number
  averageRating: number
}

export interface Solicitud {
  _id: string
  servicioId: Service | string
  usuarioId: string
  descripcion: string
  priceEstimate: number
  scheduledDate: string
  status: SolicitudStatus
  fechaSolicitud: string
  createdAt: string
  cancelReason?: string
  historialEstados: SolicitudEstado[]
}

export type SolicitudStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'expired'

export interface SolicitudEstado {
  estado: string
  fecha: string
  observacion?: string
}

export interface Review {
  _id: string
  servicioId: string
  usuarioId: User | string
  calificacion: 1 | 2 | 3 | 4 | 5
  comentario: string
  title?: string
  fecha: string
  createdAt: string
  likesCount: number
  isVerifiedPurchase: boolean
  moderationStatus: 'approved' | 'rejected'
}

export interface Category {
  _id: string
  nombre: string
  descripcion: string
  estado: 'activo' | 'inactivo'
}

export interface Location_l {
  _id: string
  name: string
  address: string
  municipality: string
  department: string
  zona: string
  lat: number
  lng: number
  status: boolean
}

export interface Tag {
  _id: string
  name: string
  slug: string
  description: string
  usageCount: number
  status: boolean
}

export interface Badge {
  _id: string
  name: string
  description: string
  badgeType: string
  icon: string
  priority: number
  autoAssign: boolean
  status: boolean
}

export interface Report {
  _id: string
  servicioId: { nombre: string } | string
  usuarioId: string
  motivo: string
  descripcion: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  createdAt: string
}

export interface LogEntry {
  _id: string
  action: string
  affectedEntity: string
  detail: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ipAddress: string
  createdAt: string
}

export interface Favorite {
  _id: string
  servicioId: Service | string
  usuarioId: string
  fecha: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalPages: number
  page: number
}

export interface ApiError {
  message: string
  response?: {
    data?: {
      message?: string
    }
    status?: number
  }
}

export interface ReportForm {
  motivo: string
  descripcion: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface SolicitudForm {
  descripcion: string
  priceEstimate?: string
  scheduledDate?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ReviewFormData {
  servicioId: string
  usuarioId: string
  calificacion: number
  comentario: string
  title?: string
}

export interface StatCard {
  label: string
  value: number | string
  color: string
  route: string
  icon: React.ReactNode
}
