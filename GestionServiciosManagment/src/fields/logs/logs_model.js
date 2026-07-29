'use strict'
import mongoose from 'mongoose'

// Lista cerrada de acciones permitidas.
// Agregar aqui si se necesitan nuevas acciones en el futuro.
export const ALLOWED_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'REVIEW_POSTED',
  'SERVICE_REQUESTED'
]

export const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // action debe pertenecer al enum ALLOWED_ACTIONS
  action: {
    type: String,
    required: true,
    enum: ALLOWED_ACTIONS
  },
  // entidad afectada: 'Service', 'Review', 'Solicitud', etc.
  affectedEntity: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  affectedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  detail: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // --- Campos nuevos de auditoria ---

  ipAddress: {
    type: String,
    trim: true,
    default: null
  },
  userAgent: {
    type: String,
    trim: true,
    default: null
  },
  // requestId es un UUID v4 generado por el middleware para rastrear una request especifica
  requestId: {
    type: String,
    trim: true,
    default: null
  },
  // metadata es un objeto libre para info adicional. Se valida max 5kb antes de guardar.
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  severity: {
    type: String,
    enum: SEVERITY_LEVELS,
    default: 'LOW'
  },
  // immutable: si es true, este log no puede ser eliminado.
  // Se activa automaticamente cuando severity es CRITICAL.
  immutable: {
    type: Boolean,
    default: false
  },
  // count: para logs agrupados. Si dos acciones identicas ocurren en menos de 60s,
  // se incrementa este contador en lugar de crear un registro nuevo.
  count: {
    type: Number,
    default: 1,
    min: 1
  },
  // lastOccurrence: ultima vez que ocurrio esta accion (para logs agrupados)
  lastOccurrence: {
    type: Date,
    default: null
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

// Indices para consultas frecuentes
activityLogSchema.index({ userId: 1, createdAt: -1 })
activityLogSchema.index({ action: 1 })
activityLogSchema.index({ severity: 1 })
activityLogSchema.index({ affectedEntity: 1 })
activityLogSchema.index({ requestId: 1 })
activityLogSchema.index({ immutable: 1 })

export default mongoose.model('ActivityLog', activityLogSchema)