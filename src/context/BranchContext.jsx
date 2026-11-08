import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { listBranches } from '../services/branchService'

const BranchContext = createContext(null)

export function BranchProvider({ farmId, children }) {
  const [branches, setBranches] = useState([])
  const [activeBranchId, setActiveBranchId] = useState(() => {
    return localStorage.getItem('activeBranchId') || null
  })
  const [loading, setLoading] = useState(true)

  // Load branches for the farm
  useEffect(() => {
    let cancelled = false
    if (!farmId) return
    setLoading(true)
    listBranches(farmId).then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('[BranchContext]', error)
      const list = data ?? []
      setBranches(list)
      // Restore or default to first branch
      setActiveBranchId((prev) => {
        const stillValid = prev && list.some((b) => b.id === prev)
        return stillValid ? prev : list[0]?.id ?? null
      })
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [farmId])

  // Persist selection
  useEffect(() => {
    if (activeBranchId) localStorage.setItem('activeBranchId', activeBranchId)
  }, [activeBranchId])

  const activeBranch = useMemo(
    () => branches.find((b) => b.id === activeBranchId) ?? null,
    [branches, activeBranchId],
  )

  const value = useMemo(
    () => ({
      branches,
      activeBranch,
      activeBranchId,
      setActiveBranchId,
      loading,
    }),
    [branches, activeBranch, activeBranchId, loading],
  )

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used inside <BranchProvider>')
  return ctx
}