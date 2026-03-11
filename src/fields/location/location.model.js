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
    zona: {
        type: String,
        trim: true,
        maxlength: 50
    },
    country: {
        type: String,
        trim: true,
        maxlength: 100,
        default: 'Guatemala'
    },
    postalCode: {
        type: String,
        trim: true,
        match: [/^\d{4,10}$/, 'Formato de código postal inválido']
    },
    lat: {
        type: Number,
        min: [-90,  'La latitud debe estar entre -90 y 90'],
        max: [90,   'La latitud debe estar entre -90 y 90']
    },
    lng: {
        type: Number,
        min: [-180, 'La longitud debe estar entre -180 y 180'],
        max: [180,  'La longitud debe estar entre -180 y 180']
    },
    geohash: {
        type: String,
        trim: true,
        index: true
    },
    population: {
        type: Number,
        min: 0
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

locationSchema.index({ lat: 1, lng: 1 })

export default mongoose.model('Location', locationSchema)