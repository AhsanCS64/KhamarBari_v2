import { createResource, deleteResource, listResource, updateResource } from './apiResource'

const PATH = '/animals'

export async function listAnimals(filters = {}) {
  return listResource(PATH, 'animals', filters)
}

export async function createAnimal(payload) {
  return createResource(PATH, 'animal', payload)
}

export async function updateAnimal(id, patch) {
  return updateResource(PATH, 'animal', id, patch)
}

export async function deleteAnimal(id) {
  return deleteResource(PATH, id)
}
