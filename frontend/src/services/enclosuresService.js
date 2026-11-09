import { createResource, deleteResource, listResource, updateResource } from './apiResource'

const PATH = '/enclosures'

export async function listEnclosures(filters = {}) {
  return listResource(PATH, 'enclosures', filters)
}

export async function createEnclosure(payload) {
  return createResource(PATH, 'enclosure', payload)
}

export async function updateEnclosure(id, patch) {
  return updateResource(PATH, 'enclosure', id, patch)
}

export async function deleteEnclosure(id) {
  return deleteResource(PATH, id)
}
