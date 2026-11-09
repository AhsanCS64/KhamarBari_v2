import { apiFetch } from '@/lib/api'
import { createResource, listResource, updateResource } from './apiResource'

const PATH = '/branches'

export async function listBranches() {
  return listResource(PATH, 'branches', { status: 'active' })
}

export async function createBranch(_farmId, payload) {
  return createResource(PATH, 'branch', payload)
}

export async function updateBranch(id, patch) {
  return updateResource(PATH, 'branch', id, patch)
}

export async function archiveBranch(id) {
  try {
    const result = await apiFetch(`${PATH}/${id}`, { method: 'DELETE' })
    return { data: result.branch || result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
