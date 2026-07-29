'use strict'

import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
        index: true
    },
    from: { type: Number, required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false }
}, { timestamps: true })

messageSchema.index({ chatRoomId: 1, createdAt: -1 })

export default mongoose.model('Message', messageSchema)
