import { z } from 'zod'
import { Branch } from '../models/Branch.js'

const createSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  managerName: z.string().min(2),
  managerContact: z.string().regex(/^01[3-9]\d{8}$/),
})

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  managerName: z.string().min(2).optional(),
  managerContact: z.string().regex(/^01[3-9]\d{8}$/).optional(),
  status: z.enum(['active', 'archived']).optional(),
})

// GET /api/branches
export async function listBranches(req, res, next) {
  try {
    const { status } = req.query
    const filter = { farmId: req.user.farmId }
    if (status) filter.status = status
    
    // Branch-level scoping: managers only see their own branch
    if (req.user.role === 'manager' && req.user.branchId) {
      filter._id = req.user.branchId
    }

    const branches = await Branch.find(filter).sort({ createdAt: 1 })
    res.json({ branches })
  } catch (err) {
    next(err)
  }
}

// GET /api/branches/:id
export async function getBranch(req, res, next) {
  try {
    const branch = await Branch.findOne({
      _id: req.params.id,
      farmId: req.user.farmId,
    })
    if (!branch) return res.status(404).json({ error: 'Branch not found' })
    res.json({ branch })
  } catch (err) {
    next(err)
  }
}

// POST /api/branches
export async function createBranch(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const branch = await Branch.create({
      farmId: req.user.farmId,
      ...data,
    })
    res.status(201).json({ branch })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/branches/:id
export async function updateBranch(req, res, next) {
  try {
    const data = updateSchema.parse(req.body)
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      data,
      { new: true, runValidators: true }
    )
    if (!branch) return res.status(404).json({ error: 'Branch not found' })
    res.json({ branch })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/branches/:id
export async function archiveBranch(req, res, next) {
  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      { status: 'archived' },
      { new: true }
    )
    if (!branch) return res.status(404).json({ error: 'Branch not found' })
    res.json({ branch, message: 'Branch archived successfully' })
  } catch (err) {
    next(err)
  }
}