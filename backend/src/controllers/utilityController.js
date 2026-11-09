import { z } from 'zod'
import { Utility } from '../models/Utility.js'

const createSchema = z.object({
  type: z.string().min(1),
  billingPeriod: z.string().min(1),
  meterNo: z.string().optional(),
  prevReading: z.coerce.number().nonnegative().optional(),
  currentReading: z.coerce.number().nonnegative().optional(),
  unit: z.string().optional(),
  amount: z.coerce.number().positive(),
  status: z.enum(['paid', 'pending', 'overdue']).optional(),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  provider: z.string().optional(),
  invoiceNo: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional().nullable(),
})

export async function listUtilities(req, res, next) {
  try {
    const { branchId, type, status, month, search } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId

    if (type) filter.type = type
    if (status) filter.status = status
    if (month) filter.billingPeriod = month
    if (search) {
      filter.$or = [
        { meterNo: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ]
    }

    const utilities = await Utility.find(filter).sort({ billingPeriod: -1 })
    res.json({ utilities })
  } catch (err) { next(err) }
}

export async function createUtility(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const util = await Utility.create({
      farmId: req.user.farmId,
      ...data,
      consumption: Math.max(0, Number(data.currentReading || 0) - Number(data.prevReading || 0)),
    })
    res.status(201).json({ utility: util })
  } catch (err) { next(err) }
}

export async function updateUtility(req, res, next) {
  try {
    const data = createSchema.partial().parse(req.body)
    const existing = await Utility.findOne({ _id: req.params.id, farmId: req.user.farmId })
    if (!existing) return res.status(404).json({ error: 'Utility not found' })
    const prevReading = data.prevReading ?? existing.prevReading
    const currentReading = data.currentReading ?? existing.currentReading
    const util = await Utility.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      { ...data, consumption: Math.max(0, Number(currentReading || 0) - Number(prevReading || 0)) },
      { new: true, runValidators: true }
    )
    if (!util) return res.status(404).json({ error: 'Utility not found' })
    res.json({ utility: util })
  } catch (err) { next(err) }
}

export async function deleteUtility(req, res, next) {
  try {
    const util = await Utility.findOneAndDelete({ _id: req.params.id, farmId: req.user.farmId })
    if (!util) return res.status(404).json({ error: 'Utility not found' })
    res.json({ message: 'Utility deleted' })
  } catch (err) { next(err) }
}