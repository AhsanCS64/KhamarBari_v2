import mongoose from 'mongoose'

const workerPaymentSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    type: { type: String, enum: ['salary', 'advance', 'bonus', 'deduction'], required: true },
    amount: { type: Number, min: 0, required: true },
    date: { type: String, required: true },
    month: { type: String, default: null },
    method: { type: String, default: 'cash' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export const WorkerPayment = mongoose.model('WorkerPayment', workerPaymentSchema)
