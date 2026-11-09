import { useAuthStore } from '@/store/authStore'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')

function normalizeIds(value) {
  if (Array.isArray(value)) return value.map(normalizeIds)
  if (!value || typeof value !== 'object') return value

  const normalized = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, normalizeIds(item)])
  )
  if (normalized._id && !normalized.id) normalized.id = normalized._id
  return normalized
}

export async function apiFetch(endpoint, options = {}) {
  const token = useAuthStore.getState().token
  const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
    ...options,
    headers: {
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text }
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`)
  }

  return normalizeIds(data)
}

export function queryString(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.set(key, String(value))
    }
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}
