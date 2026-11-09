import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PublicNavbar from './PublicNavbar'
import PublicFooter from './PublicFooter'

export default function PublicLayout() {
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  return (
    <div className="min-h-dvh flex flex-col bg-cream">
      <PublicNavbar />
      <motion.main
        key={location.pathname}
        className="flex-1"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.main>
      <PublicFooter />
    </div>
  )
}