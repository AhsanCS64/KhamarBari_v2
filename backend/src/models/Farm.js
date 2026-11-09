import mongoose from 'mongoose'

const farmSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true, default: '' },
    farmType: { type: String, trim: true, default: '' },
    logo: { type: String, default: null },
    license: { type: String, required: true, trim: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    zilla: { type: String, required: true },
    upazila: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerNid: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    contact: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
)

export const Farm = mongoose.model('Farm', farmSchema)