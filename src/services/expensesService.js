import { storage } from './storage'
import { uid } from './mockDb'

const KEY = 'expenses'
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))
const read = () => storage.get(KEY, [])
const write = (rows) => storage.set(KEY, rows)

export async function listExpenses({ farmId, branchId, search, category, dateFrom, dateTo } = {}) {
  await delay()
  let rows = read().filter((expense) => expense.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((expense) => expense.branchId === branchId)
  if (category && category !== 'all') rows = rows.filter((expense) => expense.category === category)
  if (dateFrom) rows = rows.filter((expense) => expense.date >= dateFrom)
  if (dateTo) rows = rows.filter((expense) => expense.date <= dateTo)
  if (search) {
    const query = search.toLowerCase()
    rows = rows.filter((expense) => [expense.title, expense.paidBy, expense.supplier, expense.description].some((value) => value?.toLowerCase().includes(query)))
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { data: rows, error: null }
}

export async function createExpense(payload) {
  await delay()
  const row = {
    id: uid('exp'), farmId: payload.farmId, branchId: payload.branchId || null,
    title: payload.title, category: payload.category, amount: Number(payload.amount), date: payload.date,
    paymentMethod: payload.paymentMethod || 'cash', paidBy: payload.paidBy || '',
    relatedAnimalId: payload.relatedAnimalId || null, supplier: payload.supplier || '',
    description: payload.description || '', receipt: payload.receipt || null, createdAt: new Date().toISOString(),
  }
  const rows = read()
  rows.push(row)
  write(rows)
  return { data: row, error: null }
}

export async function updateExpense(id, patch) {
  await delay()
  const rows = read()
  const index = rows.findIndex((row) => row.id === id)
  if (index < 0) return { data: null, error: 'Expense not found' }
  rows[index] = { ...rows[index], ...patch, amount: patch.amount !== undefined ? Number(patch.amount) : rows[index].amount }
  write(rows)
  return { data: rows[index], error: null }
}

export async function deleteExpense(id) {
  await delay()
  write(read().filter((row) => row.id !== id))
  return { data: true, error: null }
}

export async function getExpenseTotals({ farmId, branchId, dateFrom, dateTo } = {}) {
  const { data } = await listExpenses({ farmId, branchId, dateFrom, dateTo })
  const total = data.reduce((sum, expense) => sum + expense.amount, 0)
  const byCategory = data.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount
    return totals
  }, {})
  return { data: { total, count: data.length, byCategory }, error: null }
}