import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
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
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true }, // YYYY-MM-DD
    paymentMethod: { type: String, default: 'cash' },
    paidBy: { type: String, trim: true },
    supplier: { type: String, trim: true },
    description: { type: String },
    receipt: { type: String, default: null }, // base64 string
  },
  { timestamps: true }
)

expenseSchema.index({ farmId: 1, date: -1 })
expenseSchema.index({ farmId: 1, category: 1 })

export const Expense = mongoose.model('Expense', expenseSchema)