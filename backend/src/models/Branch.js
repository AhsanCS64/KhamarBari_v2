import mongoose from 'mongoose'

const branchSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    managerName: { type: String, required: true, trim: true },
    managerContact: {
      type: String,
      required: true,
      match: /^01[3-9]\d{8}$/,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
)

branchSchema.index({ farmId: 1, status: 1 })

export const Branch = mongoose.model('Branch', branchSchema)