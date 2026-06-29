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
        minlength: 20,
        maxlength: 1000
    },
    title: {
        type: String,
        trim: true,
        maxlength: 150,
        default: null
    },
    likesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    reportesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    reportadoPor: {
        type: [Number],
        default: []
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    },
    // Sentimiento calculado del comentario (-1 negativo / 0 neutro / 1 positivo)
    sentimentScore: {
        type: Number,
        default: null,
        min: -1,
        max: 1
    },
    sentimentLabel: {
        type: String,
        enum: ['positivo', 'neutro', 'negativo', null],
        default: null
    },
    // Posible reseña falsa detectada automáticamente
    posibleFalsa: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['visible', 'hidden', 'flagged'],
        default: 'visible'
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

reviewSchema.index({ servicioId: 1, usuarioId: 1 }, { unique: true });
reviewSchema.index({ status: 1 });
reviewSchema.index({ usuarioId: 1, createdAt: -1 });
reviewSchema.index({ servicioId: 1, calificacion: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);