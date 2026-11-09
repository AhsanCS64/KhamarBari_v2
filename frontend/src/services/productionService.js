import { createResource, deleteResource, listResource, updateResource } from './apiResource'

const PATH = '/production'

export async function listProduction(filters = {}) {
  return listResource(PATH, 'production', filters)
}

export async function createProduction(payload) {
  return createResource(PATH, 'production', payload)
}

export async function updateProduction(id, patch) {
  return updateResource(PATH, 'production', id, patch)
}

export async function deleteProduction(id) {
  return deleteResource(PATH, id)
}

export async function getProductionTotals(filters = {}) {
  const { data, error } = await listProduction(filters)
  const byType = {}
  data.forEach((record) => {
    if (!byType[record.type]) byType[record.type] = { quantity: 0, unit: record.unit, count: 0 }
    byType[record.type].quantity += Number(record.quantity || 0)
    byType[record.type].count += 1
  })
  return { data: { byType, count: data.length }, error }
}

export async function getProductionTrend(options = {}) {
  const { type = 'milk', days = 14, ...filters } = options
  const { data, error } = await listProduction({ ...filters, type })
  const trend = new Map()
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    const key = date.toISOString().slice(0, 10)
    trend.set(key, { date: key.slice(5), quantity: 0 })
  }
  data.forEach((record) => {
    const day = trend.get(String(record.date).slice(0, 10))
    if (day) day.quantity += Number(record.quantity || 0)
  })
  return { data: [...trend.values()], error }
}
