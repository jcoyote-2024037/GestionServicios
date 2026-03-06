'use strict'
import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  affectedEntity: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  affectedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  detail: {
    type: String,
    trim: true
  },
  status: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

export default mongoose.model('ActivityLog', activityLogSchema)