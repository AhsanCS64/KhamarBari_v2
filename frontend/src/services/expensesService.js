import { createResource, deleteResource, listResource, updateResource } from './apiResource'

const PATH = '/expenses'

export async function listExpenses(filters = {}) {
  return listResource(PATH, 'expenses', filters)
}

export async function createExpense(payload) {
  return createResource(PATH, 'expense', payload)
}

export async function updateExpense(id, patch) {
  return updateResource(PATH, 'expense', id, patch)
}

export async function deleteExpense(id) {
  return deleteResource(PATH, id)
}

export async function getExpenseTotals(filters = {}) {
  const { data, error } = await listExpenses(filters)
  const total = data.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  const byCategory = data.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount || 0)
    return totals
  }, {})
  return { data: { total, count: data.length, byCategory }, error }
}
