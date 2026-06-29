'use strict'
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    descripcion: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    categoriaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },

    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ],

    telefono: {
        type: String,
        required: true,
        trim: true
    },

    contactEmail: {
        type: String,
        trim: true
    },

    contactPhone: {
        type: String,
        trim: true
    },

    imagenes: [
        {
            type: String,
            trim: true
        }
    ],

    promedioCalificacion: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

    favoritosCount: {
        type: Number,
        default: 0,
        min: 0
    },

    viewsCount: {
        type: Number,
        default: 0
    },

    reviewsCount: {
        type: Number,
        default: 0
    },

    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

    lastActivityAt: {
        type: Date,
        default: Date.now
    },

    isFeatured: {
        type: Boolean,
        default: false
    },

    availability: [
        {
            day: String,
            open: String,
            close: String
        }
    ],

    serviceAreaRadius: {
        type: Number,
        default: 5
    },

    estado: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    },
     
    badges: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Badge'
        }
    ], 

    usuarioId: {
        type: Number,
        required: true
    }

}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);