import { z } from 'zod'
import { Inventory } from '../models/Inventory.js'

const movementSchema = z.object({
  itemId: z.string().min(1),
  type: z.enum(['purchase', 'usage', 'adjustment', 'transfer']),
  quantity: z.coerce.number().nonnegative(),
  date: z.string().min(1),
  reference: z.string().optional(),
  recordedBy: z.string().optional(),
  notes: z.string().optional(),
})

const createSchema = z.object({
  name: z.string().min(2),
  sku: z.string().optional(),
  category: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.coerce.number().nonnegative().optional(),
  minimumThreshold: z.coerce.number().nonnegative().optional(),
  unitPrice: z.coerce.number().nonnegative().optional(),
  supplier: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  notes: z.string().optional(),
  branchId: z.string().optional().nullable(),
})

export async function listInventory(req, res, next) {
  try {
    const { branchId, category, search } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId

    if (category) filter.category = category
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ]
    }

    const inventory = await Inventory.find(filter).sort({ name: 1 })
    res.json({ inventory })
  } catch (err) { next(err) }
}

export async function createInventory(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const item = await Inventory.create({ farmId: req.user.farmId, ...data })
    res.status(201).json({ inventory: item })
  } catch (err) { next(err) }
}

export async function updateInventory(req, res, next) {
  try {
    const data = createSchema.partial().parse(req.body)
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      data,
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ error: 'Item not found' })
    res.json({ inventory: item })
  } catch (err) { next(err) }
}

export async function deleteInventory(req, res, next) {
  try {
    const item = await Inventory.findOneAndDelete({ _id: req.params.id, farmId: req.user.farmId })
    if (!item) return res.status(404).json({ error: 'Item not found' })
    res.json({ message: 'Item deleted' })
  } catch (err) { next(err) }
}

export async function listMovements(req, res, next) {
  try {
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (req.query.branchId) filter.branchId = req.query.branchId
    if (req.query.itemId) filter._id = req.query.itemId
    const inventory = await Inventory.find(filter).select('name unit branchId movements')
    const movements = inventory.flatMap((item) => item.movements.map((movement) => ({
      ...movement.toObject(),
      itemId: item._id,
      itemName: item.name,
      unit: movement.unit || item.unit,
      branchId: item.branchId,
    }))).sort((a, b) => b.date.localeCompare(a.date))
    res.json({ movements })
  } catch (err) {
    next(err)
  }
}

export async function recordMovement(req, res, next) {
  try {
    const data = movementSchema.parse(req.body)
    if (data.type !== 'adjustment' && data.quantity <= 0) {
      return res.status(400).json({ error: 'Movement quantity must be greater than zero' })
    }

    const filter = { _id: data.itemId, farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    const item = await Inventory.findOne(filter)
    if (!item) return res.status(404).json({ error: 'Item not found' })

    const movement = {
      type: data.type,
      quantity: data.quantity,
      unit: item.unit,
      date: data.date,
      reference: data.reference || '',
      recordedBy: data.recordedBy || '',
      notes: data.notes || '',
    }
    const update = { $push: { movements: movement } }
    if (data.type === 'purchase') update.$inc = { quantity: data.quantity }
    if (data.type === 'usage' || data.type === 'transfer') update.$inc = { quantity: -data.quantity }
    if (data.type === 'adjustment') update.$set = { quantity: data.quantity }

    const updateFilter = { ...filter }
    if (data.type === 'usage' || data.type === 'transfer') updateFilter.quantity = { $gte: data.quantity }
    const updated = await Inventory.findOneAndUpdate(updateFilter, update, { new: true, runValidators: true })
    if (!updated) return res.status(400).json({ error: 'Insufficient stock for this movement' })
    res.status(201).json({ item: updated, movement: updated.movements.at(-1) })
  } catch (err) {
    next(err)
  }
}