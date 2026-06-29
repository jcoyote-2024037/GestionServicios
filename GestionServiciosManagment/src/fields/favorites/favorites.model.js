'use strict'
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
    usuarioId: {
        type: Number,
        required: true
    },
    servicioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 300,
        default: null
    },
    notificationEnabled: {
        type: Boolean,
        default: false
    },
    // Última vez que el usuario interactuó con este favorito
    lastInteractionAt: {
        type: Date,
        default: Date.now
    },
    // Marcado automáticamente si no hubo interacción en 90 días
    abandonado: {
        type: Boolean,
        default: false
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

favoriteSchema.index({ usuarioId: 1, servicioId: 1 }, { unique: true });
favoriteSchema.index({ servicioId: 1 });
favoriteSchema.index({ usuarioId: 1 });
favoriteSchema.index({ lastInteractionAt: 1 });

export default mongoose.model('Favorite', favoriteSchema);