import { storage } from './storage'
import { uid } from './mockDb'

const WORKERS_KEY = 'workers'
const ATTENDANCE_KEY = 'attendance'
const PAYMENTS_KEY = 'worker_payments'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

const readWorkers = () => storage.get(WORKERS_KEY, [])
const writeWorkers = (rows) => storage.set(WORKERS_KEY, rows)
const readAttendance = () => storage.get(ATTENDANCE_KEY, [])
const writeAttendance = (rows) => storage.set(ATTENDANCE_KEY, rows)
const readPayments = () => storage.get(PAYMENTS_KEY, [])
const writePayments = (rows) => storage.set(PAYMENTS_KEY, rows)

export async function listWorkers({ farmId, branchId, search, role, status } = {}) {
  await delay()
  let rows = readWorkers().filter((w) => w.farmId === farmId)
  if (branchId && branchId !== 'all') rows = rows.filter((w) => w.branchId === branchId)
  if (role && role !== 'all') rows = rows.filter((w) => w.role === role)
  if (status && status !== 'all') rows = rows.filter((w) => w.status === status)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.contact?.toLowerCase().includes(q) ||
        w.address?.toLowerCase().includes(q)
    )
  }
  rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  return { data: rows, error: null }
}

export async function createWorker(payload) {
  await delay()
  const row = {
    id: uid('worker'),
    farmId: payload.farmId,
    branchId: payload.branchId || null,
    name: payload.name,
    contact: payload.contact,
    nid: payload.nid || '',
    address: payload.address || '',
    role: payload.role,
    joiningDate: payload.joiningDate,
    salary: Number(payload.salary || 0),
    status: payload.status || 'active',
    notes: payload.notes || '',
    photo: payload.photo || null,
    createdAt: new Date().toISOString(),
  }
  const rows = readWorkers()
  rows.push(row)
  writeWorkers(rows)
  return { data: row, error: null }
}

export async function updateWorker(id, patch) {
  await delay()
  const rows = readWorkers()
  const i = rows.findIndex((r) => r.id === id)
  if (i < 0) return { data: null, error: 'Worker not found' }
  rows[i] = {
    ...rows[i],
    ...patch,
    salary: patch.salary !== undefined ? Number(patch.salary) : rows[i].salary,
  }
  writeWorkers(rows)
  return { data: rows[i], error: null }
}

export async function deleteWorker(id) {
  await delay()
  writeWorkers(readWorkers().filter((r) => r.id !== id))
  writeAttendance(readAttendance().filter((a) => a.workerId !== id))
  writePayments(readPayments().filter((p) => p.workerId !== id))
  return { data: true, error: null }
}

// ---- Attendance ----
export async function markAttendance(payload) {
  await delay()
  const rows = readAttendance()
  const existing = rows.findIndex(
    (a) => a.workerId === payload.workerId && a.date === payload.date
  )
  const row = {
    id: existing >= 0 ? rows[existing].id : uid('att'),
    farmId: payload.farmId,
    workerId: payload.workerId,
    date: payload.date,
    status: payload.status,
    notes: payload.notes || '',
    createdAt: existing >= 0 ? rows[existing].createdAt : new Date().toISOString(),
  }
  if (existing >= 0) rows[existing] = row
  else rows.push(row)
  writeAttendance(rows)
  return { data: row, error: null }
}

export async function listAttendance({ workerId, dateFrom, dateTo } = {}) {
  await delay()
  let rows = readAttendance()
  if (workerId) rows = rows.filter((a) => a.workerId === workerId)
  if (dateFrom) rows = rows.filter((a) => a.date >= dateFrom)
  if (dateTo) rows = rows.filter((a) => a.date <= dateTo)
  rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { data: rows, error: null }
}

// ---- Payments ----
export async function recordPayment(payload) {
  await delay()
  const row = {
    id: uid('pay'),
    farmId: payload.farmId,
    workerId: payload.workerId,
    type: payload.type,
    amount: Number(payload.amount),
    date: payload.date,
    month: payload.month || null,
    method: payload.method || 'cash',
    notes: payload.notes || '',
    createdAt: new Date().toISOString(),
  }
  const rows = readPayments()
  rows.push(row)
  writePayments(rows)
  return { data: row, error: null }
}

export async function listPayments({ workerId, month } = {}) {
  await delay()
  let rows = readPayments()
  if (workerId) rows = rows.filter((p) => p.workerId === workerId)
  if (month) rows = rows.filter((p) => p.month === month)
  rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  return { data: rows, error: null }
}

export async function deletePayment(id) {
  await delay()
  writePayments(readPayments().filter((p) => p.id !== id))
  return { data: true, error: null }
}

// ---- Aggregates ----
export async function getWorkersTotals({ farmId, branchId } = {}) {
  const { data } = await listWorkers({ farmId, branchId })
  const active = data.filter((w) => w.status === 'active')
  const onLeave = data.filter((w) => w.status === 'on_leave')
  const totalSalary = active.reduce((s, w) => s + w.salary, 0)

  const month = new Date().toISOString().slice(0, 7)
  const payments = (await listPayments({ month })).data
  const paidThisMonth = payments.filter((p) => p.type === 'salary').reduce((s, p) => s + p.amount, 0)
  const advances = payments.filter((p) => p.type === 'advance').reduce((s, p) => s + p.amount, 0)

  return {
    data: {
      total: data.length,
      active: active.length,
      onLeave: onLeave.length,
      totalSalary,
      paidThisMonth,
      salaryDue: Math.max(0, totalSalary - paidThisMonth),
      advances,
    },
    error: null,
  }
}