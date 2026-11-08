import { loadDb, saveDb, uid } from './mockDb'
import { useAuthStore } from '@/store/authStore'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export async function listBranches(farmId) {
  await delay()
  const db = loadDb()
  const user = useAuthStore.getState().user
  let branches = db.branches.filter((branch) => branch.farmId === farmId && branch.status !== 'archived')
  if (user?.role === 'manager' && user.branchId) {
    branches = branches.filter((branch) => branch.id === user.branchId)
  }
  return { data: branches, error: null }
}

export async function createBranch(farmId, payload) {
  await delay()
  const db = loadDb()
  const branch = {
    id: uid('branch'),
    farmId,
    name: payload.name,
    location: payload.location,
    managerName: payload.managerName,
    managerContact: payload.managerContact,
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  db.branches.push(branch)
  saveDb(db)
  return { data: branch, error: null }
}

export async function updateBranch(id, patch) {
  await delay()
  const db = loadDb()
  const i = db.branches.findIndex((b) => b.id === id)
  if (i < 0) return { data: null, error: 'Branch not found' }
  db.branches[i] = { ...db.branches[i], ...patch }
  saveDb(db)
  return { data: db.branches[i], error: null }
}

export async function archiveBranch(id) {
  await delay()
  const db = loadDb()
  const i = db.branches.findIndex((b) => b.id === id)
  if (i < 0) return { data: null, error: 'Branch not found' }
  db.branches[i].status = 'archived'
  saveDb(db)
  return { data: db.branches[i], error: null }
}