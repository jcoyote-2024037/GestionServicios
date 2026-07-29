import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Formato de email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria').min(8, 'Mínimo 8 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  surname: z.string().min(1, 'El apellido es obligatorio'),
  username: z.string().min(1, 'El username es obligatorio').min(3, 'Mínimo 3 caracteres'),
  email: z.string().min(1, 'El email es obligatorio').email('Formato de email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria').min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export const serviceSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().min(1, 'La descripción es obligatoria').max(500, 'Máximo 500 caracteres'),
  categoriaId: z.string().min(1, 'La categoría es obligatoria'),
  locationId: z.string().min(1, 'La ubicación es obligatoria'),
  telefono: z.string().min(1, 'El teléfono es obligatorio').regex(/^\d{7,15}$/, 'Deben ser 7-15 dígitos'),
  contactEmail: z.string().optional(),
  serviceAreaRadius: z.string().optional(),
})

export const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  username: z.string().min(1, 'El username es obligatorio'),
  surname: z.string().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z.string().min(1, 'La nueva contraseña es obligatoria').min(8, 'Mínimo 8 caracteres'),
})

export const solicitudSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  priceEstimate: z.string().optional(),
  scheduledDate: z.string().optional(),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ServiceForm = z.infer<typeof serviceSchema>
export type ProfileForm = z.infer<typeof profileSchema>
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>
export type SolicitudForm = z.infer<typeof solicitudSchema>
