import { Link } from 'react-router-dom'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Sun, Sparkles, Leaf, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import AmbientFarm from '@/components/animations/AmbientFarm'
import LanguageToggle from '@/components/common/LanguageToggle'
import './AuthLayout.css'

// Rotating trust badges — feel alive without distracting
const TRUST_ROTATION = [
  { icon: Leaf, text: 'auth.layout.trustData' },
  { icon: ShieldCheck, text: 'auth.layout.trustSecure' },
  { icon: Sparkles, text: 'auth.layout.trustBranches' },
]

// Small floating specks for the visual side
const FLOATING_SPECKS = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  left: `${10 + ((i * 37) % 80)}%`,
  top: `${12 + ((i * 53) % 70)}%`,
  size: 2 + (i % 3),
  delay: i * 0.7,
  duration: 6 + (i % 4) * 2,
}))

export default function AuthLayout({ children, title, subtitle, side = 'illustration' }) {
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()
  const [trustIndex, setTrustIndex] = useState(0)

  // Rotate trust badge every ~3.6s
  useEffect(() => {
    const id = setInterval(() => {
      setTrustIndex((i) => (i + 1) % TRUST_ROTATION.length)
    }, 3600)
    return () => clearInterval(id)
  }, [])

  const TrustIcon = TRUST_ROTATION[trustIndex].icon

  return (
    <div className="auth-layout min-h-dvh grid lg:grid-cols-[1.04fr_0.96fr]">
      {/* ═══════════════════════════════════════════════════════════
          LEFT — Living visual side
         ═══════════════════════════════════════════════════════════ */}
      <div className="auth-visual relative hidden flex-col justify-between overflow-hidden p-8 text-white sm:p-10 lg:flex xl:p-14">
        {/* Ambient animated landscape (unchanged) */}
        <AmbientFarm />

        {/* Layered atmosphere overlays */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'radial-gradient(ellipse at 15% 20%, rgba(243,209,111,0.16), transparent 55%),' +
              'radial-gradient(ellipse at 85% 80%, rgba(16,185,129,0.18), transparent 55%),' +
              'linear-gradient(180deg, rgba(6,46,32,0.15) 0%, transparent 35%, rgba(4,30,22,0.35) 100%)',
          }}
        />

        {/* Slowly rotating sun mark */}
        <motion.div
          aria-hidden="true"
          className="auth-sun-mark pointer-events-none absolute right-10 top-20 text-[#f3d16f]/75"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
        >
          <Sun className="h-28 w-28" strokeWidth={0.75} />
        </motion.div>

        {/* Floating golden specks */}
        {!reducedMotion && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
            {FLOATING_SPECKS.map((s) => (
              <motion.span
                key={s.id}
                className="absolute rounded-full bg-[#f3d16f]"
                style={{
                  left: s.left,
                  top: s.top,
                  width: s.size,
                  height: s.size,
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 6px rgba(243,209,111,0.7)',
                }}
                animate={{
                  y: [0, -18, 0],
                  opacity: [0.15, 0.7, 0.15],
                }}
                transition={{
                  duration: s.duration,
                  delay: s.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}

        {/* Top: brand mark */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/35 bg-white/15 shadow-lg backdrop-blur-md">
            <img src="/sprout.svg" alt="" className="h-8 w-8" />
          </span>
          <span className="text-xl font-bold tracking-wide">KhamarBari</span>
        </Link>

        {/* Middle: editorial copy */}
        <div className="auth-visual-copy relative z-10 max-w-xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f4d781]/35 bg-[#f4d781]/10 px-3 py-1.5 text-xs font-semibold text-[#ffedb4] backdrop-blur-sm">
            <Sun className="h-3.5 w-3.5" /> {t('auth.layout.badge')}
          </span>

          <h2 className="max-w-lg text-4xl font-semibold leading-[1.08] xl:text-5xl">
            {t(side === 'illustration' ? 'auth.layout.illustrationHeadline' : 'auth.layout.welcomeHeadline')}
          </h2>

          <p className="mt-4 max-w-md text-base leading-7 text-white/80">
            {t('auth.layout.description')}
          </p>

          {/* Rotating trust pill */}
          <div className="mt-6 h-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={trustIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md"
              >
                <TrustIcon className="h-3.5 w-3.5 text-[#f4d781]" />
                <span>{t(TRUST_ROTATION[trustIndex].text)}</span>
                <span className="ml-1 h-1 w-1 rounded-full bg-[#f4d781]/70" />
                <span className="text-[10px] text-white/60">
                  {trustIndex + 1}/{TRUST_ROTATION.length}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom: footer */}
        <div className="relative z-10 flex items-end justify-between gap-4">
          <p className="text-xs text-white/65">
            © {new Date().getFullYear()} KhamarBari. {t('auth.layout.footer')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-white/70 transition hover:text-white/95"
          >
            {t('auth.layout.backHome')}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT — Form side
         ═══════════════════════════════════════════════════════════ */}
      <div className="auth-form-side flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="auth-form-shell w-full max-w-lg">
          <div className="mb-4 flex justify-end">
            <LanguageToggle />
          </div>

          {/* Mobile brand mark */}
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sunshine-soft shadow-sm">
                <img src="/sprout.svg" alt="" className="h-7 w-7" />
              </span>
              <span className="text-lg font-bold text-forest-900">KhamarBari</span>
            </Link>
          </div>

          {/* Heading block */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">
              {t('brand.tagline')}
            </p>
            <h1 className="text-3xl font-bold text-forest-900 sm:text-4xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-6 text-forest-700/75">{subtitle}</p>
            )}
          </motion.div>

          {/* Form card */}
          <motion.div
            className="auth-form-card rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_18px_55px_rgba(47,76,38,0.12)] backdrop-blur-xl sm:p-8"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.5,
              delay: reducedMotion ? 0 : 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {children}
          </motion.div>

          {/* Subtle trust row below the form */}
          <motion.div
            className="mt-6 flex items-center justify-center gap-4 text-[11px] text-forest-600/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.3 }}
          >
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" /> {t('auth.layout.secure')}
            </span>
            <span className="h-1 w-1 rounded-full bg-forest-300" />
            <span className="inline-flex items-center gap-1">
              <Leaf className="h-3 w-3 text-emerald-600" /> {t('auth.layout.farmNative')}
            </span>
            <span className="h-1 w-1 rounded-full bg-forest-300" />
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> {t('auth.layout.freeToStart')}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}