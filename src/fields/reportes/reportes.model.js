'use strict'

import mongoose from 'mongoose'

const reporteSchema = new mongoose.Schema(
    {
        servicioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true
        },
        usuarioId: {
            type: Number, // viene de PostgreSQL
            required: true
        },
        motivo: {
            type: String,
            enum: [
                'estafa',
                'contenido_inapropiado',
                'informacion_falsa',
                'spam',
                'otro'
            ],
            required: true
        },
        descripcion: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
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
            type: Number, // usuarioId del admin que revisó
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

// Índices para consultas frecuentes
reporteSchema.index({ servicioId: 1 })
reporteSchema.index({ usuarioId: 1 })
reporteSchema.index({ estado: 1 })

export default mongoose.model('Reporte', reporteSchema)
