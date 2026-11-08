import { listEnclosures } from './enclosuresService'
import { storage } from './storage'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))
const read = (key) => storage.get(key, [])
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const scoped = (rows, farmId, branchId) => rows.filter((row) => row.farmId === farmId && (branchId === 'all' || row.branchId === branchId))
const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0)

function getRangeStart(range, today) {
  const start = new Date(today)
  if (range === 'ytd') start.setMonth(0, 1)
  else start.setDate(start.getDate() - (Number.parseInt(range, 10) || 7) + 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function inRange(date, from, to) {
  return Boolean(date) && date >= from && date <= to
}

function buildHealthBreakdown(enclosures, animals) {
  const counts = { healthy: 0, monitoring: 0, atRisk: 0 }
  if (enclosures.length) {
    enclosures.forEach((enclosure) => {
      const occupied = Number(enclosure.occupied || 0)
      const sick = Math.min(Number(enclosure.sickCount || 0), occupied)
      const status = enclosure.health
      if (status === 'watch') counts.monitoring += occupied - sick
      else if (status === 'treatment' || status === 'quarantine') counts.atRisk += occupied - sick
      else counts.healthy += occupied - sick
      counts.atRisk += sick
    })
  } else {
    animals.forEach((animal) => {
      if (['sick', 'treatment', 'quarantine'].includes(animal.health)) counts.atRisk += 1
      else if (animal.health === 'watch') counts.monitoring += 1
      else counts.healthy += 1
    })
  }
  return [
    { name: 'Healthy', value: counts.healthy, color: '#4d9467' },
    { name: 'Monitoring', value: counts.monitoring, color: '#d6a53c' },
    { name: 'Sick / affected', value: counts.atRisk, color: '#c95744' },
  ].filter((entry) => entry.value > 0)
}

function buildCashFlow(sales, expenses, utilities, from, to) {
  const totalDays = Math.max(1, Math.ceil((to - from) / 86400000) + 1)
  const bucketDays = Math.max(1, Math.ceil(totalDays / 7))
  const bucketCount = Math.min(7, totalDays)
  return Array.from({ length: bucketCount }, (_, index) => {
    const start = new Date(from)
    start.setDate(start.getDate() + index * bucketDays)
    const end = new Date(start)
    end.setDate(end.getDate() + bucketDays - 1)
    if (end > to) end.setTime(to.getTime())
    const startKey = dateKey(start)
    const endKey = dateKey(end)
    const matches = (date) => date >= startKey && date <= endKey
    const label = totalDays <= 8
      ? start.toLocaleDateString(undefined, { weekday: 'short' })
      : start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return {
      day: label,
      income: sum(sales.filter((sale) => matches(sale.date)), 'total'),
      expense: sum(expenses.filter((expense) => matches(expense.date)), 'amount')
        + sum(utilities.filter((utility) => matches(`${utility.billingPeriod}-01`)), 'amount'),
    }
  })
}

function buildProductionTrend(rows) {
  const points = new Map()
  for (let offset = 13; offset >= 0; offset--) {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    const key = dateKey(date)
    points.set(key, { date: date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }), milk: 0, eggs: 0 })
  }
  rows.forEach((record) => {
    const point = points.get(record.date)
    if (!point) return
    if (record.type === 'milk') point.milk += Number(record.quantity || 0)
    if (record.type === 'egg' || record.type === 'eggs') point.eggs += Number(record.quantity || 0)
  })
  return Array.from(points.values())
}

export async function getDashboardSummary({ farmId, branchId, range = '7d' }) {
  await delay()
  const today = new Date()
  const todayKey = dateKey(today)
  const from = getRangeStart(range, today)
  const fromKey = dateKey(from)
  const toKey = todayKey
  const [enclosureResult] = await Promise.all([listEnclosures({ farmId, branchId })])
  const enclosures = enclosureResult.data || []
  const sales = scoped(read('sales'), farmId, branchId).filter((row) => inRange(row.date, fromKey, toKey))
  const expenses = scoped(read('expenses'), farmId, branchId).filter((row) => inRange(row.date, fromKey, toKey))
  const utilities = scoped(read('utilities'), farmId, branchId).filter((row) => {
    const periodDate = row.billingPeriod ? `${row.billingPeriod}-01` : row.dueDate
    return inRange(periodDate, fromKey.slice(0, 7) + '-01', toKey)
  })
  const production = scoped(read('production'), farmId, branchId)
  const farmAnimals = scoped(read('animals'), farmId, branchId).filter((animal) => animal.status !== 'sold' && animal.status !== 'dead')
  const workers = scoped(read('workers'), farmId, branchId)
  const inventory = scoped(read('inventory_items'), farmId, branchId)
  const lowStockCount = inventory.filter((item) => Number(item.quantity || 0) <= Number(item.minimumThreshold || 0)).length
  const occupied = enclosures.reduce((total, enclosure) => total + Number(enclosure.occupied || 0), 0)
  const totalCapacity = enclosures.reduce((total, enclosure) => total + Number(enclosure.capacity || 0), 0)
  const individualAnimals = farmAnimals.length
  const totalAnimals = enclosures.length ? occupied : individualAnimals
  const sick = enclosures.length
    ? enclosures.reduce((total, enclosure) => total + Math.min(Number(enclosure.sickCount || 0), Number(enclosure.occupied || 0)), 0)
    : farmAnimals.filter((animal) => ['sick', 'treatment', 'quarantine'].includes(animal.health)).length
  const productionToday = production.filter((record) => record.date === todayKey).reduce((totals, record) => {
    if (record.type === 'milk') totals.milk += Number(record.quantity || 0)
    if (record.type === 'egg' || record.type === 'eggs') totals.eggs += Number(record.quantity || 0)
    return totals
  }, { milk: 0, eggs: 0 })
  const revenue = sum(sales, 'total')
  const expenseTotal = sum(expenses, 'amount') + sum(utilities, 'amount')
  const birthRows = production.filter((record) => record.type === 'birth' && inRange(record.date, dateKey(getRangeStart('30d', today)), todayKey))
  const deathRows = production.filter((record) => record.type === 'death' && inRange(record.date, dateKey(getRangeStart('30d', today)), todayKey))

  return {
    data: {
      kpis: {
        totalAnimals,
        totalCapacity,
        utilizationRate: totalCapacity > 0 ? Math.round((occupied / totalCapacity) * 100) : null,
        male: individualAnimals ? farmAnimals.filter((animal) => animal.gender === 'male').length : null,
        female: individualAnimals ? farmAnimals.filter((animal) => animal.gender === 'female').length : null,
        sick,
        births30d: sum(birthRows, 'quantity'),
        deaths30d: sum(deathRows, 'quantity'),
        productionToday,
        expenses30d: expenseTotal,
        revenue30d: revenue,
        netProfit: revenue - expenseTotal,
        activeWorkers: workers.filter((w) => w.status === 'active').length,
        totalWorkers: workers.length,
        lowStockCount,
      },
      incomeVsExpense: buildCashFlow(sales, expenses, utilities, from, today),
      healthBreakdown: buildHealthBreakdown(enclosures, farmAnimals),
      productionTrend: buildProductionTrend(production),
      enclosures: enclosures.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        species: e.species,
        occupied: Number(e.occupied || 0),
        capacity: Number(e.capacity || 0),
        health: e.health,
        sickCount: Number(e.sickCount || 0),
      })),
      branchCount: read('db').branches?.filter((branch) => branch.farmId === farmId && branch.status !== 'archived').length || 0,
    },
    error: null,
  }
}

function activityFor(row, type, title) {
  return { id: row.id, type, title, date: row.date || row.billingPeriod, time: row.date || row.billingPeriod || '' }
}

export async function getRecentActivity({ farmId, branchId, limit = 6 }) {
  await delay()
  const events = [
    ...scoped(read('sales'), farmId, branchId).map((row) => activityFor(row, 'sale', `Sale recorded · ${row.buyer || row.itemType} · ৳${Number(row.total || 0).toLocaleString()}`)),
    ...scoped(read('expenses'), farmId, branchId).map((row) => activityFor(row, 'expense', `${row.title} · ৳${Number(row.amount || 0).toLocaleString()}`)),
    ...scoped(read('production'), farmId, branchId).map((row) => activityFor(row, 'production', `${row.type} recorded · ${Number(row.quantity || 0).toLocaleString()} ${row.unit || ''}`.trim())),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return { data: events.slice(0, limit), error: null }
}

export async function getAlerts({ farmId, branchId }) {
  await delay()
  const [enclosureResult] = await Promise.all([listEnclosures({ farmId, branchId })])
  const enclosures = enclosureResult.data || []
  const sick = enclosures.reduce((total, enclosure) => total + Math.min(Number(enclosure.sickCount || 0), Number(enclosure.occupied || 0)), 0)
  const inventory = scoped(read('inventory_items'), farmId, branchId)
  const lowStock = inventory.filter((item) => Number(item.quantity || 0) <= Number(item.minimumThreshold || 0))
  const alerts = []
  if (sick > 0) alerts.push({ id: 'sick-count', severity: 'high', title: `${sick.toLocaleString()} animals or stock affected`, detail: 'Review health counts by habitat and update after checks.' })
  enclosures.filter((enclosure) => enclosure.health && enclosure.health !== 'healthy').forEach((enclosure) => {
    alerts.push({ id: `habitat-${enclosure.id}`, severity: enclosure.health === 'treatment' || enclosure.health === 'quarantine' ? 'high' : 'medium', title: `${enclosure.name} · ${enclosure.health}`, detail: `${Number(enclosure.sickCount || 0).toLocaleString()} affected of ${Number(enclosure.occupied || 0).toLocaleString()} occupied.` })
  })
  lowStock.forEach((item) => alerts.push({ id: `stock-${item.id}`, severity: 'medium', title: `Low stock · ${item.name}`, detail: `${item.quantity} ${item.unit || ''} remaining.` }))
  return { data: alerts.slice(0, 8), error: null }
}