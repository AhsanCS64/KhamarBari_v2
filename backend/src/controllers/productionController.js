import { z } from 'zod'
import { Production } from '../models/Production.js'
import { Enclosure } from '../models/Enclosure.js'

const HEADCOUNT_INCREASE_TYPES = new Set(['birth'])
const HEADCOUNT_DECREASE_TYPES = new Set(['death', 'slaughter'])

const createSchema = z.object({
  type: z.string().min(1),
  animalId: z.string().optional().nullable(),
  enclosureId: z.string().optional().nullable(),
  animalName: z.string().optional(),
  speciesId: z.string().optional().nullable(),
  meatType: z.string().optional().nullable(),
  meatYieldKg: z.coerce.number().nonnegative().optional().nullable(),
  date: z.string().min(1),
  session: z.string().optional().nullable(),
  quantity: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
  quality: z.string().optional(),
  recorder: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional().nullable(),
})

function getHeadcountDelta(record) {
  const quantity = Number(record.quantity || 0)
  if (HEADCOUNT_INCREASE_TYPES.has(record.type)) return quantity
  if (HEADCOUNT_DECREASE_TYPES.has(record.type)) return -quantity
  return 0
}

async function prepareEnclosureScope(data, user) {
  if (!data.enclosureId) return data

  const filter = { _id: data.enclosureId, farmId: user.farmId }
  if (user.role === 'manager' && user.branchId) filter.branchId = user.branchId
  const enclosure = await Enclosure.findOne(filter)
  if (!enclosure) return null

  const enclosureBranchId = enclosure.branchId?.toString() || null
  const branchId = data.branchId?.toString() || null
  if (branchId && enclosureBranchId && branchId !== enclosureBranchId) return null

  return { ...data, branchId: branchId || enclosureBranchId }
}

async function adjustEnclosure(enclosureId, delta, user) {
  if (!enclosureId || !delta) return true

  const filter = { _id: enclosureId, farmId: user.farmId }
  if (user.role === 'manager' && user.branchId) filter.branchId = user.branchId
  if (delta < 0) {
    filter.occupied = { $gte: Math.abs(delta) }
  } else {
    filter.$expr = { $lte: [{ $add: ['$occupied', delta] }, '$capacity'] }
  }

  const result = await Enclosure.updateOne(filter, { $inc: { occupied: delta } })
  return result.modifiedCount === 1
}

export async function listProduction(req, res, next) {
  try {
    const { branchId, type, search, dateFrom, dateTo } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId

    if (type) filter.type = type
    if (search) {
      filter.$or = [
        { animalName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { recorder: { $regex: search, $options: 'i' } },
      ]
    }
    if (dateFrom || dateTo) {
      filter.date = {}
      if (dateFrom) filter.date.$gte = dateFrom
      if (dateTo) filter.date.$lte = dateTo
    }

    const production = await Production.find(filter).sort({ date: -1 })
    res.json({ production })
  } catch (err) { next(err) }
}

export async function createProduction(req, res, next) {
  let adjustedEnclosureId = null
  let adjustedDelta = 0
  try {
    let data = createSchema.parse(req.body)
    if (req.user.role === 'manager' && req.user.branchId) {
      if (data.branchId && data.branchId !== req.user.branchId.toString()) {
        return res.status(403).json({ error: 'You can only record production for your assigned branch' })
      }
      data.branchId = req.user.branchId.toString()
    }
    data = await prepareEnclosureScope(data, req.user)
    if (!data) return res.status(404).json({ error: 'Enclosure not found for this farm and branch' })

    const delta = getHeadcountDelta(data)
    if (data.enclosureId && delta) {
      const adjusted = await adjustEnclosure(data.enclosureId, delta, req.user)
      if (!adjusted) {
        return res.status(409).json({
          error: delta < 0
            ? 'The recorded headcount exceeds the current enclosure occupancy'
            : 'The enclosure does not have enough remaining capacity',
        })
      }
      adjustedEnclosureId = data.enclosureId
      adjustedDelta = delta
    }

    const record = await Production.create({ farmId: req.user.farmId, ...data })
    res.status(201).json({ production: record })
  } catch (err) {
    if (adjustedEnclosureId && adjustedDelta) {
      await adjustEnclosure(adjustedEnclosureId, -adjustedDelta, req.user)
    }
    next(err)
  }
}

export async function updateProduction(req, res, next) {
  let rollback = null
  try {
    const filter = { _id: req.params.id, farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    const existing = await Production.findOne(filter)
    if (!existing) return res.status(404).json({ error: 'Record not found' })

    const patch = createSchema.partial().parse(req.body)
    const merged = { ...existing.toObject(), ...patch }
    if (req.user.role === 'manager' && req.user.branchId) {
      if (patch.branchId && patch.branchId.toString() !== req.user.branchId.toString()) {
        return res.status(403).json({ error: 'You can only update production for your assigned branch' })
      }
      merged.branchId = req.user.branchId.toString()
    }
    const data = await prepareEnclosureScope(merged, req.user)
    if (!data) return res.status(404).json({ error: 'Enclosure not found for this farm and branch' })

    const oldEnclosureId = existing.enclosureId?.toString() || null
    const newEnclosureId = data.enclosureId?.toString() || null
    const oldDelta = getHeadcountDelta(existing)
    const newDelta = getHeadcountDelta(data)

    if (oldEnclosureId === newEnclosureId) {
      const delta = newDelta - oldDelta
      if (delta && !(await adjustEnclosure(newEnclosureId, delta, req.user))) {
        return res.status(409).json({
          error: delta < 0
            ? 'The recorded headcount exceeds the current enclosure occupancy'
            : 'The enclosure does not have enough remaining capacity',
        })
      }
      rollback = delta ? { enclosureId: newEnclosureId, delta: -delta } : null
    } else {
      if (oldEnclosureId && oldDelta && !(await adjustEnclosure(oldEnclosureId, -oldDelta, req.user))) {
        return res.status(409).json({ error: 'The original enclosure occupancy could not be restored' })
      }
      rollback = oldEnclosureId && oldDelta ? { enclosureId: oldEnclosureId, delta: oldDelta } : null
      if (newEnclosureId && newDelta) {
        if (!(await adjustEnclosure(newEnclosureId, newDelta, req.user))) {
          if (rollback) await adjustEnclosure(rollback.enclosureId, rollback.delta, req.user)
          rollback = null
          return res.status(409).json({
            error: newDelta < 0
              ? 'The recorded headcount exceeds the current enclosure occupancy'
              : 'The enclosure does not have enough remaining capacity',
          })
        }
        rollback = { enclosureId: newEnclosureId, delta: -newDelta, prior: rollback }
      }
    }

    const savedPatch = { ...patch, branchId: data.branchId }
    const record = await Production.findOneAndUpdate(filter, savedPatch, { new: true, runValidators: true })
    if (!record) {
      if (rollback?.prior) {
        await adjustEnclosure(rollback.enclosureId, rollback.delta, req.user)
        await adjustEnclosure(rollback.prior.enclosureId, rollback.prior.delta, req.user)
      } else if (rollback) {
        await adjustEnclosure(rollback.enclosureId, rollback.delta, req.user)
      }
      rollback = null
      return res.status(404).json({ error: 'Record not found' })
    }
    rollback = null
    res.json({ production: record })
  } catch (err) {
    if (rollback?.prior) {
      await adjustEnclosure(rollback.enclosureId, rollback.delta, req.user)
      await adjustEnclosure(rollback.prior.enclosureId, rollback.prior.delta, req.user)
    } else if (rollback) {
      await adjustEnclosure(rollback.enclosureId, rollback.delta, req.user)
    }
    next(err)
  }
}

export async function deleteProduction(req, res, next) {
  let adjustedEnclosureId = null
  let adjustedDelta = 0
  try {
    const filter = { _id: req.params.id, farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    const existing = await Production.findOne(filter)
    if (!existing) return res.status(404).json({ error: 'Record not found' })

    const delta = getHeadcountDelta(existing)
    const enclosureId = existing.enclosureId?.toString()
    if (enclosureId && delta) {
      if (!(await adjustEnclosure(enclosureId, -delta, req.user))) {
        return res.status(409).json({ error: 'The enclosure no longer has capacity to reverse this production record' })
      }
      adjustedEnclosureId = enclosureId
      adjustedDelta = -delta
    }

    const record = await Production.findOneAndDelete(filter)
    if (!record) {
      if (adjustedEnclosureId) await adjustEnclosure(adjustedEnclosureId, -adjustedDelta, req.user)
      return res.status(404).json({ error: 'Record not found' })
    }
    res.json({ message: 'Record deleted' })
  } catch (err) {
    if (adjustedEnclosureId) await adjustEnclosure(adjustedEnclosureId, -adjustedDelta, req.user)
    next(err)
  }
}