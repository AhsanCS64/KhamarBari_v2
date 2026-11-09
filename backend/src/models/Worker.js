import mongoose from 'mongoose'

const workerSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    nid: { type: String, trim: true, default: '' },
    role: { type: String, required: true },
    joiningDate: { type: String, required: true },
    salary: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'on_leave', 'inactive'], default: 'active' },
    address: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
)
export const Worker = mongoose.model('Worker', workerSchema)