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
    fecha: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

favoriteSchema.index({ usuarioId: 1, servicioId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
