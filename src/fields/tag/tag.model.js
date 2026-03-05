'use strict'
import mongoose from 'mongoose'

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

export default mongoose.model('Tag', tagSchema)