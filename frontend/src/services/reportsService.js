import { listAnimals } from './animalsService'
import { listExpenses } from './expensesService'
import { listItems } from './inventoryService'
import { listProduction } from './productionService'
import { listSales } from './salesService'
import { listUtilities } from './utilitiesService'
import { listAttendance, listPayments, listWorkers } from './workersService'

const isInDateRange = (record, from, to) => Boolean(record.date)
  && (!from || record.date >= from)
  && (!to || record.date <= to)

async function loadReports({ branchId, dateFrom, dateTo } = {}) {
  const filters = { ...(branchId && branchId !== 'all' ? { branchId } : {}) }
  const results = await Promise.all([
    listSales({ ...filters, dateFrom, dateTo }),
    listExpenses({ ...filters, dateFrom, dateTo }),
    listProduction({ ...filters, dateFrom, dateTo }),
    listUtilities(filters),
    listItems(filters),
    listWorkers(filters),
    listAnimals(filters),
    listAttendance({ ...filters, dateFrom, dateTo }),
    listPayments({ ...filters, dateFrom, dateTo }),
  ])
  const error = results.find((result) => result.error)?.error
  if (error) throw new Error(error)
  const [sales, expenses, production, utilities, inventory, workers, animals, attendance, payments] =
    results.map((result) => result.data)
  return {
    sales: sales.filter((row) => isInDateRange(row, dateFrom, dateTo)),
    expenses: expenses.filter((row) => isInDateRange(row, dateFrom, dateTo)),
    production: production.filter((row) => isInDateRange(row, dateFrom, dateTo)),
    utilities: utilities.filter((row) => (!dateFrom || row.billingPeriod >= dateFrom.slice(0, 7))
      && (!dateTo || row.billingPeriod <= dateTo.slice(0, 7))),
    inventory, workers, animals,
    attendance: attendance.filter((row) => isInDateRange(row, dateFrom, dateTo)),
    payments: payments.filter((row) => isInDateRange(row, dateFrom, dateTo)),
  }
}

async function report(callback) {
  try {
    return { data: await callback(), error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function getOverview(filters = {}) {
  return report(async () => {
    const data = await loadReports(filters)
    const revenue = data.sales.reduce((sum, row) => sum + Number(row.total || 0), 0)
    const collected = data.sales.reduce((sum, row) => sum + Number(row.paidAmount || 0), 0)
    const receivables = revenue - collected
    const expenses = data.expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0)
    const utilities = data.utilities.reduce((sum, row) => sum + Number(row.amount || 0), 0)
    const totalExpenditure = expenses + utilities
    const inventoryValue = data.inventory.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.unitPrice || 0), 0)
    const activeWorkers = data.workers.filter((worker) => worker.status === 'active')
    return {
      revenue, collected, receivables, expenses, utilities, totalExpenditure,
      netProfit: revenue - totalExpenditure,
      profitMargin: revenue ? ((revenue - totalExpenditure) / revenue) * 100 : 0,
      salesCount: data.sales.length, expenseCount: data.expenses.length, productionCount: data.production.length,
      inventoryValue,
      lowStockCount: data.inventory.filter((item) => Number(item.quantity) <= Number(item.minimumThreshold) && Number(item.quantity) > 0).length,
      inventoryItems: data.inventory.length,
      activeWorkers: activeWorkers.length,
      totalWorkers: data.workers.length,
      monthlySalary: activeWorkers.reduce((sum, worker) => sum + Number(worker.salary || 0), 0),
      animals: data.animals.length,
      animalsByHealth: data.animals.reduce((counts, animal) => {
        const health = animal.health || 'healthy'
        counts[health] = (counts[health] || 0) + 1
        return counts
      }, {}),
    }
  })
}

export async function getProfitLoss(filters = {}) {
  return report(async () => {
    const data = await loadReports(filters)
    const months = new Map()
    const monthRow = (month) => {
      if (!months.has(month)) months.set(month, { month, revenue: 0, collected: 0, expenses: 0, utilities: 0, profit: 0 })
      return months.get(month)
    }
    data.sales.forEach((row) => {
      const month = row.date?.slice(0, 7)
      if (!month) return
      const item = monthRow(month)
      item.revenue += Number(row.total || 0)
      item.collected += Number(row.paidAmount || 0)
    })
    data.expenses.forEach((row) => {
      const month = row.date?.slice(0, 7)
      if (month) monthRow(month).expenses += Number(row.amount || 0)
    })
    data.utilities.forEach((row) => {
      const month = row.billingPeriod?.slice(0, 7)
      if (month) monthRow(month).utilities += Number(row.amount || 0)
    })
    return [...months.values()].map((row) => ({
      ...row,
      profit: row.revenue - row.expenses - row.utilities,
    })).sort((a, b) => a.month.localeCompare(b.month))
  })
}

export async function getExpensesBreakdown(filters = {}) {
  return report(async () => {
    const { expenses } = await loadReports(filters)
    const totals = new Map()
    expenses.forEach((row) => {
      const value = totals.get(row.category) || { amount: 0, count: 0 }
      value.amount += Number(row.amount || 0)
      value.count += 1
      totals.set(row.category, value)
    })
    const categories = [...totals].map(([category, value]) => ({ category, ...value }))
      .sort((a, b) => b.amount - a.amount)
    return { categories, total: expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0), count: expenses.length }
  })
}

export async function getSalesReport(filters = {}) {
  return report(async () => {
    const { sales } = await loadReports(filters)
    const byItem = new Map()
    const byPaymentStatus = {}
    sales.forEach((row) => {
      const item = byItem.get(row.itemType) || { revenue: 0, collected: 0, count: 0 }
      item.revenue += Number(row.total || 0)
      item.collected += Number(row.paidAmount || 0)
      item.count += 1
      byItem.set(row.itemType, item)
      const payment = byPaymentStatus[row.paymentStatus] || { count: 0, amount: 0 }
      payment.count += 1
      payment.amount += Number(row.total || 0)
      byPaymentStatus[row.paymentStatus] = payment
    })
    const items = [...byItem].map(([itemType, value]) => ({ itemType, ...value }))
      .sort((a, b) => b.revenue - a.revenue)
    return { items, byPaymentStatus, count: sales.length }
  })
}

export async function getProductionReport(filters = {}) {
  return report(async () => {
    const { production } = await loadReports(filters)
    const byType = new Map()
    production.forEach((row) => {
      const item = byType.get(row.type) || { quantity: 0, unit: row.unit, count: 0 }
      item.quantity += Number(row.quantity || 0)
      item.count += 1
      byType.set(row.type, item)
    })
    const types = [...byType].map(([type, value]) => ({ type, ...value }))
      .sort((a, b) => b.quantity - a.quantity)
    return { types, count: production.length }
  })
}

export async function getInventoryReport(filters = {}) {
  return report(async () => {
    const { inventory } = await loadReports(filters)
    const now = new Date()
    const categories = new Map()
    let totalValue = 0
    let lowStock = 0
    let expiring = 0
    let expired = 0
    inventory.forEach((item) => {
      const value = Number(item.quantity || 0) * Number(item.unitPrice || 0)
      totalValue += value
      const category = categories.get(item.category) || { items: 0, value: 0 }
      category.items += 1
      category.value += value
      categories.set(item.category, category)
      if (Number(item.quantity) <= Number(item.minimumThreshold) && Number(item.quantity) > 0) lowStock += 1
      if (item.expiryDate) {
        const days = Math.floor((new Date(item.expiryDate) - now) / 86400000)
        if (days < 0) expired += 1
        else if (days <= 30) expiring += 1
      }
    })
    return {
      categories: [...categories].map(([category, value]) => ({ category, ...value })).sort((a, b) => b.value - a.value),
      totalValue, lowStock, expiring, expired, totalItems: inventory.length,
    }
  })
}

export async function getWorkersReport(filters = {}) {
  return report(async () => {
    const data = await loadReports(filters)
    const active = data.workers.filter((worker) => worker.status === 'active')
    const attendanceByStatus = {}
    data.attendance.forEach((row) => {
      attendanceByStatus[row.status] = (attendanceByStatus[row.status] || 0) + 1
    })
    const paidByType = {}
    data.payments.forEach((row) => {
      paidByType[row.type] = (paidByType[row.type] || 0) + Number(row.amount || 0)
    })
    return {
      totalWorkers: data.workers.length,
      activeWorkers: active.length,
      monthlySalary: active.reduce((sum, worker) => sum + Number(worker.salary || 0), 0),
      attendanceCount: data.attendance.length,
      attendanceByStatus,
      paymentCount: data.payments.length,
      paidByType,
      totalPaid: data.payments.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    }
  })
}
