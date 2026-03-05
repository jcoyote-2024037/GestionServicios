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
        type: Number,
        required: true
    },
    tags: [
        Number
    ],
    telefono: {
        type: String,
        required: true,
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
    estado: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    },
    usuarioId: {
        type: Number, // viene de PostgreSQL
        required: true
    }
    
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);