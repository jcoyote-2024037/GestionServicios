'use strict'

import mongoose from 'mongoose'

const solicitudSchema = new mongoose.Schema(
    {
        usuarioId: {
            type: Number, // viene de PostgreSQL
            required: true
        },
        servicioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
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
            enum: ['pendiente', 'aceptado', 'rechazado', 'completado'],
            default: 'pendiente'
        },
        fechaSolicitud: {
            type: Date,
            default: Date.now
        },
        historialEstados: [
            {
                estado: {
                    type: String,
                    enum: ['pendiente', 'aceptado', 'rechazado', 'completado']
                },
                cambiadoPor: {
                    type: Number // usuarioId de quien hizo el cambio
                },
                fecha: {
                    type: Date,
                    default: Date.now
                },
                observacion: {
                    type: String,
                    trim: true,
                    maxlength: 500
                }
            }
        ]
    },
    { timestamps: true }
)

// Índices para búsquedas rápidas por historial
solicitudSchema.index({ usuarioId: 1 })
solicitudSchema.index({ servicioId: 1 })
solicitudSchema.index({ estado: 1 })

export default mongoose.model('Solicitud', solicitudSchema)
