import mongoose from 'mongoose'

const enclosureSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    type: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    barnId: { type: String, default: '' },
    speciesId: { type: String, required: true },
    speciesNote: { type: String, default: '' },
    size: { type: Number, min: 0, default: 0 },
    capacity: { type: Number, min: 0, default: 0 },
    occupied: { type: Number, min: 0, default: 0 },
    sickCount: { type: Number, min: 0, default: 0 },
    health: { type: String, enum: ['healthy', 'watch', 'treatment', 'quarantine'], default: 'healthy' },
    notes: { type: String, default: '' },
    lastCheck: { type: String, default: '' },
    ageDays: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
)

export const Enclosure = mongoose.model('Enclosure', enclosureSchema)
