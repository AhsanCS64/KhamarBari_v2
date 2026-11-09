import mongoose from 'mongoose'

const animalSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true,
    },
    enclosureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enclosure', default: null, index: true },
    tag: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    species: { type: String, required: true, trim: true },
    breed: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    dob: { type: Date },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    health: {
      type: String,
      enum: ['healthy', 'watch', 'treatment', 'quarantine'],
      default: 'healthy',
      index: true,
    },
    source: { type: String, trim: true },
    photo: { type: String, default: null },
    notes: { type: String },
    status: {
      type: String,
      enum: ['active', 'sold', 'dead'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
)

animalSchema.index({ farmId: 1, tag: 1 }, { unique: true })

export const Animal = mongoose.model('Animal', animalSchema)