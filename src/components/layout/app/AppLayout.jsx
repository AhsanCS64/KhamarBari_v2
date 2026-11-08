import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import SproutLoader from '@/components/common/SproutLoader'
import AppSidebar from './AppSidebar'
import AppTopbar from './AppTopbar'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'

export default function AppLayout() {
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  const user = useAuthStore((state) => state.user)
  const selectedBranchId = useAppStore((state) => state.selectedBranchId)
  const setBranch = useAppStore((state) => state.setBranch)
  const assignedBranchId = user?.role === 'manager' ? user.branchId : null

  useEffect(() => {
    if (assignedBranchId && selectedBranchId !== assignedBranchId) setBranch(assignedBranchId)
  }, [assignedBranchId, selectedBranchId, setBranch])

  const branchScopeReady = !assignedBranchId || selectedBranchId === assignedBranchId

  return (
    <div className="sunlit-workspace min-h-dvh flex">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <AppTopbar />
        <motion.main
          key={location.pathname}
          className="flex-1 min-w-0"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {branchScopeReady ? <Outlet /> : <div className="flex min-h-[55vh] items-center justify-center"><SproutLoader label="Loading branch…" /></div>}
        </motion.main>
      </div>
    </div>
  )
}