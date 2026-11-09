import { apiFetch, queryString } from '@/lib/api'

function cleanPayload(payload) {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [
    key,
    value === '' && ['branchId', 'animalId', 'enclosureId'].includes(key) ? null : value,
  ]))
}

function filterRows(rows, filters = {}) {
  let result = rows
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '' || value === 'all' || key === 'farmId') continue
    if (key === 'dateFrom' || key === 'dateTo') {
      result = result.filter((row) => {
        const date = row.date || row.billingPeriod
        if (!date) return true
        const compareValue = row.date ? value : value.slice(0, 7)
        const rowValue = row.date ? String(date).slice(0, 10) : String(date).slice(0, 7)
        return key === 'dateFrom' ? rowValue >= compareValue : rowValue <= compareValue
      })
      continue
    }
    if (key === 'search') {
      const needle = String(value).toLocaleLowerCase()
      result = result.filter((row) => Object.values(row).some((item) =>
        typeof item === 'string' && item.toLocaleLowerCase().includes(needle)
      ))
      continue
    }
    if (key === 'stockStatus') {
      result = result.filter((item) => {
        const quantity = Number(item.quantity || 0)
        const threshold = Number(item.minimumThreshold || 0)
        const days = item.expiryDate ? Math.floor((new Date(item.expiryDate) - new Date()) / 86400000) : null
        if (value === 'low') return quantity <= threshold && quantity > 0
        if (value === 'expiring') return days !== null && days >= 0 && days <= 30
        if (value === 'expired') return days !== null && days < 0
        if (value === 'ok') return quantity > threshold
        return true
      })
      continue
    }
    if (key === 'month') {
      result = result.filter((row) => row.month === value || row.billingPeriod === value)
      continue
    }
    if (key === 'type' && result.some((row) => row.type !== undefined)) {
      result = result.filter((row) => row.type === value)
      continue
    }
    if (key === 'branchId' || key === 'category' || key === 'status' || key === 'itemType' || key === 'paymentStatus' || key === 'role' || key === 'enclosureId') {
      result = result.filter((row) => String(row[key] ?? '') === String(value))
    }
  }
  return result
}

export async function listResource(path, key, filters) {
  try {
    const result = await apiFetch(`${path}${queryString(filters)}`)
    return { data: filterRows(result?.[key] || [], filters), error: null }
  } catch (error) {
    return { data: [], error: error.message }
  }
}

export async function createResource(path, key, payload) {
  try {
    const result = await apiFetch(path, {
      method: 'POST',
      body: JSON.stringify(cleanPayload(payload)),
    })
    return { data: result?.[key] ?? result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function updateResource(path, key, id, patch) {
  try {
    const result = await apiFetch(`${path}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(cleanPayload(patch)),
    })
    return { data: result?.[key] ?? result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function deleteResource(path, id) {
  try {
    await apiFetch(`${path}/${id}`, { method: 'DELETE' })
    return { data: true, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
