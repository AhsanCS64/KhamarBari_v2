import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Leaf, ShieldCheck, Sun } from 'lucide-react'

export default function JoyfulCtaBanner() {
  const { t } = useTranslation()

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-cream to-[#edf7ee]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-300/60 bg-gradient-to-br from-[#0c3926] via-[#104b32] to-[#165a3d] p-8 sm:p-14 lg:p-16 text-center text-white shadow-[0_32px_96px_rgba(11,54,36,0.3)]">
          {/* Ambient Sunburst & Sunlight Bloom */}
          <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-yellow-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fresh-400/25 blur-3xl" />

          {/* Floating animated sprout */}
          <motion.div
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-inner"
            animate={{ y: [0, -8, 0], rotate: [0, -4, 4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src="/sprout.svg" alt="" className="h-10 w-10 brightness-0 invert" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
            {t('home.cta.title')}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            {t('home.cta.description')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-fresh-400 text-forest-950 font-bold shadow-xl shadow-fresh-400/30 hover:bg-fresh-300 transition-all hover:scale-105 cursor-pointer text-sm"
              asChild
            >
              <Link to="/signup" className="flex items-center justify-center gap-2">
                <span>{t('home.cta.start')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 px-6 rounded-xl border-white/30 bg-white/10 text-white font-semibold backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer text-sm"
              asChild
            >
              <Link to="/contact">{t('home.cta.demo')}</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-100/70">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-fresh-300" />
              {t('home.cta.noCard')}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-fresh-300" />
              {t('home.cta.setup')}
            </span>
            <span className="flex items-center gap-1.5">
              <Sun className="h-4 w-4 text-fresh-300" />
              {t('home.cta.onboarding')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
