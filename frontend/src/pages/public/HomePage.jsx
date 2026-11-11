import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

import AtmosphericBackdrop from '@/components/home/AtmosphericBackdrop'
import CursorPollenTrail from '@/components/home/CursorPollenTrail'
import MoodSelector from '@/components/home/MoodSelector'
import AnimatedPastureScene from '@/components/home/AnimatedPastureScene'
import LiveImpactTicker from '@/components/home/LiveImpactTicker'
import FeatureBentoGrid from '@/components/home/FeatureBentoGrid'
import FarmRoiCalculator from '@/components/home/FarmRoiCalculator'
import InteractiveDayTimeline from '@/components/home/InteractiveDayTimeline'
import FoundersSection from '@/components/home/FoundersSection'
import FarmerTestimonials from '@/components/home/FarmerTestimonials'
import InteractiveFaq from '@/components/home/InteractiveFaq'
import JoyfulCtaBanner from '@/components/home/JoyfulCtaBanner'

import './HomePage.css'

function getLocalTimeMood(date = new Date()) {
  const hour = date.getHours()
  if (hour >= 5 && hour < 10) return 'morning'
  if (hour >= 10 && hour < 15) return 'meadow'
  if (hour >= 15 && hour < 18) return 'harvest'
  return 'dusk'
}

export default function HomePage() {
  const { t } = useTranslation()
  const [mood, setMood] = useState(getLocalTimeMood)
  const [isAutoMood, setIsAutoMood] = useState(true)
  const [isPastureVisible, setIsPastureVisible] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isAutoMood) return undefined

    const updateMood = () => setMood(getLocalTimeMood())
    const updateWhenVisible = () => {
      if (!document.hidden) updateMood()
    }

    updateMood()
    const intervalId = window.setInterval(updateMood, 60_000)
    window.addEventListener('focus', updateMood)
    document.addEventListener('visibilitychange', updateWhenVisible)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', updateMood)
      document.removeEventListener('visibilitychange', updateWhenVisible)
    }
  }, [isAutoMood])

  const selectMood = (nextMood) => {
    setMood(nextMood)
    setIsAutoMood(false)
  }

  const enableAutoMood = () => {
    setMood(getLocalTimeMood())
    setIsAutoMood(true)
  }

  return (
    <div className="relative overflow-hidden bg-cream min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section
        className="home-hero-container relative bg-forest-950"
        data-mood={mood}
        aria-labelledby="hero-heading"
      >
        <AtmosphericBackdrop mood={mood} />
        <CursorPollenTrail mood={mood} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16 sm:pb-24 relative z-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-xs font-semibold"
            >
              <span
                className="h-2 w-2 rounded-full bg-fresh-400 inline-block motion-safe:animate-ping"
                aria-hidden="true"
              />
              <span>{t('hero.badge', 'Built for real farms in Bangladesh')}</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
              <MoodSelector
                currentMood={mood}
                onSelectMood={selectMood}
                isAuto={isAutoMood}
                onEnableAuto={enableAutoMood}
              />
            </motion.div>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 text-white"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fresh-400/30 bg-fresh-500/20 text-fresh-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-fresh-400" aria-hidden="true" />
                <span>{t('home.hero.kicker')}</span>
              </div>

              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] text-balance"
              >
                {t('home.hero.titleStart')}{' '}
                <span className="shimmer-text">{t('home.hero.titleHighlight')}</span>{' '}
                {t('home.hero.titleEnd')}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-emerald-100/80 leading-relaxed max-w-lg">
                {t('home.hero.description')}
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="h-12 px-7 rounded-xl bg-fresh-400 text-forest-950 font-bold shadow-xl shadow-fresh-400/25 hover:bg-fresh-300 transition-all hover:scale-105 motion-safe:beacon-pulse cursor-pointer text-sm"
                  asChild
                >
                  <Link to="/signup" className="flex items-center gap-2">
                    <span>{t('hero.ctaPrimary', 'Get Started Free')}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-5 rounded-xl border-white/30 bg-white/10 text-white font-semibold backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer text-sm"
                  asChild
                >
                  <a href="#features">
                    {t('hero.ctaSecondary', 'See How It Works')}
                  </a>
                </Button>
              </div>

              {/* Product scope */}
              <div className="mt-9 flex items-center gap-3 text-xs text-emerald-100/75 pt-6 border-t border-white/15">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-fresh-300">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <strong className="block text-white font-bold">
                    {t('home.hero.scopeTitle')}
                  </strong>
                  <span className="text-emerald-200/80">
                    {t('home.hero.scopeDescription')}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right: Living Artistic Pasture Scene */}
            <motion.div
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7"
            >
              <div className={`mb-3 flex ${isPastureVisible ? 'justify-end' : 'min-h-48 items-center justify-center'}`}>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  onClick={() => setIsPastureVisible((visible) => !visible)}
                  aria-controls="homepage-pasture-scene"
                  aria-expanded={isPastureVisible}
                >
                  {isPastureVisible
                    ? <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" />
                    : <Eye className="mr-2 h-5 w-4" aria-hidden="true" />}
                  {isPastureVisible
                    ? t('home.hero.hidePasture', 'Hide farm scene')
                    : t('home.hero.showPasture', 'Show farm scene')}
                </Button>
              </div>
              <div id="homepage-pasture-scene">
                {isPastureVisible && (
                  <AnimatedPastureScene mood={mood} />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      <FeatureBentoGrid />

      {/* About Us · The Founders & Developers */}
      <FoundersSection />

      <FarmRoiCalculator />
      <InteractiveDayTimeline />
      <InteractiveFaq />
      <JoyfulCtaBanner />
    </div>
  )
}