'use strict'
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    servicioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    usuarioId: {
        type: Number,
        required: true
    },
    calificacion: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comentario: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

reviewSchema.index({ servicioId: 1, usuarioId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
