import { storage } from './storage'
import { listEnclosures } from './enclosuresService'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

const read = (key) => storage.get(key, [])
const within = (dateStr, from, to) => {
  if (!dateStr) return false
  if (from && dateStr < from) return false
  if (to && dateStr > to) return false
  return true
}
const filterBy = (rows, { farmId, branchId }) =>
  rows.filter((r) => r.farmId === farmId && (branchId === 'all' || r.branchId === branchId))

// ─────────── OVERVIEW (all KPIs at once) ───────────
export async function getOverview({ farmId, branchId, dateFrom, dateTo } = {}) {
  await delay()

  const sales = filterBy(read('sales'), { farmId, branchId }).filter((s) => within(s.date, dateFrom, dateTo))
  const expenses = filterBy(read('expenses'), { farmId, branchId }).filter((e) => within(e.date, dateFrom, dateTo))
  const production = filterBy(read('production'), { farmId, branchId }).filter((p) => within(p.date, dateFrom, dateTo))
  const utilities = filterBy(read('utilities'), { farmId, branchId }).filter((u) => within(u.billingPeriod, dateFrom?.slice(0, 7), dateTo?.slice(0, 7)))
  const inventory = filterBy(read('inventory_items'), { farmId, branchId })
  const workers = filterBy(read('workers'), { farmId, branchId })
  const animals = filterBy(read('animals'), { farmId, branchId })
  const { data: enclosures } = await listEnclosures({ farmId, branchId })
  const enclosureHeadcount = enclosures.reduce((sum, enclosure) => sum + Number(enclosure.occupied || 0), 0)
  const enclosureCapacity = enclosures.reduce((sum, enclosure) => sum + Number(enclosure.capacity || 0), 0)

  const revenue = sales.reduce((s, r) => s + (r.total || 0), 0)
  const collected = sales.reduce((s, r) => s + (r.paidAmount || 0), 0)
  const receivables = revenue - collected

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const totalUtilities = utilities.reduce((s, u) => s + (u.amount || 0), 0)
  const totalExpenditure = totalExpenses + totalUtilities

  const netProfit = revenue - totalExpenditure
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  const inventoryValue = inventory.reduce((s, i) => s + (Number(i.quantity) * Number(i.unitPrice)), 0)
  const lowStockCount = inventory.filter((i) => Number(i.quantity) <= Number(i.minimumThreshold) && Number(i.quantity) > 0).length

  const activeWorkers = workers.filter((w) => w.status === 'active').length
  const monthlySalary = workers.filter((w) => w.status === 'active').reduce((s, w) => s + (w.salary || 0), 0)

  return {
    data: {
      revenue, collected, receivables,
      expenses: totalExpenses, utilities: totalUtilities, totalExpenditure,
      netProfit, profitMargin,
      salesCount: sales.length,
      expenseCount: expenses.length,
      productionCount: production.length,
      inventoryValue, lowStockCount, inventoryItems: inventory.length,
      activeWorkers, totalWorkers: workers.length, monthlySalary,
      animals: enclosureHeadcount || animals.length,
      enclosures: enclosures.length,
      occupancy: enclosureHeadcount,
      capacity: enclosureCapacity,
      animalsByHealth: animals.reduce((acc, a) => {
        acc[a.health || 'healthy'] = (acc[a.health || 'healthy'] || 0) + 1
        return acc
      }, {}),
    },
    error: null,
  }
}

// ─────────── PROFIT & LOSS (monthly trend) ───────────
export async function getProfitLoss({ farmId, branchId, dateFrom, dateTo } = {}) {
  await delay()
  const sales = filterBy(read('sales'), { farmId, branchId }).filter((s) => within(s.date, dateFrom, dateTo))
  const expenses = filterBy(read('expenses'), { farmId, branchId }).filter((e) => within(e.date, dateFrom, dateTo))
  const utilities = filterBy(read('utilities'), { farmId, branchId })

  const months = {}
  const addMonth = (m) => { if (!months[m]) months[m] = { month: m, revenue: 0, collected: 0, expenses: 0, utilities: 0, profit: 0 } }

  sales.forEach((s) => {
    const m = s.date?.slice(0, 7); if (!m) return
    addMonth(m); months[m].revenue += s.total || 0; months[m].collected += s.paidAmount || 0
  })
  expenses.forEach((e) => {
    const m = e.date?.slice(0, 7); if (!m) return
    addMonth(m); months[m].expenses += e.amount || 0
  })
  utilities.forEach((u) => {
    const m = u.billingPeriod?.slice(0, 7); if (!m) return
    addMonth(m); months[m].utilities += u.amount || 0
  })

  Object.values(months).forEach((m) => { m.profit = m.revenue - m.expenses - m.utilities })
  const rows = Object.values(months).sort((a, b) => (a.month < b.month ? -1 : 1))

  return { data: rows, error: null }
}

// ─────────── EXPENSES BREAKDOWN ───────────
export async function getExpensesBreakdown({ farmId, branchId, dateFrom, dateTo } = {}) {
  await delay()
  const rows = filterBy(read('expenses'), { farmId, branchId }).filter((e) => within(e.date, dateFrom, dateTo))

  const byCategory = {}
  rows.forEach((e) => {
    if (!byCategory[e.category]) byCategory[e.category] = { amount: 0, count: 0 }
    byCategory[e.category].amount += e.amount || 0
    byCategory[e.category].count += 1
  })
  const categories = Object.entries(byCategory).map(([id, v]) => ({ category: id, ...v })).sort((a, b) => b.amount - a.amount)

  const total = rows.reduce((s, e) => s + (e.amount || 0), 0)

  return { data: { categories, total, count: rows.length }, error: null }
}

// ─────────── SALES REPORT ───────────
export async function getSalesReport({ farmId, branchId, dateFrom, dateTo } = {}) {
  await delay()
  const rows = filterBy(read('sales'), { farmId, branchId }).filter((s) => within(s.date, dateFrom, dateTo))

  const byItem = {}
  rows.forEach((s) => {
    if (!byItem[s.itemType]) byItem[s.itemType] = { revenue: 0, collected: 0, count: 0 }
    byItem[s.itemType].revenue += s.total || 0
    byItem[s.itemType].collected += s.paidAmount || 0
    byItem[s.itemType].count += 1
  })
  const items = Object.entries(byItem).map(([id, v]) => ({ itemType: id, ...v })).sort((a, b) => b.revenue - a.revenue)

  const byPaymentStatus = {}
  rows.forEach((s) => {
    if (!byPaymentStatus[s.paymentStatus]) byPaymentStatus[s.paymentStatus] = { count: 0, amount: 0 }
    byPaymentStatus[s.paymentStatus].count += 1
    byPaymentStatus[s.paymentStatus].amount += s.total || 0
  })

  return { data: { items, byPaymentStatus, count: rows.length }, error: null }
}

// ─────────── PRODUCTION REPORT ───────────
export async function getProductionReport({ farmId, branchId, dateFrom, dateTo } = {}) {
  await delay()
  const rows = filterBy(read('production'), { farmId, branchId }).filter((p) => within(p.date, dateFrom, dateTo))

  const byType = {}
  rows.forEach((p) => {
    if (!byType[p.type]) byType[p.type] = { quantity: 0, unit: p.unit, count: 0 }
    byType[p.type].quantity += p.quantity || 0
    byType[p.type].count += 1
  })
  const types = Object.entries(byType).map(([id, v]) => ({ type: id, ...v })).sort((a, b) => b.quantity - a.quantity)

  return { data: { types, count: rows.length }, error: null }
}

// ─────────── INVENTORY REPORT ───────────
export async function getInventoryReport({ farmId, branchId } = {}) {
  await delay()
  const rows = filterBy(read('inventory_items'), { farmId, branchId })
  const now = new Date()

  const byCategory = {}
  let totalValue = 0
  let lowStock = 0
  let expiring = 0
  let expired = 0

  rows.forEach((i) => {
    const value = Number(i.quantity || 0) * Number(i.unitPrice || 0)
    totalValue += value
    if (!byCategory[i.category]) byCategory[i.category] = { items: 0, value: 0 }
    byCategory[i.category].items += 1
    byCategory[i.category].value += value
    if (Number(i.quantity) <= Number(i.minimumThreshold) && Number(i.quantity) > 0) lowStock++
    if (i.expiryDate) {
      const days = Math.floor((new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24))
      if (days < 0) expired++
      else if (days <= 30) expiring++
    }
  })
  const categories = Object.entries(byCategory).map(([id, v]) => ({ category: id, ...v })).sort((a, b) => b.value - a.value)

  return { data: { categories, totalValue, lowStock, expiring, expired, totalItems: rows.length }, error: null }
}

// ─────────── WORKERS REPORT ───────────
export async function getWorkersReport({ farmId, branchId, dateFrom, dateTo } = {}) {
  await delay()
  const workers = filterBy(read('workers'), { farmId, branchId })
  const attendance = read('attendance').filter((a) => within(a.date, dateFrom, dateTo) && workers.some((w) => w.id === a.workerId))
  const payments = read('worker_payments').filter((p) => within(p.date, dateFrom, dateTo) && workers.some((w) => w.id === p.workerId))

  const activeWorkers = workers.filter((w) => w.status === 'active').length
  const monthlySalary = workers.filter((w) => w.status === 'active').reduce((s, w) => s + (w.salary || 0), 0)

  const attendanceByStatus = {}
  attendance.forEach((a) => {
    attendanceByStatus[a.status] = (attendanceByStatus[a.status] || 0) + 1
  })

  const paidByType = {}
  payments.forEach((p) => {
    paidByType[p.type] = (paidByType[p.type] || 0) + (p.amount || 0)
  })

  return {
    data: {
      totalWorkers: workers.length,
      activeWorkers,
      monthlySalary,
      attendanceCount: attendance.length,
      attendanceByStatus,
      paymentCount: payments.length,
      paidByType,
      totalPaid: payments.reduce((s, p) => s + (p.amount || 0), 0),
    },
    error: null,
  }
}