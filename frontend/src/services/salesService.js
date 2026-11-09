import { createResource, deleteResource, listResource, updateResource } from './apiResource'
import { listEnclosures } from './enclosuresService'
import { listProduction } from './productionService'

const PATH = '/sales'

export async function listSales(filters = {}) {
  return listResource(PATH, 'sales', filters)
}

export async function createSale(payload) {
  return createResource(PATH, 'sale', payload)
}

export async function updateSale(id, patch) {
  return updateResource(PATH, 'sale', id, patch)
}

export async function deleteSale(id) {
  return deleteResource(PATH, id)
}

export async function getSalesTotals(filters = {}) {
  const { data, error } = await listSales(filters)
  const revenue = data.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
  const collected = data.reduce((sum, sale) => sum + Number(sale.paidAmount || 0), 0)
  const outstanding = data.reduce((sum, sale) => sum + Number(sale.outstanding || 0), 0)
  return { data: { revenue, collected, outstanding, count: data.length }, error }
}

export async function getProductionStock(filters = {}) {
  const [productionResult, salesResult, enclosureResult] = await Promise.all([
    listProduction(filters),
    listSales(filters),
    listEnclosures(filters),
  ])
  const error = productionResult.error || salesResult.error || enclosureResult.error
  if (error) return { data: {}, enclosures: [], error }

  const productionTypes = { milk: 'milk', egg: 'egg', harvest: 'harvest', beef: 'beef', mutton: 'mutton', chicken_meat: 'chicken_meat', fish: 'fish', meat: 'meat' }
  const units = { milk: 'L', egg: 'pcs', harvest: 'kg' }
  const stock = {}
  for (const saleType of Object.keys(productionTypes)) {
    const produced = productionResult.data.reduce((sum, record) => {
      if (saleType === 'milk' || saleType === 'egg') {
        return sum + (record.type === saleType ? Number(record.quantity || 0) : 0)
      }
      if (record.type === 'slaughter' && record.meatType === saleType) {
        return sum + Number(record.meatYieldKg || 0)
      }
      if (record.type === 'harvest' && record.meatType === saleType) {
        return sum + Number(record.quantity || 0)
      }
      if (saleType === 'harvest' && record.type === 'harvest' && !record.meatType) {
        return sum + Number(record.quantity || 0)
      }
      return sum
    }, 0)
    const sold = salesResult.data
      .filter((sale) => sale.itemType === saleType)
      .reduce((sum, sale) => sum + Number(sale.quantity || 0), 0)
    stock[saleType] = { produced, sold, available: Math.max(0, produced - sold), unit: units[saleType] || (saleType === 'egg' ? 'pcs' : 'kg') }
  }
  return { data: stock, enclosures: enclosureResult.data, error: null }
}
