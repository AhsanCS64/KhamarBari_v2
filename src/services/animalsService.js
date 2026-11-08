import { loadDb } from './mockDb'

export async function listAnimals({ farmId, branchId, enclosureId } = {}) {
  const animals = loadDb().animals || []
  const data = animals.filter((animal) => {
    if (farmId && animal.farmId !== farmId) return false
    if (branchId && branchId !== 'all' && animal.branchId !== branchId) return false
    if (enclosureId && animal.enclosureId !== enclosureId) return false
    return true
  })
  return { data, error: null }
}