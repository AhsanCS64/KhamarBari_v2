import { apiFetch } from '@/lib/api'
import { createResource, deleteResource, listResource, updateResource } from './apiResource'

const PATH = '/workers'

export async function listWorkers(filters = {}) {
  return listResource(PATH, 'workers', filters)
}

export async function createWorker(payload) {
  return createResource(PATH, 'worker', payload)
}

export async function updateWorker(id, patch) {
  return updateResource(PATH, 'worker', id, patch)
}

export async function deleteWorker(id) {
  return deleteResource(PATH, id)
}

async function submit(path, key, payload) {
  try {
    const result = await apiFetch(path, { method: 'POST', body: JSON.stringify(payload) })
    return { data: result?.[key] ?? result, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export function markAttendance(payload) {
  return submit(`${PATH}/attendance`, 'attendance', payload)
}

export function listAttendance(filters = {}) {
  return listResource(`${PATH}/attendance`, 'attendance', filters)
}

export function recordPayment(payload) {
  return submit(`${PATH}/payments`, 'payment', payload)
}

export function listPayments(filters = {}) {
  return listResource(`${PATH}/payments`, 'payments', filters)
}

export function deletePayment(id) {
  return deleteResource(`${PATH}/payments`, id)
}

export async function getWorkersTotals(filters = {}) {
  const [workerResult, paymentResult] = await Promise.all([
    listWorkers(filters),
    listPayments({ ...(filters.branchId && filters.branchId !== 'all' ? { branchId: filters.branchId } : {}), month: new Date().toISOString().slice(0, 7) }),
  ])
  const workers = workerResult.data
  const payments = paymentResult.data
  const active = workers.filter((worker) => worker.status === 'active')
  const onLeave = workers.filter((worker) => worker.status === 'on_leave')
  const paidThisMonth = payments.filter((payment) => payment.type === 'salary').reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const advances = payments.filter((payment) => payment.type === 'advance').reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  return {
    data: {
      total: workers.length,
      active: active.length,
      onLeave: onLeave.length,
      totalSalary: active.reduce((sum, worker) => sum + Number(worker.salary || 0), 0),
      paidThisMonth,
      salaryDue: Math.max(0, active.reduce((sum, worker) => sum + Number(worker.salary || 0), 0) - paidThisMonth),
      advances,
    },
    error: workerResult.error || paymentResult.error,
  }
}
