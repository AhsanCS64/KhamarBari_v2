import mongoose from 'mongoose'

const movementSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['purchase', 'usage', 'adjustment', 'transfer'], required: true },
    quantity: { type: Number, min: 0, required: true },
    unit: { type: String, required: true },
    date: { type: String, required: true },
    reference: { type: String, default: '' },
    recordedBy: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

const inventorySchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, default: 0, min: 0 },
    minimumThreshold: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0, min: 0 },
    supplier: { type: String, trim: true },
    expiryDate: { type: String, default: null },
    notes: { type: String, default: '' },
    movements: { type: [movementSchema], default: [] },
  },
  { timestamps: true }
)
export const Inventory = mongoose.model('Inventory', inventorySchema)