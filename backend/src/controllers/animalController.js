import { z } from 'zod'
import { Animal } from '../models/Animal.js'
import { Enclosure } from '../models/Enclosure.js'

const createSchema = z.object({
  tag: z.string().min(1),
  name: z.string().optional(),
  species: z.string().min(1),
  breed: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  dob: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().nonnegative().optional(),
  weight: z.coerce.number().nonnegative().optional(),
  health: z.enum(['healthy', 'watch', 'treatment', 'quarantine']).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional(),
  enclosureId: z.string().optional().nullable(),
})

const updateSchema = createSchema.partial().extend({
  status: z.enum(['active', 'sold', 'dead']).optional(),
})

// GET /api/animals
export async function listAnimals(req, res, next) {
  try {
    const { branchId, enclosureId, search, status } = req.query
    const filter = { farmId: req.user.farmId }

    // Branch scoping (from query param, or enforced by role)
    if (req.user.role === 'manager' && req.user.branchId) {
      filter.branchId = req.user.branchId
    } else if (branchId) {
      filter.branchId = branchId
    }

    if (status) filter.status = status
    if (enclosureId) filter.enclosureId = enclosureId
    if (search) {
      filter.$or = [
        { tag: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { species: { $regex: search, $options: 'i' } },
      ]
    }

    const animals = await Animal.find(filter).sort({ createdAt: -1 })
    res.json({ animals })
  } catch (err) {
    next(err)
  }
}

// POST /api/animals
export async function createAnimal(req, res, next) {
  let reservedEnclosureFilter = null
  try {
    const data = createSchema.parse(req.body)
    if (req.user.role === 'manager' && req.user.branchId) {
      if (data.branchId && data.branchId !== req.user.branchId.toString()) {
        return res.status(403).json({ error: 'You can only add animals to your assigned branch' })
      }
      data.branchId = req.user.branchId.toString()
    }
    
    const existing = await Animal.findOne({ farmId: req.user.farmId, tag: data.tag })
    if (existing) return res.status(409).json({ error: 'An animal with this tag already exists.' })

    if (data.enclosureId) {
      const enclosureFilter = {
        _id: data.enclosureId,
        farmId: req.user.farmId,
      }
      if (req.user.role === 'manager' && req.user.branchId) enclosureFilter.branchId = req.user.branchId
      else if (data.branchId) enclosureFilter.branchId = data.branchId
      const enclosure = await Enclosure.findOne(enclosureFilter)
      if (!enclosure) return res.status(404).json({ error: 'Enclosure not found' })
      if (!data.branchId && enclosure.branchId) data.branchId = enclosure.branchId.toString()

      reservedEnclosureFilter = enclosureFilter
      const reservation = await Enclosure.updateOne(
        { ...enclosureFilter, occupied: { $lt: enclosure.capacity } },
        { $inc: { occupied: 1 } }
      )
      if (reservation.modifiedCount !== 1) {
        reservedEnclosureFilter = null
        return res.status(409).json({ error: 'The enclosure has reached its capacity' })
      }
    }

    const animal = await Animal.create({
      farmId: req.user.farmId,
      ...data,
    })
    reservedEnclosureFilter = null
    res.status(201).json({ animal })
  } catch (err) {
    if (reservedEnclosureFilter) {
      await Enclosure.updateOne(
        { ...reservedEnclosureFilter, occupied: { $gt: 0 } },
        { $inc: { occupied: -1 } }
      )
    }
    next(err)
  }
}

// PATCH /api/animals/:id
export async function updateAnimal(req, res, next) {
  try {
    const data = updateSchema.parse(req.body)
    const filter = { _id: req.params.id, farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) {
      filter.branchId = req.user.branchId
      if (data.branchId && data.branchId !== req.user.branchId.toString()) {
        return res.status(403).json({ error: 'You can only update animals in your assigned branch' })
      }
    }
    const animal = await Animal.findOneAndUpdate(
      filter,
      data,
      { new: true, runValidators: true }
    )
    if (!animal) return res.status(404).json({ error: 'Animal not found' })
    res.json({ animal })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/animals/:id
export async function deleteAnimal(req, res, next) {
  try {
    const filter = { _id: req.params.id, farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    const animal = await Animal.findOneAndDelete({
      ...filter,
    })
    if (!animal) return res.status(404).json({ error: 'Animal not found' })
    if (animal.enclosureId && animal.status === 'active') {
      await Enclosure.updateOne(
        { _id: animal.enclosureId, farmId: req.user.farmId, occupied: { $gt: 0 } },
        { $inc: { occupied: -1 } }
      )
    }
    res.json({ message: 'Animal deleted successfully' })
  } catch (err) {
    next(err)
  }
}