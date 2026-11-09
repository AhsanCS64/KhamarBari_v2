import mongoose from 'mongoose'

const workerAttendanceSchema = new mongoose.Schema(
  {
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['present', 'absent', 'half_day', 'leave'], required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

workerAttendanceSchema.index({ farmId: 1, workerId: 1, date: 1 }, { unique: true })
export const WorkerAttendance = mongoose.model('WorkerAttendance', workerAttendanceSchema)
