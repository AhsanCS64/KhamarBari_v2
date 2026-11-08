import { storage } from './storage'
import { uid } from './mockDb'

const ITEMS_KEY = 'inventory_items'
const MOVES_KEY = 'inventory_moves'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

const readItems = () => storage.get(ITEMS_KEY, [])
const writeItems = (rows) => storage.set(ITEMS_KEY, rows)
const readMoves = () => storage.get(MOVES_KEY, [])
const writeMoves = (rows) => storage.set(MOVES_KEY, rows)

export async function listItems({ farmId, branchId, search, category, stockStatus } = {}) {
  await delay()
  let rows = readItems().filter((i) => i.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((i) => i.branchId === branchId)
  if (category && category !== 'all') rows = rows.filter((i) => i.category === category)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q) ||
        i.supplier?.toLowerCase().includes(q)
    )
  }
  if (stockStatus && stockStatus !== 'all') {
    const now = new Date()
    rows = rows.filter((i) => {
      const qty = Number(i.quantity || 0)
      const min = Number(i.minimumThreshold || 0)
      const expiry = i.expiryDate ? new Date(i.expiryDate) : null
      const daysToExpiry = expiry ? Math.floor((expiry - now) / (1000 * 60 * 60 * 24)) : null
      switch (stockStatus) {
        case 'low': return qty <= min && qty > 0
        case 'expiring': return daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 30
        case 'expired': return daysToExpiry !== null && daysToExpiry < 0
        case 'ok': return qty > min
        default: return true
      }
    })
  }
  rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  return { data: rows, error: null }
}

export async function createItem(payload) {
  await delay()
  const row = {
    id: uid('inv'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    name: payload.name,
    sku: payload.sku || '',
    category: payload.category,
    unit: payload.unit,
    quantity: Number(payload.quantity || 0),
    minimumThreshold: Number(payload.minimumThreshold || 0),
    unitPrice: Number(payload.unitPrice || 0),
    supplier: payload.supplier || '',
    expiryDate: payload.expiryDate || null,
    notes: payload.notes || '',
    createdAt: new Date().toISOString(),
  }
  const rows = readItems()
  rows.push(row)
  writeItems(rows)
  return { data: row, error: null }
}

export async function updateItem(id, patch) {
  await delay()
  const rows = readItems()
  const i = rows.findIndex((r) => r.id === id)
  if (i < 0) return { data: null, error: 'Item not found' }
  rows[i] = {
    ...rows[i],
    ...patch,
    quantity: patch.quantity !== undefined ? Number(patch.quantity) : rows[i].quantity,
    minimumThreshold: patch.minimumThreshold !== undefined ? Number(patch.minimumThreshold) : rows[i].minimumThreshold,
    unitPrice: patch.unitPrice !== undefined ? Number(patch.unitPrice) : rows[i].unitPrice,
  }
  writeItems(rows)
  return { data: rows[i], error: null }
}

export async function deleteItem(id) {
  await delay()
  writeItems(readItems().filter((r) => r.id !== id))
  writeMoves(readMoves().filter((m) => m.itemId !== id))
  return { data: true, error: null }
}

export async function recordMovement(payload) {
  await delay()
  const items = readItems()
  const idx = items.findIndex((i) => i.id === payload.itemId)
  if (idx < 0) return { data: null, error: 'Item not found' }

  const item = items[idx]
  const qty = Number(payload.quantity)

  let newQuantity = item.quantity
  if (payload.type === 'purchase') newQuantity = item.quantity + qty
  else if (payload.type === 'usage') newQuantity = Math.max(0, item.quantity - qty)
  else if (payload.type === 'adjustment') newQuantity = qty
  else if (payload.type === 'transfer') newQuantity = Math.max(0, item.quantity - qty)

  items[idx] = { ...item, quantity: newQuantity }
  writeItems(items)

  const move = {
    id: uid('mv'),
    itemId: payload.itemId,
    farmId: item.farmId,
    branchId: payload.branchId || item.branchId,
    type: payload.type,
    quantity: qty,
    unit: item.unit,
    date: payload.date,
    reference: payload.reference || '',
    notes: payload.notes || '',
    recordedBy: payload.recordedBy || '',
    createdAt: new Date().toISOString(),
  }
  const moves = readMoves()
  moves.push(move)
  writeMoves(moves)

  return { data: { item: items[idx], movement: move }, error: null }
}

export async function listMovements({ itemId } = {}) {
  await delay()
  let rows = readMoves()
  if (itemId) rows = rows.filter((m) => m.itemId === itemId)
  rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { data: rows, error: null }
}

export async function getInventoryTotals({ farmId, branchId } = {}) {
  const { data } = await listItems({ farmId, branchId })
  const now = new Date()
  let totalValue = 0
  let lowStock = 0
  let expiring = 0
  let expired = 0
  data.forEach((i) => {
    totalValue += Number(i.quantity || 0) * Number(i.unitPrice || 0)
    if (Number(i.quantity) <= Number(i.minimumThreshold) && Number(i.quantity) > 0) lowStock++
    if (i.expiryDate) {
      const days = Math.floor((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24))
      if (days < 0) expired++
      else if (days <= 30) expiring++
    }
  })
  return { data: { totalItems: data.length, totalValue, lowStock, expiring, expired }, error: null }
}