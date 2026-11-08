// localStorage-backed sales service.
// Integrates with production inventory and enclosure livestock counts.
import { storage } from './storage'
import { uid } from './mockDb'
import { SALE_ITEM_TYPES } from '@/lib/saleOptions'
import { listEnclosures, updateEnclosure } from './enclosuresService'
import { useAppStore } from '@/store/appStore'

const KEY = 'sales'
const ANIMALS_KEY = 'animals'
const ENCLOSURES_KEY = 'animals.enclosures'
const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms))

const read = () => storage.get(KEY, [])
const write = (rows) => storage.set(KEY, rows)

function notifyEnclosureChange() {
  try { useAppStore.getState().refreshBranches() } catch (_) {}
  window.dispatchEvent(new CustomEvent('khamar:enclosures-changed'))
}

// Helper: Apply enclosure headcount deduction when live animals/stock are sold from an enclosure
async function applySaleEnclosureImpact(saleRow) {
  if (!saleRow.enclosureId) return
  const { data: enclosures } = await listEnclosures({ farmId: saleRow.farmId })
  const enc = enclosures?.find((e) => e.id === saleRow.enclosureId)
  if (!enc) return

  const qty = Number(saleRow.quantity || 0)
  const occupied = Math.max(0, Number(enc.occupied || 0) - qty)
  await updateEnclosure(enc.id, { occupied }, saleRow.farmId)
  notifyEnclosureChange()
}

// Helper: Reverse enclosure headcount deduction when a sale is updated or deleted
async function reverseSaleEnclosureImpact(saleRow) {
  if (!saleRow.enclosureId) return
  const { data: enclosures } = await listEnclosures({ farmId: saleRow.farmId })
  const enc = enclosures?.find((e) => e.id === saleRow.enclosureId)
  if (!enc) return

  const qty = Number(saleRow.quantity || 0)
  const occupied = Number(enc.occupied || 0) + qty
  await updateEnclosure(enc.id, { occupied }, saleRow.farmId)
  notifyEnclosureChange()
}

export async function listSales({ farmId, branchId, search, itemType, paymentStatus, dateFrom, dateTo } = {}) {
  await delay()
  let rows = read().filter((s) => s.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((s) => s.branchId === branchId)
  if (itemType && itemType !== 'all') rows = rows.filter((s) => s.itemType === itemType)
  if (paymentStatus && paymentStatus !== 'all') rows = rows.filter((s) => s.paymentStatus === paymentStatus)
  if (dateFrom) rows = rows.filter((s) => s.date >= dateFrom)
  if (dateTo) rows = rows.filter((s) => s.date <= dateTo)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (s) =>
        s.buyer?.toLowerCase().includes(q) ||
        s.buyerContact?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q) ||
        s.enclosureName?.toLowerCase().includes(q) ||
        s.invoiceNo?.toLowerCase().includes(q)
    )
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { data: rows, error: null }
}

export async function createSale(payload) {
  await delay()
  const quantity = Number(payload.quantity)
  const unitPrice = Number(payload.unitPrice)
  const total = quantity * unitPrice
  const paidAmount = Number(payload.paidAmount || (payload.paymentStatus === 'paid' ? total : 0))

  const row = {
    id: uid('sale'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    invoiceNo: payload.invoiceNo || `INV-${Date.now().toString().slice(-8)}`,
    itemType: payload.itemType,
    enclosureId: payload.enclosureId || null,
    enclosureName: payload.enclosureName || '',
    animalId: payload.animalId || null,
    animalName: payload.animalName || '',
    description: payload.description || '',
    date: payload.date,
    quantity,
    unit: payload.unit || 'unit',
    unitPrice,
    total,
    paidAmount,
    outstanding: Math.max(0, total - paidAmount),
    buyer: payload.buyer || '',
    buyerContact: payload.buyerContact || '',
    paymentStatus: payload.paymentStatus || 'unpaid',
    paymentMethod: payload.paymentMethod || 'cash',
    notes: payload.notes || '',
    createdAt: new Date().toISOString(),
  }

  // Enclosure impact: when selling live animals or pond stock from an enclosure, decrease headcount
  if (row.enclosureId && (row.itemType === 'animal' || row.itemType === 'fish')) {
    await applySaleEnclosureImpact(row)
  }

  // If selling a specific tagged animal, flip its individual status to 'sold'
  if (row.itemType === 'animal' && row.animalId) {
    const animals = storage.get(ANIMALS_KEY, [])
    const idx = animals.findIndex((a) => a.id === row.animalId)
    if (idx >= 0) {
      animals[idx].status = 'sold'
      animals[idx].soldAt = row.date
      animals[idx].saleId = row.id
      storage.set(ANIMALS_KEY, animals)
    }
  }

  const rows = read()
  rows.push(row)
  write(rows)
  return { data: row, error: null }
}

export async function updateSale(id, patch) {
  await delay()
  const rows = read()
  const i = rows.findIndex((r) => r.id === id)
  if (i < 0) return { data: null, error: 'Sale not found' }
  const cur = rows[i]

  // Reverse old enclosure impact if applicable
  if (cur.enclosureId && (cur.itemType === 'animal' || cur.itemType === 'fish')) {
    await reverseSaleEnclosureImpact(cur)
  }

  const quantity = patch.quantity !== undefined ? Number(patch.quantity) : cur.quantity
  const unitPrice = patch.unitPrice !== undefined ? Number(patch.unitPrice) : cur.unitPrice
  const total = quantity * unitPrice
  const paidAmount = patch.paidAmount !== undefined ? Number(patch.paidAmount) : cur.paidAmount

  const updated = {
    ...cur,
    ...patch,
    quantity,
    unitPrice,
    total,
    paidAmount,
    outstanding: Math.max(0, total - paidAmount),
  }

  // Apply new enclosure impact
  if (updated.enclosureId && (updated.itemType === 'animal' || updated.itemType === 'fish')) {
    await applySaleEnclosureImpact(updated)
  }

  rows[i] = updated
  write(rows)
  return { data: rows[i], error: null }
}

export async function deleteSale(id) {
  await delay()
  const rows = read()
  const target = rows.find((r) => r.id === id)
  if (!target) return { data: true, error: null }

  // Reverse enclosure impact
  if (target.enclosureId && (target.itemType === 'animal' || target.itemType === 'fish')) {
    await reverseSaleEnclosureImpact(target)
  }

  // If deleting an individual animal sale, clear its sold status
  if (target?.itemType === 'animal' && target?.animalId) {
    const animals = storage.get(ANIMALS_KEY, [])
    const idx = animals.findIndex((a) => a.id === target.animalId)
    if (idx >= 0) {
      delete animals[idx].soldAt
      delete animals[idx].saleId
      animals[idx].status = 'active'
      storage.set(ANIMALS_KEY, animals)
    }
  }

  write(rows.filter((r) => r.id !== id))
  return { data: true, error: null }
}

export async function getSalesTotals({ farmId, branchId, dateFrom, dateTo } = {}) {
  const { data } = await listSales({ farmId, branchId, dateFrom, dateTo })
  const revenue = data.reduce((s, r) => s + r.total, 0)
  const collected = data.reduce((s, r) => s + r.paidAmount, 0)
  const outstanding = data.reduce((s, r) => s + r.outstanding, 0)
  return { data: { revenue, collected, outstanding, count: data.length }, error: null }
}

/**
 * Returns available stock per sale item type, computed from production minus already-sold.
 * Separates distinct meat types (beef, mutton, chicken_meat, fish).
 * Also integrates live animals/fish from current enclosure headcounts.
 */
export async function getProductionStock({ farmId, branchId } = {}) {
  await delay(100)

  // 1. Raw production records
  const allProduction = storage.get('production', []).filter((p) => p.farmId === farmId)
  const production = branchId && branchId !== 'all'
    ? allProduction.filter((p) => p.branchId === branchId)
    : allProduction

  // 2. Existing sales
  const allSalesRows = read().filter((s) => s.farmId === farmId)
  const salesRows = branchId && branchId !== 'all'
    ? allSalesRows.filter((s) => s.branchId === branchId)
    : allSalesRows

  // 3. Current Enclosures
  const allEnclosures = storage.get(ENCLOSURES_KEY, []).filter((e) => !e.farmId || e.farmId === farmId)
  const enclosures = branchId && branchId !== 'all'
    ? allEnclosures.filter((e) => e.branchId === branchId)
    : allEnclosures

  const stock = {}

  // Initialize stock for all known sale types
  SALE_ITEM_TYPES.forEach((t) => {
    stock[t.id] = { produced: 0, sold: 0, available: 0, unit: t.unit }
  })

  // Helper to categorize meat / harvest items from production
  const resolveProductionItemType = (p) => {
    if (p.type === 'milk') return 'milk'
    if (p.type === 'egg') return 'egg'
    if (p.type === 'harvest') {
      const isFish = p.meatType === 'fish' || p.enclosureName?.toLowerCase().includes('pond') || p.enclosureName?.toLowerCase().includes('fish')
      return isFish ? 'fish' : 'harvest'
    }
    if (p.type === 'slaughter') {
      if (p.meatType) return p.meatType
      const encName = (p.enclosureName || '').toLowerCase()
      if (encName.includes('cow') || encName.includes('dairy') || encName.includes('cattle')) return 'beef'
      if (encName.includes('goat') || encName.includes('sheep')) return 'mutton'
      if (encName.includes('pond') || encName.includes('fish')) return 'fish'
      return 'chicken_meat'
    }
    return null
  }

  // Accumulate production quantities
  production.forEach((p) => {
    const saleType = resolveProductionItemType(p)
    if (!saleType || !stock[saleType]) return

    let qty = 0
    if (p.type === 'slaughter') {
      qty = Number(p.meatYieldKg || 0)
    } else {
      qty = Number(p.quantity || 0)
    }

    stock[saleType].produced += qty
  })

  // Deduct already-sold quantities
  salesRows.forEach((s) => {
    if (stock[s.itemType]) {
      stock[s.itemType].sold += Number(s.quantity || 0)
    }
  })

  // Calculate available balances
  Object.values(stock).forEach((entry) => {
    entry.available = Math.max(0, entry.produced - entry.sold)
  })

  // 4. Live Animals: Computed dynamically from enclosure headcounts
  const totalOccupiedLivestock = enclosures
    .filter((e) => e.type !== 'pond')
    .reduce((sum, e) => sum + Number(e.occupied || 0), 0)

  const totalOccupiedFish = enclosures
    .filter((e) => e.type === 'pond')
    .reduce((sum, e) => sum + Number(e.occupied || 0), 0)

  stock.animal = {
    produced: totalOccupiedLivestock,
    sold: 0,
    available: totalOccupiedLivestock,
    unit: 'head',
    pondFishStock: totalOccupiedFish,
  }

  // If fish also has pond live stock, add it into fish info
  if (stock.fish) {
    stock.fish.pondAvailable = totalOccupiedFish
  }

  return { data: stock, enclosures, error: null }
}
