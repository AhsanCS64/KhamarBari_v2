import { z } from 'zod'
import { Worker } from '../models/Worker.js'
import { WorkerAttendance } from '../models/WorkerAttendance.js'
import { WorkerPayment } from '../models/WorkerPayment.js'

const createSchema = z.object({
  name: z.string().min(2),
  contact: z.string().regex(/^01[3-9]\d{8}$/),
  nid: z.string().optional(),
  role: z.string().min(1),
  joiningDate: z.string().min(1),
  salary: z.coerce.number().nonnegative().optional(),
  status: z.enum(['active', 'on_leave', 'inactive']).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional().nullable(),
})

export async function listWorkers(req, res, next) {
  try {
    const { branchId, role, status } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId

    if (role) filter.role = role
    if (status) filter.status = status

    const workers = await Worker.find(filter).sort({ name: 1 })
    res.json({ workers })
  } catch (err) { next(err) }
}

export async function createWorker(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const worker = await Worker.create({ farmId: req.user.farmId, ...data })
    res.status(201).json({ worker })
  } catch (err) { next(err) }
}

export async function updateWorker(req, res, next) {
  try {
    const data = createSchema.partial().parse(req.body)
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      data,
      { new: true, runValidators: true }
    )
    if (!worker) return res.status(404).json({ error: 'Worker not found' })
    res.json({ worker })
  } catch (err) { next(err) }
}

export async function deleteWorker(req, res, next) {
  try {
    const worker = await Worker.findOneAndDelete({ _id: req.params.id, farmId: req.user.farmId })
    if (!worker) return res.status(404).json({ error: 'Worker not found' })
    await Promise.all([
      WorkerAttendance.deleteMany({ farmId: req.user.farmId, workerId: worker._id }),
      WorkerPayment.deleteMany({ farmId: req.user.farmId, workerId: worker._id }),
    ])
    res.json({ message: 'Worker deleted' })
  } catch (err) { next(err) }
}