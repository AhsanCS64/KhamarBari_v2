import { listAnimals } from './animalsService'
import { listBranches } from './branchService'
import { listEnclosures } from './enclosuresService'
import { listExpenses } from './expensesService'
import { listItems } from './inventoryService'
import { listProduction } from './productionService'
import { listSales } from './salesService'
import { listUtilities } from './utilitiesService'
import { listWorkers } from './workersService'

const dateKey = (date) => new Date(date).toISOString().slice(0, 10)
const getRangeDays = (range) => {
  if (range === 'ytd') {
    const start = new Date(new Date().getFullYear(), 0, 1)
    return Math.floor((Date.now() - start.getTime()) / 86400000) + 1
  }
  const parsed = Number.parseInt(range, 10)
  return Number.isFinite(parsed) ? parsed : 7
}

async function loadDashboardData({ farmId, branchId }) {
  const filters = { ...(branchId && branchId !== 'all' ? { branchId } : {}) }
  const results = await Promise.all([
    listAnimals({ ...filters, status: 'active' }),
    listBranches(),
    listEnclosures(filters),
    listExpenses(filters),
    listSales(filters),
    listProduction(filters),
    listItems(filters),
    listUtilities(filters),
    listWorkers(filters),
  ])
  const error = results.find((result) => result.error)?.error
  if (error) throw new Error(error)
  const [animals, branches, enclosures, expenses, sales, production, inventory, utilities, workers] = results.map((result) => result.data)
  return { animals, branches, enclosures, expenses, sales, production, inventory, utilities, workers, farmId }
}

function getHealthCounts(animals, enclosures) {
  const counts = { healthy: 0, monitoring: 0, affected: 0 }
  const assignedEnclosureIds = new Set()

  enclosures.forEach((enclosure) => {
    const occupied = Math.max(0, Number(enclosure.occupied || 0))
    const sickCount = Math.min(occupied, Math.max(0, Number(enclosure.sickCount || 0)))
    const health = enclosure.health || 'healthy'

    if (health === 'watch') {
      const monitoring = sickCount || occupied
      counts.monitoring += monitoring
      counts.healthy += occupied - monitoring
    } else if (health === 'treatment' || health === 'quarantine') {
      const affected = sickCount || occupied
      counts.affected += affected
      counts.healthy += occupied - affected
    } else {
      counts.healthy += occupied - sickCount
      counts.affected += sickCount
    }

    if (enclosure.id) assignedEnclosureIds.add(String(enclosure.id))
  })

  animals.forEach((animal) => {
    if (animal.status !== 'active' || (animal.enclosureId && assignedEnclosureIds.has(String(animal.enclosureId)))) return
    const health = animal.health || 'healthy'
    if (health === 'watch') counts.monitoring += 1
    else if (health === 'treatment' || health === 'quarantine') counts.affected += 1
    else counts.healthy += 1
  })

  return counts
}

export async function getDashboardSummary({ farmId, branchId, range = '7d' }) {
  try {
    const data = await loadDashboardData({ farmId, branchId })
    const healthCounts = getHealthCounts(data.animals, data.enclosures)
    const totalAnimals = healthCounts.healthy + healthCounts.monitoring + healthCounts.affected
    const today = dateKey(new Date())
    const start = new Date()
    start.setDate(start.getDate() - getRangeDays(range) + 1)
    const from = dateKey(start)
    const inRange = (record) => record.date >= from && record.date <= today
    const recentSales = data.sales.filter(inRange)
    const recentExpenses = data.expenses.filter(inRange)
    const recentProduction = data.production.filter(inRange)
    const thirtyDaysAgo = dateKey(new Date(Date.now() - 29 * 86400000))
    const sales30d = data.sales.filter((sale) => sale.date >= thirtyDaysAgo && sale.date <= today)
    const expenses30d = data.expenses.filter((expense) => expense.date >= thirtyDaysAgo && expense.date <= today)
    const todayProduction = recentProduction.filter((record) => record.date === today)
    const grouped = new Map()
    for (let offset = getRangeDays(range) - 1; offset >= 0; offset -= 1) {
      const day = new Date()
      day.setDate(day.getDate() - offset)
      grouped.set(dateKey(day), { day: day.toLocaleDateString('en', { weekday: 'short' }), income: 0, expense: 0 })
    }
    recentSales.forEach((sale) => {
      const row = grouped.get(sale.date)
      if (row) row.income += Number(sale.total || 0)
    })
    recentExpenses.forEach((expense) => {
      const row = grouped.get(expense.date)
      if (row) row.expense += Number(expense.amount || 0)
    })
    const trend = new Map()
    grouped.forEach((_, day) => trend.set(day, { date: day.slice(5), milk: 0, eggs: 0 }))
    recentProduction.forEach((record) => {
      const row = trend.get(record.date)
      if (row && record.type === 'milk') row.milk += Number(record.quantity || 0)
      if (row && record.type === 'egg') row.eggs += Number(record.quantity || 0)
    })
    const revenue = sales30d.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
    const expenseTotal = expenses30d.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    const totalCapacity = data.enclosures.reduce((sum, enclosure) => sum + Number(enclosure.capacity || 0), 0)
    const occupied = data.enclosures.reduce((sum, enclosure) => sum + Number(enclosure.occupied || 0), 0)
    const kpis = {
      totalAnimals,
      totalCapacity,
      utilizationRate: totalCapacity ? Math.round((occupied / totalCapacity) * 100) : 0,
      male: data.animals.filter((animal) => animal.gender === 'male').length,
      female: data.animals.filter((animal) => animal.gender === 'female').length,
      healthy: healthCounts.healthy,
      sick: healthCounts.monitoring + healthCounts.affected,
      activeWorkers: data.workers.filter((worker) => worker.status !== 'inactive').length,
      totalWorkers: data.workers.length,
      lowStockCount: data.inventory.filter((item) => Number(item.quantity || 0) <= Number(item.minimumThreshold || 0)).length,
      births30d: data.production.filter((record) => record.type === 'birth' && record.date >= thirtyDaysAgo && record.date <= today).reduce((sum, record) => sum + Number(record.quantity || 0), 0),
      deaths30d: data.production.filter((record) => record.type === 'death' && record.date >= thirtyDaysAgo && record.date <= today).reduce((sum, record) => sum + Number(record.quantity || 0), 0),
      productionToday: {
        milk: todayProduction.filter((record) => record.type === 'milk').reduce((sum, record) => sum + Number(record.quantity || 0), 0),
        eggs: todayProduction.filter((record) => record.type === 'egg').reduce((sum, record) => sum + Number(record.quantity || 0), 0),
      },
      expenses30d: expenseTotal,
      revenue30d: revenue,
      netProfit: revenue - expenseTotal,
    }
    return {
      data: {
        kpis,
        incomeVsExpense: [...grouped.values()],
        healthBreakdown: [
          { name: 'Healthy', value: healthCounts.healthy },
          { name: 'Watch', value: healthCounts.monitoring },
          { name: 'Sick / affected', value: healthCounts.affected },
        ],
        productionTrend: [...trend.values()],
        branchCount: data.branches.length,
        enclosures: data.enclosures,
      },
      error: null,
    }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function getRecentActivity({ farmId, branchId } = {}) {
  try {
    const data = await loadDashboardData({ farmId, branchId })
    const activity = [
      ...data.animals.map((record) => ({ id: record.id, type: 'animal', title: `Animal ${record.tag} added`, createdAt: record.createdAt })),
      ...data.sales.map((record) => ({ id: record.id, type: 'sale', title: `Sale to ${record.buyer}`, createdAt: record.createdAt })),
      ...data.expenses.map((record) => ({ id: record.id, type: 'expense', title: `Expense: ${record.title}`, createdAt: record.createdAt })),
      ...data.production.map((record) => ({ id: record.id, type: 'production', title: `${record.type} production recorded`, createdAt: record.createdAt })),
    ]
      .filter((record) => record.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map((record) => ({ ...record, time: new Date(record.createdAt).toLocaleString() }))
    return { data: activity, error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

export async function getAlerts({ farmId, branchId } = {}) {
  try {
    const data = await loadDashboardData({ farmId, branchId })
    const enclosedAnimals = new Map()
    data.animals.forEach((animal) => {
      if (!animal.enclosureId || animal.health === 'healthy' || !animal.health) return
      const enclosureId = String(animal.enclosureId)
      enclosedAnimals.set(enclosureId, (enclosedAnimals.get(enclosureId) || 0) + 1)
    })

    const enclosureAlerts = data.enclosures.flatMap((enclosure) => {
      const animalCount = enclosedAnimals.get(String(enclosure.id)) || 0
      const affectedCount = Math.max(Number(enclosure.sickCount || 0), animalCount)
      const health = enclosure.health || 'healthy'
      if (affectedCount === 0 && health === 'healthy') return []

      const needsCare = health === 'treatment' || health === 'quarantine' || affectedCount > 0
      const count = affectedCount || Number(enclosure.occupied || 0)
      const healthLabel = health === 'watch' ? 'under observation' : health
      return [{
        id: `enclosure-health-${enclosure.id}`,
        severity: needsCare ? 'high' : 'medium',
        title: `${enclosure.name}: ${healthLabel}`,
        detail: count > 0 ? `${count} of ${Number(enclosure.occupied || 0)} occupied stock need attention.` : 'Enclosure health needs review.',
        type: 'animal',
        href: '/dashboard/animals',
      }]
    })

    const enclosedIds = new Set(data.enclosures.map((enclosure) => String(enclosure.id)))
    const alerts = [
      ...enclosureAlerts,
      ...data.animals.filter((animal) =>
        (!animal.enclosureId || !enclosedIds.has(String(animal.enclosureId))) &&
        animal.health && animal.health !== 'healthy'
      ).map((animal) => ({
        id: `animal-${animal.id}`,
        severity: animal.health === 'watch' ? 'medium' : 'high',
        title: `${animal.tag || animal.name || 'Animal'}: ${animal.health}`,
        detail: 'Animal health status needs review.',
        type: 'animal',
        href: '/dashboard/animals',
      })),
      ...data.inventory.filter((item) => Number(item.quantity) <= Number(item.minimumThreshold)).map((item) => ({
        id: `inventory-${item.id}`,
        severity: 'medium',
        title: `${item.name}: stock is low`,
        detail: `${Number(item.quantity || 0)} ${item.unit || ''} remaining (minimum ${Number(item.minimumThreshold || 0)}).`,
        type: 'inventory',
        href: '/dashboard/inventory',
      })),
      ...data.utilities.filter((utility) => utility.status === 'overdue').map((utility) => ({
        id: `utility-${utility.id}`,
        severity: 'medium',
        title: `${utility.type}: bill overdue`,
        detail: 'Review the overdue utility bill.',
        type: 'utility',
        href: '/dashboard/utilities',
      })),
    ]
    const severity = { high: 0, medium: 1, low: 2 }
    alerts.sort((a, b) => severity[a.severity] - severity[b.severity])
    return { data: alerts, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
