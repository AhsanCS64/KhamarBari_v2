import { storage } from './storage'
import { uid } from './mockDb'

const KEY = 'utilities'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

const read = () => storage.get(KEY, [])
const write = (rows) => storage.set(KEY, rows)

export async function listUtilities({ farmId, branchId, search, type, status, month } = {}) {
  await delay()
  let rows = read().filter((u) => u.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((u) => u.branchId === branchId)
  if (type && type !== 'all') rows = rows.filter((u) => u.type === type)
  if (status && status !== 'all') rows = rows.filter((u) => u.status === status)
  if (month) rows = rows.filter((u) => u.billingPeriod === month)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (u) =>
        u.meterNo?.toLowerCase().includes(q) ||
        u.notes?.toLowerCase().includes(q) ||
        u.provider?.toLowerCase().includes(q)
    )
  }
  rows.sort((a, b) => (a.billingPeriod < b.billingPeriod ? 1 : -1))
  return { data: rows, error: null }
}

export async function createUtility(payload) {
  await delay()
  const row = {
    id: uid('util'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    type: payload.type,
    provider: payload.provider || '',
    meterNo: payload.meterNo || '',
    billingPeriod: payload.billingPeriod,
    prevReading: Number(payload.prevReading || 0),
    currentReading: Number(payload.currentReading || 0),
    consumption: Number(payload.currentReading || 0) - Number(payload.prevReading || 0),
    unit: payload.unit || '',
    amount: Number(payload.amount || 0),
    dueDate: payload.dueDate || null,
    paidDate: payload.paidDate || null,
    status: payload.status || 'pending',
    invoiceNo: payload.invoiceNo || '',
    notes: payload.notes || '',
    createdAt: new Date().toISOString(),
  }
  const rows = read()
  rows.push(row)
  write(rows)
  return { data: row, error: null }
}

export async function updateUtility(id, patch) {
  await delay()
  const rows = read()
  const i = rows.findIndex((r) => r.id === id)
  if (i < 0) return { data: null, error: 'Utility not found' }
  const consumption =
    patch.currentReading !== undefined || patch.prevReading !== undefined
      ? Number(patch.currentReading ?? rows[i].currentReading) - Number(patch.prevReading ?? rows[i].prevReading)
      : rows[i].consumption
  rows[i] = {
    ...rows[i],
    ...patch,
    prevReading: patch.prevReading !== undefined ? Number(patch.prevReading) : rows[i].prevReading,
    currentReading: patch.currentReading !== undefined ? Number(patch.currentReading) : rows[i].currentReading,
    amount: patch.amount !== undefined ? Number(patch.amount) : rows[i].amount,
    consumption,
  }
  write(rows)
  return { data: rows[i], error: null }
}

export async function deleteUtility(id) {
  await delay()
  write(read().filter((r) => r.id !== id))
  return { data: true, error: null }
}

export async function getUtilitiesTotals({ farmId, branchId } = {}) {
  const { data } = await listUtilities({ farmId, branchId })
  const unpaid = data.filter((u) => u.status !== 'paid')
  const unpaidAmount = unpaid.reduce((s, u) => s + u.amount, 0)
  const totalAmount = data.reduce((s, u) => s + u.amount, 0)
  const byType = {}
  data.forEach((u) => {
    if (!byType[u.type]) byType[u.type] = { amount: 0, count: 0 }
    byType[u.type].amount += u.amount
    byType[u.type].count += 1
  })
  return {
    data: { totalBills: data.length, totalAmount, unpaidCount: unpaid.length, unpaidAmount, byType },
    error: null,
  }
}