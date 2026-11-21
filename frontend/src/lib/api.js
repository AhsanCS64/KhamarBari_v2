import { useAuthStore } from '@/store/authStore'

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')
).replace(/\/+$/, '')

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
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  let response
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })
  } catch (netErr) {
    console.error(`[API] Failed to fetch from ${url}:`, netErr)
    throw new Error(
      `Unable to connect to server at ${url}. ${
        url.includes('localhost')
          ? 'Production build is pointing to localhost. Please set VITE_API_URL in your Vercel Environment Variables.'
          : 'Please check your backend deployment or internet connection.'
      }`
    )
  }

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
