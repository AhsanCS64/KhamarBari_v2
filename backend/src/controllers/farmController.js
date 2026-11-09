import { z } from 'zod'
import { Farm } from '../models/Farm.js'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  license: z.string().min(3).optional(),
  ownerName: z.string().min(2).optional(),
  tagline: z.string().max(160).optional(),
  farmType: z.string().max(100).optional(),
  division: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  zilla: z.string().min(1).optional(),
  upazila: z.string().min(1).optional(),
  address: z.string().min(5).optional(),
  contact: z.string().regex(/^01[3-9]\d{8}$/).optional(),
  email: z.string().email().or(z.literal('')).nullable().optional(),
  logo: z.string().nullable().optional(),
})

export async function updateCurrentFarm(req, res, next) {
  try {
    const data = updateSchema.parse(req.body)
    const farm = await Farm.findByIdAndUpdate(
      req.user.farmId,
      { ...data, ...(data.email === undefined ? {} : { email: data.email || null }) },
      { new: true, runValidators: true }
    )
    if (!farm) return res.status(404).json({ error: 'Farm not found' })
    res.json({ farm })
  } catch (error) {
    next(error)
  }
}
