import { z } from 'zod'
import { Worker } from '../models/Worker.js'
import { WorkerAttendance } from '../models/WorkerAttendance.js'
import { WorkerPayment } from '../models/WorkerPayment.js'

const attendanceSchema = z.object({
  workerId: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(['present', 'absent', 'half_day', 'leave']),
  notes: z.string().optional(),
})

const paymentSchema = z.object({
  workerId: z.string().min(1),
  type: z.enum(['salary', 'advance', 'bonus', 'deduction']),
  amount: z.coerce.number().nonnegative(),
  date: z.string().min(1),
  month: z.string().optional().nullable(),
  method: z.string().optional(),
  notes: z.string().optional(),
})

async function findWorker(req, workerId) {
  const filter = { _id: workerId, farmId: req.user.farmId }
  if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
  return Worker.findOne(filter)
}

function recordFilter(req) {
  const filter = { farmId: req.user.farmId }
  if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
  else if (req.query.branchId) filter.branchId = req.query.branchId
  if (req.query.workerId) filter.workerId = req.query.workerId
  return filter
}

export async function listAttendance(req, res, next) {
  try {
    const filter = recordFilter(req)
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {}
      if (req.query.dateFrom) filter.date.$gte = req.query.dateFrom
      if (req.query.dateTo) filter.date.$lte = req.query.dateTo
    }
    const attendance = await WorkerAttendance.find(filter).sort({ date: -1 })
    res.json({ attendance })
  } catch (error) {
    next(error)
  }
}

export async function markAttendance(req, res, next) {
  try {
    const data = attendanceSchema.parse(req.body)
    const worker = await findWorker(req, data.workerId)
    if (!worker) return res.status(404).json({ error: 'Worker not found' })
    const attendance = await WorkerAttendance.findOneAndUpdate(
      { farmId: req.user.farmId, workerId: worker._id, date: data.date },
      { ...data, farmId: req.user.farmId, branchId: worker.branchId },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
    res.json({ attendance })
  } catch (error) {
    next(error)
  }
}

export async function listPayments(req, res, next) {
  try {
    const filter = recordFilter(req)
    if (req.query.month) filter.month = req.query.month
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {}
      if (req.query.dateFrom) filter.date.$gte = req.query.dateFrom
      if (req.query.dateTo) filter.date.$lte = req.query.dateTo
    }
    const payments = await WorkerPayment.find(filter).sort({ date: -1 })
    res.json({ payments })
  } catch (error) {
    next(error)
  }
}

export async function recordPayment(req, res, next) {
  try {
    const data = paymentSchema.parse(req.body)
    const worker = await findWorker(req, data.workerId)
    if (!worker) return res.status(404).json({ error: 'Worker not found' })
    const payment = await WorkerPayment.create({
      ...data,
      farmId: req.user.farmId,
      branchId: worker.branchId,
    })
    res.status(201).json({ payment })
  } catch (error) {
    next(error)
  }
}

export async function deletePayment(req, res, next) {
  try {
    const filter = { _id: req.params.id, farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    const payment = await WorkerPayment.findOneAndDelete(filter)
    if (!payment) return res.status(404).json({ error: 'Payment not found' })
    res.json({ message: 'Payment deleted' })
  } catch (error) {
    next(error)
  }
}
