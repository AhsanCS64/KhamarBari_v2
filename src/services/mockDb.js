// DEMO_SEED — Mock database for frontend-only build.
// Swap this file's exports for real API calls later.
import { storage } from './storage'

const DB_KEY = 'db'
const DB_VERSION = 3

// --- simple hash for demo passwords (NOT secure — mock only) ---
export function hashPassword(pw) {
  return btoa(`khamar::${pw}::salt`)
}
export function verifyPassword(pw, hash) {
  return hashPassword(pw) === hash
}

// --- ID helpers ---
export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

// --- DEMO_SEED: initial data ---
function seed() {
  const farmId = 'farm_demo_1'
  const ownerId = 'user_demo_owner'
  const branchMain = 'branch_main'
  const branchNorth = 'branch_north'

  return {
    version: DB_VERSION,
    farms: [
      {
        id: farmId,
        name: 'Green Valley Farm',
        logo: null,
        license: 'BD-FARM-2024-00123',
        address: 'House 12, Road 5, Dhanmondi, Dhaka 1205',
        division: 'Dhaka',
        district: 'Dhaka',
        zilla: 'Dhaka',
        upazila: 'Dhamrai',
        ownerName: 'Rahim Uddin',
        ownerNid: '1234567890123',
        email: 'owner@greenvalley.demo',
        contact: '01700000000',
        createdAt: new Date('2024-01-15').toISOString(),
      },
    ],
    users: [
      {
        id: ownerId,
        farmId,
        name: 'Rahim Uddin',
        contact: '01700000000',
        email: 'owner@greenvalley.demo',
        passwordHash: hashPassword('demo1234'),
        role: 'owner', // owner | manager | worker | admin
        branchId: null, // owner sees all
        createdAt: new Date('2024-01-15').toISOString(),
      },
      {
        id: 'user_demo_manager',
        farmId,
        name: 'Karim Mia',
        contact: '01800000000',
        email: null,
        passwordHash: hashPassword('demo1234'),
        role: 'manager',
        branchId: branchMain,
        createdAt: new Date('2024-02-01').toISOString(),
      },
    ],
    branches: [
      {
        id: branchMain,
        farmId,
        name: 'Main Branch',
        location: 'Dhamrai, Dhaka',
        managerName: 'Karim Mia',
        managerContact: '01800000000',
        status: 'active',
        createdAt: new Date('2024-01-20').toISOString(),
      },
      {
        id: branchNorth,
        farmId,
        name: 'North Branch',
        location: 'Rangpur Sadar, Rangpur',
        managerName: 'Jamal Hossain',
        managerContact: '01900000000',
        status: 'active',
        createdAt: new Date('2024-03-10').toISOString(),
      },
    ],
    animals: [],
    expenses: [],
    sales: [],
    production: [],
    inventory: [],
    utilities: [],
    workers: [],
    auditLogs: [],
  }
}

// --- DB access ---
export function loadDb() {
  const db = storage.get(DB_KEY)
  if (!db || db.version !== DB_VERSION) {
    const fresh = seed()
    storage.set(DB_KEY, fresh)
    return fresh
  }
  return db
}

export function saveDb(db) {
  storage.set(DB_KEY, db)
}

export function resetDb() {
  storage.remove(DB_KEY)
  return loadDb()
}