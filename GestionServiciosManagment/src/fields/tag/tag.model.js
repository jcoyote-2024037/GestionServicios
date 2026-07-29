'use strict'
import mongoose from 'mongoose'

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30,
        unique: true
    },
    slug: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        maxlength: 50,
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 300
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

export default mongoose.model('Tag', tagSchema)