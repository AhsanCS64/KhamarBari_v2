// localStorage-backed production service.
import { storage } from './storage'
import { uid } from './mockDb'
import { listEnclosures, updateEnclosure } from './enclosuresService'
import { useAppStore } from '@/store/appStore'

const KEY = 'production'
const ANIMALS_KEY = 'animals'
const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms))

const read = () => storage.get(KEY, [])
const write = (rows) => storage.set(KEY, rows)

// Notify other views (AnimalsPage, DashboardPage) that enclosure data changed
function notifyEnclosureChange() {
  try { useAppStore.getState().refreshBranches() } catch (_) { /* store may not be initialised */ }
  window.dispatchEvent(new CustomEvent('khamar:enclosures-changed'))
}

// Helper: Apply enclosure impact when production (death, birth/breeding, milk, egg) is recorded
async function applyEnclosureImpact(payload) {
  if (!payload.enclosureId) return
  const { data: enclosures } = await listEnclosures({ farmId: payload.farmId })
  const enc = enclosures?.find((e) => e.id === payload.enclosureId)
  if (!enc) return

  const qty = Number(payload.quantity || 0)
  if (payload.type === 'death') {
    const occupied = Math.max(0, Number(enc.occupied || 0) - qty)
    const sickCount = Math.max(0, Number(enc.sickCount || 0) - qty)
    const mortality7d = Number(enc.mortality7d || 0) + qty
    await updateEnclosure(enc.id, { occupied, sickCount, mortality7d }, payload.farmId)
    notifyEnclosureChange()
  } else if (payload.type === 'slaughter') {
    const occupied = Math.max(0, Number(enc.occupied || 0) - qty)
    await updateEnclosure(enc.id, { occupied }, payload.farmId)
    notifyEnclosureChange()
  } else if (payload.type === 'birth' || payload.type === 'breeding') {
    const occupied = Number(enc.occupied || 0) + qty
    await updateEnclosure(enc.id, { occupied }, payload.farmId)
    notifyEnclosureChange()
  } else if (payload.type === 'milk') {
    const milkToday = Number(enc.milkToday || 0) + qty
    await updateEnclosure(enc.id, { milkToday }, payload.farmId)
  } else if (payload.type === 'egg') {
    const eggToday = Number(enc.eggToday || 0) + qty
    await updateEnclosure(enc.id, { eggToday }, payload.farmId)
  }
}

// Helper: Reverse enclosure impact when a production record is deleted or replaced
async function reverseEnclosureImpact(record) {
  if (!record.enclosureId) return
  const { data: enclosures } = await listEnclosures({ farmId: record.farmId })
  const enc = enclosures?.find((e) => e.id === record.enclosureId)
  if (!enc) return

  const qty = Number(record.quantity || 0)
  if (record.type === 'death') {
    const occupied = Number(enc.occupied || 0) + qty
    const mortality7d = Math.max(0, Number(enc.mortality7d || 0) - qty)
    await updateEnclosure(enc.id, { occupied, mortality7d }, record.farmId)
    notifyEnclosureChange()
  } else if (record.type === 'slaughter') {
    const occupied = Number(enc.occupied || 0) + qty
    await updateEnclosure(enc.id, { occupied }, record.farmId)
    notifyEnclosureChange()
  } else if (record.type === 'birth' || record.type === 'breeding') {
    const occupied = Math.max(0, Number(enc.occupied || 0) - qty)
    await updateEnclosure(enc.id, { occupied }, record.farmId)
    notifyEnclosureChange()
  }
}

export async function listProduction({ farmId, branchId, type, search, dateFrom, dateTo } = {}) {
  await delay()
  let rows = read().filter((p) => p.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((p) => p.branchId === branchId)
  if (type && type !== 'all') rows = rows.filter((p) => p.type === type)
  if (dateFrom) rows = rows.filter((p) => p.date >= dateFrom)
  if (dateTo) rows = rows.filter((p) => p.date <= dateTo)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (p) =>
        p.enclosureName?.toLowerCase().includes(q) ||
        p.animalName?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q) ||
        p.recorder?.toLowerCase().includes(q)
    )
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { data: rows, error: null }
}

export async function createProduction(payload) {
  await delay()
  const row = {
    id: uid('prod'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    enclosureId: payload.enclosureId || null,
    enclosureName: payload.enclosureName || '',
    type: payload.type,
    animalId: payload.animalId || null,
    animalName: payload.animalName || '',
    date: payload.date,
    session: payload.session || null,
    quantity: Number(payload.quantity),
    unit: payload.unit,
    quality: payload.quality || '',
    recorder: payload.recorder || '',
    notes: payload.notes || '',
    meatYieldKg: payload.meatYieldKg ? Number(payload.meatYieldKg) : null,
    meatType: payload.meatType || null,
    createdAt: new Date().toISOString(),
  }

  // Enclosure impact: reduce occupied on death/slaughter, increase on birth/breeding
  await applyEnclosureImpact(row)

  // Individual animal status impact if animalId is provided
  if (row.animalId && (row.type === 'death' || row.type === 'slaughter')) {
    const animals = storage.get(ANIMALS_KEY, [])
    const idx = animals.findIndex((a) => a.id === row.animalId)
    if (idx >= 0) {
      animals[idx].status = row.type === 'slaughter' ? 'slaughtered' : 'dead'
      animals[idx].diedAt = row.date
      animals[idx].deathReason = row.type === 'slaughter'
        ? `Meat processing – ${row.meatYieldKg ? row.meatYieldKg + ' kg yield' : 'Recorded in production'}`
        : (row.notes || 'Recorded in production')
      storage.set(ANIMALS_KEY, animals)
    }
  }

  const rows = read()
  rows.push(row)
  write(rows)
  return { data: row, error: null }
}

export async function updateProduction(id, patch) {
  await delay()
  const rows = read()
  const i = rows.findIndex((r) => r.id === id)
  if (i < 0) return { data: null, error: 'Record not found' }
  const old = rows[i]

  const updated = {
    ...old,
    ...patch,
    quantity: patch.quantity !== undefined ? Number(patch.quantity) : old.quantity,
    meatYieldKg: patch.meatYieldKg !== undefined ? (patch.meatYieldKg ? Number(patch.meatYieldKg) : null) : old.meatYieldKg,
    meatType: patch.meatType !== undefined ? patch.meatType : old.meatType,
  }

  // Reverse old enclosure impact then apply new
  if (old.enclosureId) {
    await reverseEnclosureImpact(old)
  }
  if (updated.enclosureId) {
    await applyEnclosureImpact(updated)
  }

  rows[i] = updated
  write(rows)
  return { data: rows[i], error: null }
}

export async function deleteProduction(id) {
  await delay()
  const rows = read()
  const target = rows.find((r) => r.id === id)
  if (!target) return { data: true, error: null }

  // Reverse enclosure impact
  if (target.enclosureId) {
    await reverseEnclosureImpact(target)
  }

  // Reverse individual animal death/slaughter status
  if (target.animalId && (target.type === 'death' || target.type === 'slaughter')) {
    const animals = storage.get(ANIMALS_KEY, [])
    const idx = animals.findIndex((a) => a.id === target.animalId)
    if (idx >= 0 && (animals[idx].status === 'dead' || animals[idx].status === 'slaughtered')) {
      animals[idx].status = 'active'
      delete animals[idx].diedAt
      delete animals[idx].deathReason
      storage.set(ANIMALS_KEY, animals)
    }
  }

  write(rows.filter((r) => r.id !== id))
  return { data: true, error: null }
}

export async function getProductionTotals({ farmId, branchId, dateFrom, dateTo } = {}) {
  const { data } = await listProduction({ farmId, branchId, dateFrom, dateTo })
  const byType = {}
  data.forEach((p) => {
    if (!byType[p.type]) byType[p.type] = { quantity: 0, unit: p.unit, count: 0 }
    byType[p.type].quantity += p.quantity
    byType[p.type].count += 1
  })
  return { data: { byType, count: data.length }, error: null }
}

export async function getProductionTrend({ farmId, branchId, type = 'milk', days = 14 } = {}) {
  const { data } = await listProduction({ farmId, branchId, type })
  const map = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    map[key] = { date: key.slice(5), quantity: 0 }
  }
  data.forEach((p) => {
    if (map[p.date]) map[p.date].quantity += p.quantity
  })
  return { data: Object.values(map), error: null }
}
