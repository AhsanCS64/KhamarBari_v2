import { useEffect as useRouteEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import PublicNavbar from './PublicNavbar'
import PublicFooter from './PublicFooter'

export default function PublicLayout() {
  const location = useLocation()
  useRouteEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' })
    else requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView())
  }, [location.pathname, location.hash])
  const reducedMotion = useReducedMotion()

  return (
    <div className="min-h-dvh flex flex-col bg-cream">
      <PublicNavbar />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <motion.main
        id="main-content" tabIndex={-1}
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