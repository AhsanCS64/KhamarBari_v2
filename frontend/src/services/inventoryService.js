import { apiFetch } from '@/lib/api'
import { createResource, deleteResource, listResource, updateResource } from './apiResource'

const PATH = '/inventory'

export async function listItems(filters = {}) {
  return listResource(PATH, 'inventory', filters)
}

export async function createItem(payload) {
  return createResource(PATH, 'inventory', payload)
}

export async function updateItem(id, patch) {
  return updateResource(PATH, 'inventory', id, patch)
}

export async function deleteItem(id) {
  return deleteResource(PATH, id)
}

export async function recordMovement(payload) {
  try {
    const result = await apiFetch(`${PATH}/movements`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function listMovements(filters = {}) {
  return listResource(`${PATH}/movements`, 'movements', filters)
}

export async function getInventoryTotals(filters = {}) {
  const { data, error } = await listItems(filters)
  const now = new Date()
  let totalValue = 0
  let lowStock = 0
  let expiring = 0
  let expired = 0
  data.forEach((item) => {
    totalValue += Number(item.quantity || 0) * Number(item.unitPrice || 0)
    if (Number(item.quantity) <= Number(item.minimumThreshold) && Number(item.quantity) > 0) lowStock += 1
    if (item.expiryDate) {
      const days = Math.floor((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24))
      if (days < 0) expired += 1
      else if (days <= 30) expiring += 1
    }
  })
  return { data: { totalItems: data.length, totalValue, lowStock, expiring, expired }, error }
}
