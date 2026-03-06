'use strict'
import mongoose from 'mongoose'

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true
  },
  criteria: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

export default mongoose.model('Badge', badgeSchema)