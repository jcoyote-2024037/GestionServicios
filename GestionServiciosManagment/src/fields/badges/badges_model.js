'use strict'
import mongoose from 'mongoose'

const BADGE_TYPES = ['CALIFICACION', 'SOLICITUDES', 'VERIFICADO', 'RECOMENDADO']

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true
  },
  // criteria es un objeto JSON con la condicion para otorgar la insignia
  // estructura segun badgeType:
  //   CALIFICACION  -> { minRating: Number }
  //   SOLICITUDES   -> { minCompleted: Number }
  //   VERIFICADO    -> { manual: true }
  //   RECOMENDADO   -> { minFavoritos: Number }
  criteria: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  badgeType: {
    type: String,
    enum: BADGE_TYPES,
    required: true
  },
  icon: {
    type: String,
    trim: true,
    default: null
  },
  // priority define el peso de la insignia en el ranking de proveedores
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  // si autoAssign es true, el sistema la asigna/revoca automaticamente por metricas
  autoAssign: {
    type: Boolean,
    default: false
  },
  // null significa que no expira
  expiresAt: {
    type: Date,
    default: null
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

badgeSchema.index({ badgeType: 1 })
badgeSchema.index({ autoAssign: 1 })

export { BADGE_TYPES }
export default mongoose.model('Badge', badgeSchema)