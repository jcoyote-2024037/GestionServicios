'use strict'

import mongoose from 'mongoose'

const UMBRAL_SUSPENSION = 5 // reportes pendientes para suspender automáticamente

const reporteSchema = new mongoose.Schema(
    {
        servicioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        usuarioId: {
            type: Number,
            required: true
        },
        // ── Campos originales ────────────────────────────────────────────────
        motivo: {
            type: String,
            enum: ['estafa', 'contenido_inapropiado', 'informacion_falsa', 'spam', 'otro'],
            required: true
        },
        descripcion: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        // ── Campos adicionales ───────────────────────────────────────────────
        reportType: {
            type: String,
            enum: ['fraude', 'contenido_falso', 'spam', 'abuso'],
            required: true
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },
        status: {
            type: String,
            enum: ['pending', 'under_review', 'resolved', 'dismissed'],
            default: 'pending'
        },
        resolution: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: null
        },
        reviewedBy: {
            type: Number,
            default: null
        },
        reviewedAt: {
            type: Date,
            default: null
        },
        // ── Legacy (compatibilidad) ───────────────────────────────────────────
        estado: {
            type: String,
            enum: ['pendiente', 'revisado'],
            default: 'pendiente'
        },
        fecha: {
            type: Date,
            default: Date.now
        },
        revisadoPor: {
            type: Number,
            default: null
        },
        fechaRevision: {
            type: Date,
            default: null
        },
        notaRevision: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null
        }
    },
    { timestamps: true }
)

reporteSchema.index({ servicioId: 1 })
reporteSchema.index({ usuarioId: 1 })
reporteSchema.index({ status: 1 })
reporteSchema.index({ severity: 1 })
reporteSchema.index({ reportType: 1 })

reporteSchema.statics.UMBRAL_SUSPENSION = UMBRAL_SUSPENSION

export default mongoose.model('Reporte', reporteSchema)
