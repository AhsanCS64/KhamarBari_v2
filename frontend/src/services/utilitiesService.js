import { createResource, deleteResource, listResource, updateResource } from './apiResource'

const PATH = '/utilities'

export async function listUtilities(filters = {}) {
  return listResource(PATH, 'utilities', filters)
}

export async function createUtility(payload) {
  return createResource(PATH, 'utility', payload)
}

export async function updateUtility(id, patch) {
  return updateResource(PATH, 'utility', id, patch)
}

export async function deleteUtility(id) {
  return deleteResource(PATH, id)
}

export async function getUtilitiesTotals(filters = {}) {
  const { data, error } = await listUtilities(filters)
  const unpaid = data.filter((utility) => utility.status !== 'paid')
  const byType = {}
  data.forEach((utility) => {
    if (!byType[utility.type]) byType[utility.type] = { amount: 0, count: 0 }
    byType[utility.type].amount += Number(utility.amount || 0)
    byType[utility.type].count += 1
  })
  return {
    data: {
      totalBills: data.length,
      totalAmount: data.reduce((sum, utility) => sum + Number(utility.amount || 0), 0),
      unpaidCount: unpaid.length,
      unpaidAmount: unpaid.reduce((sum, utility) => sum + Number(utility.amount || 0), 0),
      byType,
    },
    error,
  }
}
