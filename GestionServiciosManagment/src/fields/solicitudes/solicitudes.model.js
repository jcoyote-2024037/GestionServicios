'use strict'

import mongoose from 'mongoose'

const ESTADOS = ['pending', 'accepted', 'rejected', 'completed', 'cancelled', 'expired']

const solicitudSchema = new mongoose.Schema(
    {
        usuarioId: {
            type: Number, // viene de PostgreSQL
            required: true
        },
        proveedorId: {
            type: Number, // usuarioId del proveedor del servicio (PostgreSQL)
            default: null
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
        // ── Campos adicionales ──────────────────────────────────────────────
        status: {
            type: String,
            enum: ESTADOS,
            default: 'pending'
        },
        priceEstimate: {
            type: Number,
            min: 0,
            default: null
        },
        scheduledDate: {
            type: Date,
            default: null
        },
        acceptedAt: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        },
        cancelReason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null
        },
        chatEnabled: {
            type: Boolean,
            default: false
        },
        // ── Compatibilidad: estado legacy (se mantiene sincronizado con status) ─
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
                    enum: ESTADOS
                },
                cambiadoPor: {
                    type: Number
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

// Índices
solicitudSchema.index({ usuarioId: 1 })
solicitudSchema.index({ proveedorId: 1 })
solicitudSchema.index({ servicioId: 1 })
solicitudSchema.index({ status: 1 })
// Índice para expiración automática: busca pending con scheduledDate vencida
solicitudSchema.index({ status: 1, scheduledDate: 1 })

export default mongoose.model('Solicitud', solicitudSchema)
