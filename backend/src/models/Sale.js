import mongoose from 'mongoose'

const saleSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    invoiceNo: { type: String, required: true },
    itemType: { type: String, required: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', default: null },
    description: { type: String, default: '' },
    date: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0 },
    outstanding: { type: Number, default: 0 },
    buyer: { type: String, trim: true },
    buyerContact: { type: String, trim: true },
    paymentStatus: { type: String, enum: ['paid', 'partial', 'unpaid'], default: 'unpaid' },
    paymentMethod: { type: String, default: 'cash' },
    notes: { type: String },
  },
  { timestamps: true }
)
saleSchema.index({ farmId: 1, date: -1 })
export const Sale = mongoose.model('Sale', saleSchema)