import { apiFetch } from '@/lib/api'
import { storage } from './storage'

const SESSION_KEY = 'session'

export async function registerFarm(payload) {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        farmName: payload.farmName,
        license: payload.license,
        division: payload.division,
        district: payload.district,
        zilla: payload.zilla,
        upazila: payload.upazila,
        address: payload.address,
        ownerName: payload.ownerName,
        nid: payload.nid,
        email: payload.email,
        contact: payload.contact,
        password: payload.password,
        logo: payload.logo,
      }),
    })
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function login({ contact, password }) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ contact, password }),
    })
    
    // Decode the JWT to get the expiration time
    const rawPayload = data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payloadBase64 = rawPayload.padEnd(rawPayload.length + ((4 - (rawPayload.length % 4)) % 4), '=')
    const decodedPayload = JSON.parse(atob(payloadBase64))
    
    storage.set(SESSION_KEY, { 
      token: data.token, 
      user: data.user, 
      farm: data.farm,
      expiresAt: decodedPayload.exp * 1000 // Convert seconds to milliseconds
    })
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function logout() {
  storage.remove(SESSION_KEY)
  return { data: true, error: null }
}

export async function getSession() {
  const session = storage.get(SESSION_KEY)
  
  // 1. No session or token? Boot them out.
  if (!session || !session.token) return { data: null, error: null }

  // 2. Check if the token is EXPIRED locally (this is instantaneous)
  if (session.expiresAt && Date.now() > session.expiresAt) {
    storage.remove(SESSION_KEY)
    return { data: null, error: null }
  }

  try {
    const freshData = await apiFetch('/auth/me', {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    const validatedSession = {
      ...session,
      user: freshData.user,
      farm: freshData.farm,
    }
    storage.set(SESSION_KEY, validatedSession)
    return { data: validatedSession, error: null }
  } catch (error) {
    storage.remove(SESSION_KEY)
    return { data: null, error: error.message }
  }
}

export async function updateProfile(patch) {
  try {
    const result = await apiFetch('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return { data: result.user, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function requestPasswordReset() {
  return { data: null, error: 'Password reset is not configured. Contact your farm administrator.' }
}