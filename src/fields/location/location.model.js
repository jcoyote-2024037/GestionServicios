'use strict'
import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    address: {
        type: String,
        trim: true
    },
    municipality: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    department: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    reference: {
        type: String,
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

export default mongoose.model('Location', locationSchema)