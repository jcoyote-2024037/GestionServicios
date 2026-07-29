'use strict'

import mongoose from 'mongoose'

const chatRoomSchema = new mongoose.Schema({
    solicitudId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solicitud',
        required: true,
        unique: true
    },
    servicioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    clienteId: { type: Number, required: true },
    proveedorId: { type: Number, required: true },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    lastSenderId: { type: Number, default: null }
}, { timestamps: true })

chatRoomSchema.index({ clienteId: 1 })
chatRoomSchema.index({ proveedorId: 1 })
chatRoomSchema.index({ solicitudId: 1 })

export default mongoose.model('ChatRoom', chatRoomSchema)
