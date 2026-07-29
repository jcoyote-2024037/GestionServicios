'use strict'

import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    usuarioId: { type: Number, required: true, index: true },
    tipo: {
        type: String,
        enum: ['nueva_solicitud', 'solicitud_status_changed', 'chat_notification'],
        required: true
    },
    titulo: { type: String, required: true },
    mensaje: { type: String, default: '' },
    referenciaId: { type: String, default: '' },
    leida: { type: Boolean, default: false, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true })

notificationSchema.index({ usuarioId: 1, leida: 1 })
notificationSchema.index({ usuarioId: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
