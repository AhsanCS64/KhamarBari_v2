// Async API-shaped auth service backed by localStorage.
// Later: replace the internals with fetch() calls to the Express API.
import { storage } from './storage'
import { loadDb, saveDb, uid, hashPassword, verifyPassword } from './mockDb'

const SESSION_KEY = 'session'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

// shape: { data, error }
export async function registerFarm(payload) {
  await delay(600)
  const db = loadDb()

  if (db.users.some((u) => u.contact === payload.contact)) {
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
    contact: payload.contact,
    createdAt: new Date().toISOString(),
  }

  const user = {
    id: userId,
    farmId,
    name: payload.ownerName,
    contact: payload.contact,
    email: payload.email || null,
    passwordHash: hashPassword(payload.password),
    role: 'owner',
    branchId: null,
    createdAt: new Date().toISOString(),
  }

  db.farms.push(farm)
  db.users.push(user)
  saveDb(db)

  return { data: { farm, user: publicUser(user) }, error: null }
}

export async function login({ contact, password }) {
  await delay(500)
  const db = loadDb()
  const user = db.users.find((u) => u.contact === contact)
  if (!user) return { data: null, error: 'No account found with this contact.' }
  if (!verifyPassword(password, user.passwordHash)) {
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
  const db = loadDb()
  const user = db.users.find((u) => u.contact === contact)
  if (!user) {
    return { data: null, error: 'No account found with this mobile number. Please check or register a new farm.' }
  }

  // Generate a random 6-digit verification code
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  storage.set(RESET_OTP_KEY, { contact, otp, expiresAt })

  return {
    data: {
      ok: true,
      contact,
      simulatedOtp: otp,
      userName: user.name,
    },
    error: null,
  }
}

export async function verifyResetOtp({ contact, otp }) {
  await delay(300)
  const record = storage.get(RESET_OTP_KEY)
  if (!record || record.contact !== contact) {
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
  const verifyRes = await verifyResetOtp({ contact, otp })
  if (verifyRes.error) return verifyRes

  const db = loadDb()
  const userIdx = db.users.findIndex((u) => u.contact === contact)
  if (userIdx < 0) return { data: null, error: 'User not found.' }

  db.users[userIdx].passwordHash = hashPassword(newPassword)
  saveDb(db)
  storage.remove(RESET_OTP_KEY)

  return { data: { success: true }, error: null }
}

function publicUser(user) {
  const { passwordHash, ...rest } = user
  return rest
}