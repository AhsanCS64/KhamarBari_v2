import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import LanguageToggle from '@/components/common/LanguageToggle'
import { cn } from '@/lib/utils'

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl border border-fresh-200/70 bg-fresh-50 shadow-[0_5px_16px_rgba(22,85,62,0.08)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <img src="/sprout.svg" alt="" className="h-7 w-7" />
      </span>
      <span className="text-[17px] font-bold text-forest-900">KhamarBari</span>
    </Link>
  )
}

export default function PublicNavbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  const activeTransition = reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }

  const links = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-40 w-full px-3 pt-3">
      <div className="mx-auto flex h-[4.25rem] max-w-[1320px] items-center justify-between rounded-2xl border border-white/80 bg-[#fafff7]/90 px-3 shadow-[0_10px_36px_rgba(15,61,46,0.09)] backdrop-blur-2xl sm:px-5">
        <Logo />

        <nav className="hidden items-center gap-1 rounded-xl border border-forest-100/70 bg-forest-50/60 p-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'relative isolate rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200',
                  isActive ? 'text-forest-900' : 'text-forest-700/80 hover:text-forest-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="public-nav-active"
                      className="absolute inset-0 z-0 rounded-lg bg-white shadow-[0_2px_8px_rgba(15,61,46,0.08)] ring-1 ring-forest-100/80"
                      transition={activeTransition}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <Button size="sm" className="rounded-xl shadow-[0_5px_16px_rgba(15,61,46,0.16)] transition-transform duration-200 hover:-translate-y-0.5" asChild>
            <Link to="/signup">{t('nav.signup')}</Link>
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-forest-100 bg-white text-forest-800 shadow-sm transition-colors hover:bg-forest-50 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="public-mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="public-mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-2 max-w-[1320px] overflow-hidden rounded-2xl border border-forest-100/80 bg-[#fafff7] shadow-[0_18px_40px_rgba(15,61,46,0.14)] md:hidden"
          >
            <div className="flex flex-col gap-1 p-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors',
                    isActive ? 'bg-forest-50 text-forest-900' : 'text-forest-700 hover:bg-forest-50'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-forest-100/80 px-1 pt-3">
              <LanguageToggle />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild onClick={() => setOpen(false)}>
                  <Link to="/login">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild onClick={() => setOpen(false)}>
                  <Link to="/signup">{t('nav.signup')}</Link>
                </Button>
              </div>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}