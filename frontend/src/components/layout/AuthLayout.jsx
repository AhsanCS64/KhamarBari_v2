import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AmbientFarm from '@/components/animations/AmbientFarm'
import './AuthLayout.css'

export default function AuthLayout({ children, title, subtitle, side = 'illustration' }) {
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()

  return (
    <div className="auth-layout min-h-dvh grid lg:grid-cols-[1.04fr_0.96fr]">
      <div className="auth-visual relative hidden flex-col justify-between overflow-hidden p-8 text-white sm:p-10 lg:flex xl:p-14">
        <AmbientFarm />
        <motion.div
          aria-hidden="true"
          className="auth-sun-mark pointer-events-none absolute right-10 top-20 text-[#f3d16f]/75"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
        >
          <Sun className="h-28 w-28" strokeWidth={0.75} />
        </motion.div>
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/35 bg-white/15 shadow-lg backdrop-blur-md">
            <img src="/sprout.svg" alt="" className="h-8 w-8 brightness-0 invert" />
          </span>
          <span className="text-xl font-bold tracking-wide">KhamarBari</span>
        </Link>

        <div className="auth-visual-copy relative z-10 max-w-xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f4d781]/35 bg-[#f4d781]/10 px-3 py-1.5 text-xs font-semibold text-[#ffedb4] backdrop-blur-sm">
            <Sun className="h-3.5 w-3.5" /> A brighter day on the farm
          </span>
          <h2 className="max-w-lg text-4xl font-semibold leading-[1.08] xl:text-5xl">
            {side === 'illustration'
              ? 'Grow with numbers you can trust.'
              : 'Welcome to your farm, digitised.'}
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-white/80">
            Animals, expenses, production and workers — one clean dashboard for every branch.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/65">
          © {new Date().getFullYear()} KhamarBari. Built in Bangladesh.
        </p>
      </div>

      <div className="auth-form-side flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="auth-form-shell w-full max-w-lg">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sunshine-soft shadow-sm">
                <img src="/sprout.svg" alt="" className="h-7 w-7" />
              </span>
              <span className="text-lg font-bold text-forest-900">KhamarBari</span>
            </Link>
          </div>

          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">{t('brand.tagline')}</p>
            <h1 className="text-3xl font-bold text-forest-900 sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm leading-6 text-forest-700/75">{subtitle}</p>}
          </motion.div>

          <div className="auth-form-card rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_55px_rgba(47,76,38,0.12)] backdrop-blur-xl sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}