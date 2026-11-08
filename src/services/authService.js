// Async API-shaped auth service backed by localStorage and optional Vercel cross-device sync.
import { storage } from './storage'
import { loadDb, saveDb, uid, hashPassword, verifyPassword } from './mockDb'
import { normalizeBdMobile } from '@/lib/validators/authSchemas'

const SESSION_KEY = 'session'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

async function syncRemoteAccount({ user, farm }) {
  try {
    if (typeof window !== 'undefined') {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, farm }),
      })
    }
  } catch {
    /* ignore offline / local fallback */
  }
}

async function fetchRemoteAccount(contact) {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/sync?contact=${encodeURIComponent(contact)}`)
      if (res.ok) {
        return await res.json()
      }
    }
  } catch {
    /* ignore offline / local fallback */
  }
  return null
}

// shape: { data, error }
export async function registerFarm(payload) {
  await delay(600)
  const normContact = normalizeBdMobile(payload.contact)
  const db = loadDb()

  if (db.users.some((u) => normalizeBdMobile(u.contact) === normContact)) {
    return { data: null, error: 'This contact number is already registered.' }
  }

  const farmId = uid('farm')
  const userId = uid('user')

  const farm = {
    id: farmId,
    name: payload.farmName,
    logo: payload.logo || null,
    license: payload.license,
    address: payload.address,
    division: payload.division,
    district: payload.district,
    zilla: payload.zilla,
    upazila: payload.upazila,
    ownerName: payload.ownerName,
    ownerNid: payload.nid,
    email: payload.email || null,
    contact: normContact,
    createdAt: new Date().toISOString(),
  }

  const user = {
    id: userId,
    farmId,
    name: payload.ownerName,
    contact: normContact,
    email: payload.email || null,
    passwordHash: hashPassword(payload.password),
    role: 'owner',
    branchId: null,
    createdAt: new Date().toISOString(),
  }

  db.farms.push(farm)
  db.users.push(user)
  saveDb(db)

  // Broadcast to remote sync for cross-device access on Vercel
  syncRemoteAccount({ user, farm }).catch(() => {})

  return { data: { farm, user: publicUser(user) }, error: null }
}

export async function login({ contact, password }) {
  await delay(400)
  const normContact = normalizeBdMobile(contact)
  const rawPw = typeof password === 'string' ? password.trim() : ''
  const db = loadDb()

  let user = db.users.find((u) => normalizeBdMobile(u.contact) === normContact)

  // If not found in local localStorage, attempt fetching from Vercel sync store
  if (!user) {
    try {
      const remote = await fetchRemoteAccount(normContact)
      if (remote && remote.user) {
        if (!db.users.some((u) => u.id === remote.user.id)) {
          db.users.push(remote.user)
        }
        if (remote.farm && !db.farms.some((f) => f.id === remote.farm.id)) {
          db.farms.push(remote.farm)
        }
        saveDb(db)
        user = remote.user
      }
    } catch {
      /* ignore remote error */
    }
  }

  if (!user) return { data: null, error: 'No account found with this contact.' }
  if (!verifyPassword(rawPw, user.passwordHash)) {
    return { data: null, error: 'Incorrect password.' }
  }
  const farm = db.farms.find((f) => f.id === user.farmId)
  const session = {
    token: `mock.${uid('tok')}`,
    userId: user.id,
    farmId: user.farmId,
    createdAt: new Date().toISOString(),
  }
  storage.set(SESSION_KEY, session)
  return { data: { user: publicUser(user), farm, token: session.token }, error: null }
}

export async function logout() {
  await delay(200)
  storage.remove(SESSION_KEY)
  return { data: true, error: null }
}

export async function getSession() {
  await delay(150)
  const session = storage.get(SESSION_KEY)
  if (!session) return { data: null, error: null }
  const db = loadDb()
  const user = db.users.find((u) => u.id === session.userId)
  if (!user) return { data: null, error: null }
  const farm = db.farms.find((f) => f.id === user.farmId)
  return { data: { user: publicUser(user), farm, token: session.token }, error: null }
}

export async function updateProfile(patch) {
  await delay(300)
  const session = storage.get(SESSION_KEY)
  if (!session) return { data: null, error: 'Not authenticated.' }
  const db = loadDb()
  const userIdx = db.users.findIndex((u) => u.id === session.userId)
  if (userIdx < 0) return { data: null, error: 'User not found.' }
  const user = db.users[userIdx]
  if (patch.contact !== undefined) user.contact = patch.contact
  if (patch.name !== undefined) user.name = patch.name
  if (patch.email !== undefined) user.email = patch.email
  if (patch.avatar !== undefined) user.avatar = patch.avatar
  if (patch.bio !== undefined) user.bio = patch.bio
  if (patch.roleTitle !== undefined) user.roleTitle = patch.roleTitle
  if (patch.nid !== undefined) user.nid = patch.nid
  if (patch.address !== undefined) user.address = patch.address
  if (patch.password) user.passwordHash = hashPassword(patch.password)
  db.users[userIdx] = user
  saveDb(db)
  return { data: publicUser(user), error: null }
}

export async function updateFarm(patch) {
  await delay(300)
  const session = storage.get(SESSION_KEY)
  if (!session) return { data: null, error: 'Not authenticated.' }
  const db = loadDb()
  const farmIdx = db.farms.findIndex((f) => f.id === session.farmId)
  if (farmIdx < 0) return { data: null, error: 'Farm not found.' }
  const farm = db.farms[farmIdx]

  if (patch.name !== undefined) farm.name = patch.name
  if (patch.logo !== undefined) farm.logo = patch.logo
  if (patch.tagline !== undefined) farm.tagline = patch.tagline
  if (patch.license !== undefined) farm.license = patch.license
  if (patch.address !== undefined) farm.address = patch.address
  if (patch.division !== undefined) farm.division = patch.division
  if (patch.district !== undefined) farm.district = patch.district
  if (patch.upazila !== undefined) farm.upazila = patch.upazila
  if (patch.contact !== undefined) farm.contact = patch.contact
  if (patch.email !== undefined) farm.email = patch.email
  if (patch.establishedYear !== undefined) farm.establishedYear = patch.establishedYear
  if (patch.farmType !== undefined) farm.farmType = patch.farmType

  db.farms[farmIdx] = farm
  saveDb(db)
  return { data: farm, error: null }
}

const RESET_OTP_KEY = 'auth.reset_otp'

export async function requestPasswordReset(contact) {
  await delay(400)
  const normContact = normalizeBdMobile(contact)
  const db = loadDb()
  const user = db.users.find((u) => normalizeBdMobile(u.contact) === normContact)
  if (!user) {
    return { data: null, error: 'No account found with this mobile number. Please check or register a new farm.' }
  }

  // Generate a random 6-digit verification code
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  storage.set(RESET_OTP_KEY, { contact: normContact, otp, expiresAt })

  return {
    data: {
      ok: true,
      contact: normContact,
      simulatedOtp: otp,
      userName: user.name,
    },
    error: null,
  }
}

export async function verifyResetOtp({ contact, otp }) {
  await delay(300)
  const normContact = normalizeBdMobile(contact)
  const record = storage.get(RESET_OTP_KEY)
  if (!record || normalizeBdMobile(record.contact) !== normContact) {
    return { data: null, error: 'Verification session expired. Please request a new code.' }
  }
  if (Date.now() > record.expiresAt) {
    return { data: null, error: 'Verification code has expired (valid 10 mins). Please request again.' }
  }
  if (record.otp !== otp?.trim()) {
    return { data: null, error: 'Incorrect verification code. Please check the code and try again.' }
  }
  return { data: { verified: true }, error: null }
}

export async function resetPasswordWithOtp({ contact, otp, newPassword }) {
  await delay(500)
  const normContact = normalizeBdMobile(contact)
  const verifyRes = await verifyResetOtp({ contact: normContact, otp })
  if (verifyRes.error) return verifyRes

  const db = loadDb()
  const userIdx = db.users.findIndex((u) => normalizeBdMobile(u.contact) === normContact)
  if (userIdx < 0) return { data: null, error: 'User not found.' }

  db.users[userIdx].passwordHash = hashPassword(newPassword)
  saveDb(db)
  storage.remove(RESET_OTP_KEY)

  // Broadcast updated password to remote sync for cross-device consistency
  const farm = db.farms.find((f) => f.id === db.users[userIdx].farmId)
  syncRemoteAccount({ user: db.users[userIdx], farm }).catch(() => {})

  return { data: { success: true }, error: null }
}

function publicUser(user) {
  const { passwordHash, ...rest } = user
  return rest
}