import { z } from 'zod'
import { Enclosure } from '../models/Enclosure.js'

const createSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1),
  barnId: z.string().optional(),
  speciesId: z.string().min(1),
  speciesNote: z.string().optional(),
  size: z.coerce.number().nonnegative(),
  capacity: z.coerce.number().nonnegative(),
  occupied: z.coerce.number().nonnegative().optional(),
  sickCount: z.coerce.number().int().nonnegative().optional(),
  health: z.enum(['healthy', 'watch', 'treatment', 'quarantine']).optional(),
  notes: z.string().optional(),
  lastCheck: z.string().optional(),
  ageDays: z.coerce.number().nonnegative().optional(),
  branchId: z.string().optional().nullable(),
})

export async function listEnclosures(req, res, next) {
  try {
    const { branchId, type, search } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId
    if (type) filter.type = type
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barnId: { $regex: search, $options: 'i' } },
        { speciesNote: { $regex: search, $options: 'i' } },
      ]
    }
    const enclosures = await Enclosure.find(filter).sort({ createdAt: -1 })
    res.json({ enclosures })
  } catch (error) {
    next(error)
  }
}

export async function createEnclosure(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    if (req.user.role === 'manager' && req.user.branchId) {
      if (data.branchId && data.branchId !== req.user.branchId.toString()) {
        return res.status(403).json({ error: 'You can only create enclosures for your assigned branch' })
      }
      data.branchId = req.user.branchId.toString()
    }
    const enclosure = await Enclosure.create({ farmId: req.user.farmId, ...data })
    res.status(201).json({ enclosure })
  } catch (error) {
    next(error)
  }
}

export async function updateEnclosure(req, res, next) {
  try {
    const data = createSchema.partial().parse(req.body)
    const filter = { _id: req.params.id, farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) {
      filter.branchId = req.user.branchId
      if (data.branchId && data.branchId !== req.user.branchId.toString()) {
        return res.status(403).json({ error: 'You can only update enclosures in your assigned branch' })
      }
    }
    const enclosure = await Enclosure.findOneAndUpdate(
      filter,
      data,
      { new: true, runValidators: true }
    )
    if (!enclosure) return res.status(404).json({ error: 'Enclosure not found' })
    res.json({ enclosure })
  } catch (error) {
    next(error)
  }
}

export async function deleteEnclosure(req, res, next) {
  try {
    const filter = { _id: req.params.id, farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    const enclosure = await Enclosure.findOneAndDelete(filter)
    if (!enclosure) return res.status(404).json({ error: 'Enclosure not found' })
    res.json({ message: 'Enclosure deleted' })
  } catch (error) {
    next(error)
  }
}
