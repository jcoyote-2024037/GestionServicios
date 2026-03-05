'use strict'
import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: 300
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);