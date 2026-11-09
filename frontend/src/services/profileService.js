import { apiFetch } from '@/lib/api'

export async function updateFarm(_farmId, patch) {
  try {
    const result = await apiFetch('/farms/current', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return { data: result.farm, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function changePassword(_userId, { currentPassword, newPassword }) {
  try {
    await apiFetch('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    return { data: true, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function resetAllData() {
  return { data: null, error: 'Deleting all farm data is not supported.' }
}
