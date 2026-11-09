import mongoose from 'mongoose'

const productionSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    type: { type: String, required: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', default: null },
    enclosureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enclosure', default: null },
    animalName: { type: String, trim: true },
    speciesId: { type: String, trim: true },
    meatType: { type: String, trim: true },
    meatYieldKg: { type: Number, min: 0, default: null },
    date: { type: String, required: true },
    session: { type: String, default: null },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    quality: { type: String, trim: true },
    recorder: { type: String, trim: true },
    notes: { type: String },
  },
  { timestamps: true }
)
productionSchema.index({ farmId: 1, date: -1 })
export const Production = mongoose.model('Production', productionSchema)