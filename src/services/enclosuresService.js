import { loadDb, uid } from './mockDb'
import { storage } from './storage'

const KEY = 'animals.enclosures'

const SEED = [
  { id: 'r1', type: 'room', name: 'Broiler House A', speciesId: 'chicken', speciesNote: 'Cobb 500', size: 240, capacity: 5000, occupied: 4820, sickCount: 0, health: 'healthy', temp: 27.5, humidity: 62, ageDays: 21, lastCheck: '2h ago', barnId: 'Barn 1', feed: 'Starter', eggToday: 0, mortality7d: 12 },
  { id: 'l1', type: 'line', name: 'Dairy Line 1', speciesId: 'cow', speciesNote: 'Holstein × Friesian', size: 60, capacity: 40, occupied: 32, sickCount: 0, health: 'watch', temp: 38.4, humidity: 55, ageDays: 1240, lastCheck: '30m ago', barnId: 'Barn 2', milkToday: 412, milkTarget: 460, mortality7d: 0 },
  { id: 'p1', type: 'pond', name: 'North Pond', speciesId: 'fish', speciesNote: 'Nile Tilapia', size: 900, capacity: 4500, occupied: 4200, sickCount: 0, health: 'healthy', temp: 28.1, ph: 7.4, do: 6.2, ageDays: 60, lastCheck: '1h ago', barnId: 'Field 3', feed: 'Grower pellet', mortality7d: 34 },
  { id: 'r2', type: 'room', name: 'Layer House B', speciesId: 'chicken', speciesNote: 'Lohmann Brown', size: 300, capacity: 6000, occupied: 5870, sickCount: 0, health: 'healthy', temp: 24.0, humidity: 58, ageDays: 180, lastCheck: '15m ago', barnId: 'Barn 1', eggToday: 5410, eggTarget: 5700, mortality7d: 6 },
  { id: 'l2', type: 'line', name: 'Goat Line West', speciesId: 'goat', speciesNote: 'Black Bengal', size: 45, capacity: 60, occupied: 48, sickCount: 0, health: 'watch', temp: 39.1, humidity: 60, ageDays: 420, lastCheck: '2h ago', barnId: 'Barn 3', mortality7d: 1 },
]

function read() {
  const rows = storage.get(KEY, [])
  return Array.isArray(rows) ? rows : []
}

function ensureFarmData(farmId) {
  const saved = storage.get(KEY)
  const db = loadDb()
  const defaultBranchId = db.branches.find((branch) => branch.farmId === farmId && branch.status !== 'archived')?.id || null

  if (saved === null) {
    const seeded = SEED.map((enclosure) => ({ ...enclosure, farmId, branchId: defaultBranchId }))
    storage.set(KEY, seeded)
    return seeded
  }

  let changed = false
  const migrated = read().map((enclosure) => {
    const occupied = Number(enclosure.occupied || 0)
    const parsedSickCount = Number(enclosure.sickCount)
    const sickCount = Number.isInteger(parsedSickCount) && parsedSickCount >= 0
      ? Math.min(parsedSickCount, occupied)
      : 0
    const normalized = {
      ...enclosure,
      farmId: enclosure.farmId || farmId,
      branchId: enclosure.branchId || defaultBranchId,
      sickCount,
    }
    if (normalized.farmId === enclosure.farmId && normalized.branchId === enclosure.branchId && normalized.sickCount === enclosure.sickCount) return enclosure
    changed = true
    return normalized
  })
  if (changed) storage.set(KEY, migrated)
  return migrated
}

export async function listEnclosures({ farmId, branchId, type, search } = {}) {
  let rows = ensureFarmData(farmId).filter((enclosure) => enclosure.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((enclosure) => enclosure.branchId === branchId)
  if (type && type !== 'all') rows = rows.filter((enclosure) => enclosure.type === type)
  if (search) {
    const query = search.toLowerCase()
    rows = rows.filter((enclosure) => `${enclosure.name} ${enclosure.speciesNote} ${enclosure.barnId}`.toLowerCase().includes(query))
  }
  return { data: rows, error: null }
}

export async function createEnclosure(payload) {
  if (!payload.farmId || !payload.branchId) return { data: null, error: 'Select a branch for this enclosure.' }
  const row = { sickCount: 0, ...payload, id: uid('enc'), createdAt: new Date().toISOString() }
  const rows = read()
  rows.push(row)
  storage.set(KEY, rows)
  return { data: row, error: null }
}

export async function updateEnclosure(id, patch, farmId) {
  const rows = read()
  // Match primarily by unique id; farmId is a soft hint (ignore if it doesn't match)
  let index = rows.findIndex((enclosure) => enclosure.id === id && (!farmId || enclosure.farmId === farmId))
  if (index < 0) index = rows.findIndex((enclosure) => enclosure.id === id)
  if (index < 0) return { data: null, error: 'Enclosure not found' }
  rows[index] = {
    ...rows[index],
    ...patch,
    size: patch.size !== undefined ? Number(patch.size) : rows[index].size,
    capacity: patch.capacity !== undefined ? Number(patch.capacity) : rows[index].capacity,
    occupied: patch.occupied !== undefined ? Number(patch.occupied) : rows[index].occupied,
    sickCount: patch.sickCount !== undefined ? Number(patch.sickCount) : rows[index].sickCount || 0,
  }
  storage.set(KEY, rows)
  return { data: rows[index], error: null }
}

export async function deleteEnclosure(id, farmId) {
  const rows = read()
  const next = rows.filter((enclosure) => enclosure.id !== id || (farmId && enclosure.farmId !== farmId))
  storage.set(KEY, next)
  return { data: true, error: null }
}