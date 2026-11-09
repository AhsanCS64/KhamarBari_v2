import { z } from 'zod'
import { User } from '../models/User.js'
import { Farm } from '../models/Farm.js'
import { hashPassword, verifyPassword } from '../utils/hash.js'
import { signToken } from '../utils/jwt.js'

const registerSchema = z.object({
  farmName: z.string().min(2),
  license: z.string().min(3),
  division: z.string().min(1),
  district: z.string().min(1),
  zilla: z.string().min(1),
  upazila: z.string().min(1),
  address: z.string().min(5),
  ownerName: z.string().min(2),
  nid: z.string().regex(/^(\d{10}|\d{13}|\d{17})$/),
  email: z.string().email().optional().or(z.literal('')),
  contact: z.string().regex(/^01[3-9]\d{8}$/),
  password: z.string().min(6),
  logo: z.string().optional().nullable(),
})

const loginSchema = z.object({
  contact: z.string().regex(/^01[3-9]\d{8}$/),
  password: z.string().min(1),
})

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  contact: z.string().regex(/^01[3-9]\d{8}$/).optional(),
  email: z.string().email().or(z.literal('')).nullable().optional(),
  avatar: z.string().max(1500000).nullable().optional(),
  roleTitle: z.string().max(100).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body)

    const existing = await User.findOne({ contact: data.contact })
    if (existing) {
      return res.status(409).json({ error: 'This contact number is already registered' })
    }

    const farm = await Farm.create({
      name: data.farmName,
      logo: data.logo || null,
      license: data.license,
      division: data.division,
      district: data.district,
      zilla: data.zilla,
      upazila: data.upazila,
      address: data.address,
      ownerName: data.ownerName,
      ownerNid: data.nid,
      email: data.email || null,
      contact: data.contact,
    })

    const passwordHash = await hashPassword(data.password)
    const user = await User.create({
      farmId: farm._id,
      name: data.ownerName,
      contact: data.contact,
      email: data.email || null,
      passwordHash,
      role: 'owner',
      branchId: null,
    })

    const token = signToken({ userId: user._id.toString(), farmId: farm._id.toString(), role: user.role })

    res.status(201).json({
      token,
      user: user.toPublic(),
      farm,
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body)

    const user = await User.findOne({ contact: data.contact })
    if (!user) return res.status(401).json({ error: 'Invalid contact or password' })

    const ok = await verifyPassword(data.password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid contact or password' })

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive' })
    }

    const farm = await Farm.findById(user.farmId)
    const token = signToken({ userId: user._id.toString(), farmId: user.farmId.toString(), role: user.role })

    res.json({
      token,
      user: user.toPublic(),
      farm,
    })
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const farm = await Farm.findById(req.user.farmId)
    res.json({ user: req.user.toPublic(), farm })
  } catch (err) {
    next(err)
  }
}

export async function updateMe(req, res, next) {
  try {
    const data = profileSchema.parse(req.body)
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...data, ...(data.email === undefined ? {} : { email: data.email || null }) },
      { new: true, runValidators: true }
    )
    res.json({ user: user.toPublic() })
  } catch (err) {
    next(err)
  }
}

export async function changeMyPassword(req, res, next) {
  try {
    const data = passwordSchema.parse(req.body)
    const user = await User.findById(req.user._id)
    if (!(await verifyPassword(data.currentPassword, user.passwordHash))) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }
    user.passwordHash = await hashPassword(data.newPassword)
    await user.save()
    res.json({ message: 'Password updated' })
  } catch (err) {
    next(err)
  }
}