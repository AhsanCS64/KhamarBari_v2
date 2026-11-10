import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Sparkles, Heart, Sun, CloudSun, Moon, Volume2, VolumeX,
  Droplets, Wind, Bird, Fish,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Pasture palettes — richer, more cinematic, mood-aware
// ─────────────────────────────────────────────────────────────────────────────
const PASTURE_THEMES = {
  morning: {
    skyTop: '#0a3a2a', skyMid: '#155e42', skyBottom: '#2b8a63',
    horizonMist: 'rgba(254, 240, 138, 0.28)',
    hillFar: '#083224', hillMid: '#0f4a32', hillNear: '#166946', hillFront: '#1d8055',
    pondWater: '#2dd4bf', pondShine: '#5eead4', pondDeep: '#0e7490',
    sunGlow: 'rgba(254, 215, 102, 0.45)', sunCore: '#fef08a', sunCorona: '#fde68a',
    accentTag: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30',
    ambientLight: 'rgba(254, 240, 138, 0.14)',
    fireflies: false, stars: false, moon: false, aurora: false,
    cloudColor: '#f8fafc', cloudOpacity: 0.5,
    grassTone: '#22c55e', flowerTones: ['#fbbf24', '#f472b6', '#ffffff', '#fde047'],
    skyLabel: 'home.scene.sky.morning',
  },
  meadow: {
    skyTop: '#03382e', skyMid: '#047857', skyBottom: '#0ea97a',
    horizonMist: 'rgba(167, 243, 208, 0.22)',
    hillFar: '#064434', hillMid: '#065f46', hillNear: '#059669', hillFront: '#10b981',
    pondWater: '#38bdf8', pondShine: '#7dd3fc', pondDeep: '#0369a1',
    sunGlow: 'rgba(250, 204, 21, 0.5)', sunCore: '#fde047', sunCorona: '#facc15',
    accentTag: 'bg-teal-500/20 text-teal-100 border-teal-400/30',
    ambientLight: 'rgba(167, 243, 208, 0.16)',
    fireflies: false, stars: false, moon: false, aurora: false,
    cloudColor: '#ffffff', cloudOpacity: 0.55,
    grassTone: '#10b981', flowerTones: ['#fde047', '#f9a8d4', '#ffffff', '#a7f3d0'],
    skyLabel: 'home.scene.sky.meadow',
  },
  harvest: {
    skyTop: '#3a1403', skyMid: '#7c2d12', skyBottom: '#c2410c',
    horizonMist: 'rgba(251, 191, 36, 0.35)',
    hillFar: '#3d1604', hillMid: '#572205', hillNear: '#7c2d12', hillFront: '#9a3412',
    pondWater: '#0284c7', pondShine: '#38bdf8', pondDeep: '#075985',
    sunGlow: 'rgba(251, 146, 60, 0.6)', sunCore: '#fb923c', sunCorona: '#f97316',
    accentTag: 'bg-amber-500/20 text-amber-100 border-amber-400/30',
    ambientLight: 'rgba(253, 230, 138, 0.2)',
    fireflies: false, stars: false, moon: false, aurora: false,
    cloudColor: '#fde68a', cloudOpacity: 0.4,
    grassTone: '#ca8a04', flowerTones: ['#f97316', '#fbbf24', '#fde047', '#fef3c7'],
    skyLabel: 'home.scene.sky.harvest',
  },
  dusk: {
    skyTop: '#020b14', skyMid: '#04203a', skyBottom: '#0b3b5c',
    horizonMist: 'rgba(249, 115, 22, 0.25)',
    hillFar: '#021e25', hillMid: '#042f38', hillNear: '#07434f', hillFront: '#0e5a6a',
    pondWater: '#0369a1', pondShine: '#38bdf8', pondDeep: '#082f49',
    sunGlow: 'rgba(249, 115, 22, 0.4)', sunCore: '#fed7aa', sunCorona: '#fdba74',
    accentTag: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/30',
    ambientLight: 'rgba(56, 189, 248, 0.12)',
    fireflies: true, stars: true, moon: true, aurora: true,
    cloudColor: '#c7d2fe', cloudOpacity: 0.25,
    grassTone: '#0e7490', flowerTones: ['#818cf8', '#c4b5fd', '#38bdf8', '#e0e7ff'],
    skyLabel: 'home.scene.sky.dusk',
  },
}

// Deterministic pseudo-random for stable layouts
const seededRandom = (seed) => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// SVG transform helpers. framer-motion and CSS hover transforms REPLACE a
// transform="" attribute, so every positioned element is wrapped in a plain
// <g transform> and the animated/hovered element lives inside it.
const ORIGIN_BASE = { transformBox: 'fill-box', transformOrigin: '50% 100%' }
const ORIGIN_TOP = { transformBox: 'fill-box', transformOrigin: '50% 0%' }
const ORIGIN_MID = { transformBox: 'fill-box', transformOrigin: '50% 50%' }

// Where hearts pop for each clickable thing (percent of the scene)
const ANCHORS = {
  cow: { ax: 36, ay: 56 }, goat: { ax: 47, ay: 54 }, sheep: { ax: 55, ay: 71 },
  chicken: { ax: 18, ay: 71 }, barn: { ax: 23.5, ay: 31 }, house: { ax: 74.5, ay: 34 },
  coop: { ax: 7.5, ay: 43 }, goatshed: { ax: 43, ay: 43 }, pond: { ax: 76, ay: 66 },
  all: { ax: 50, ay: 50 },
}

const SKY_SPARKLES = [
  { id: 1, x: 140, y: 110, r: 3, delay: 0 },
  { id: 2, x: 260, y: 165, r: 2.5, delay: 1.2 },
  { id: 3, x: 440, y: 92, r: 3.4, delay: 0.5 },
  { id: 4, x: 620, y: 138, r: 2.8, delay: 1.7 },
  { id: 5, x: 760, y: 120, r: 2.6, delay: 0.9 },
  { id: 6, x: 865, y: 165, r: 3.2, delay: 2.3 },
]

const STARS = (() => {
  const rnd = seededRandom(42)
  return Array.from({ length: 46 }, (_, i) => ({
    id: i, x: rnd() * 960, y: rnd() * 260, r: 0.6 + rnd() * 1.8,
    delay: rnd() * 3, duration: 2 + rnd() * 3,
  }))
})()

const BIRD_FLIGHTS = [
  { id: 1, x: 150, y: 90, scale: 1 },
  { id: 2, x: 420, y: 125, scale: 0.8 },
  { id: 3, x: 715, y: 100, scale: 1.1 },
]

const BUTTERFLIES = [
  { id: 1, x: 210, y: 150, color: '#fef3c7', scale: 1 },
  { id: 2, x: 480, y: 170, color: '#fbbf24', scale: 0.9 },
  { id: 3, x: 690, y: 195, color: '#f9a8d4', scale: 1.1 },
]

// Light shafts fanning out from the sun (day moods only)
const RAYS = [[80, 200], [250, 370], [420, 520], [580, 690]]

// Painted grass tufts scattered over the meadow hill (kept off the pond)
const GRASS_TUFTS = (() => {
  const rnd = seededRandom(9)
  return Array.from({ length: 70 }, (_, i) => ({
    id: i, x: 10 + rnd() * 940, y: 335 + rnd() * 180,
    h: 6 + rnd() * 9, l: 3 + rnd() * 4,
  })).filter((t) => !(t.x > 560 && t.x < 900 && t.y > 370 && t.y < 500))
})()

// Foreground wildflowers along the front hill
const FLOWERS = (() => {
  const rnd = seededRandom(123)
  return Array.from({ length: 34 }, (_, i) => ({
    id: i, x: 20 + rnd() * 920, y: 520 + rnd() * 66, h: 12 + rnd() * 16,
    tone: i % 4, r: 2 + rnd() * 1.8, delay: rnd() * 3, duration: 3 + rnd() * 2,
  }))
})()

// Firefly ambience positions
const FIREFLIES = (() => {
  const rnd = seededRandom(77)
  return Array.from({ length: 12 }, (_, i) => ({
    id: i, x: 80 + rnd() * 800, y: 300 + rnd() * 220, r: 1.5 + rnd() * 2,
    delay: rnd() * 4, duration: 2.4 + rnd() * 2.4,
    driftX: -12 + rnd() * 24, driftY: -22 + rnd() * 8,
  }))
})()

export default function AnimatedPastureScene({ mood = 'morning' }) {
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()
  const theme = PASTURE_THEMES[mood] || PASTURE_THEMES.morning

  // Interactive states
  const [activeSpeech, setActiveSpeech] = useState(null)
  const [happiness, setHappiness] = useState(100)
  const [feedGrains, setFeedGrains] = useState([])
  const [fishLeap, setFishLeap] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [heartBursts, setHeartBursts] = useState([])
  const [timeOfDay, setTimeOfDay] = useState(mood)
  const sceneRef = useRef(null)

  const activeTheme = PASTURE_THEMES[timeOfDay] || theme

  // Keep in sync if the parent changes the mood prop
  useEffect(() => { setTimeOfDay(mood) }, [mood])

  // Floating speech bubble timeout
  useEffect(() => {
    if (!activeSpeech) return
    const timer = setTimeout(() => setActiveSpeech(null), 4200)
    return () => clearTimeout(timer)
  }, [activeSpeech])

  // Periodic fish jump
  useEffect(() => {
    if (reducedMotion) return
    let leapTimer
    const interval = setInterval(() => {
      setFishLeap(true)
      leapTimer = setTimeout(() => setFishLeap(false), 1400)
    }, 6000 + Math.random() * 3000)
    return () => { clearInterval(interval); clearTimeout(leapTimer) }
  }, [reducedMotion])

  // Happiness slowly decays without interaction
  useEffect(() => {
    const decay = setInterval(() => {
      setHappiness((prev) => Math.max(72, prev - 0.15))
    }, 6000)
    return () => clearInterval(decay)
  }, [])

  // Petting effect: burst of hearts rising from the thing you clicked
  const petAnimal = useCallback((id) => {
    setHappiness((prev) => Math.min(100, prev + 2))
    const bid = `${id}-${Date.now()}`
    const items = Array.from({ length: 5 }, (_, i) => ({
      id: `${bid}-${i}`,
      dx: -20 + Math.random() * 40,
      dy: -30 - Math.random() * 30,
      delay: i * 0.08,
    }))
    const anchor = ANCHORS[id] || ANCHORS.all
    setHeartBursts((prev) => [...prev, { id: bid, items, ...anchor }])
    setTimeout(() => setHeartBursts((prev) => prev.filter((b) => b.id !== bid)), 1500)
  }, [])

  // Handle scatter feed action
  const handleScatterFeed = useCallback(() => {
    setHappiness((prev) => Math.min(100, prev + 6))
    setActiveSpeech({
      id: 'all',
      title: t('home.scene.celebrationTitle'),
      message: t('home.scene.celebrationMessage'),
      icon: '✨',
    })
    const grains = Array.from({ length: 22 }, (_, i) => ({
      id: Date.now() + i,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 38,
      delay: Math.random() * 0.5,
      rot: -40 + Math.random() * 80,
    }))
    setFeedGrains(grains)
    setTimeout(() => setFeedGrains([]), 3000)
  }, [t])

  const triggerAnimal = useCallback((id, storyKey, icon) => {
    setActiveSpeech({
      id,
      title: t(`home.scene.stories.${storyKey}.title`),
      message: t(`home.scene.stories.${storyKey}.message`),
      icon,
    })
    petAnimal(id)
  }, [petAnimal, t])

  // Ambient sound toggle (Web Audio API — soft pentatonic wind chimes)
  const audioCtxRef = useRef(null)
  const chimeRef = useRef(null)
  const stopSound = useCallback(() => {
    clearInterval(chimeRef.current)
    chimeRef.current = null
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
  }, [])

  const toggleSound = useCallback(() => {
    if (!soundOn) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext
        if (!Ctx) return
        const ctx = new Ctx()
        audioCtxRef.current = ctx
        const master = ctx.createGain()
        master.gain.value = 0.04
        master.connect(ctx.destination)
        const freqs = [261.63, 329.63, 392.0, 523.25]
        // Soft opening pad
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.value = f
          gain.gain.value = 0
          osc.connect(gain).connect(master)
          osc.start()
          const t = ctx.currentTime + i * 0.9
          gain.gain.setValueAtTime(0, t)
          gain.gain.linearRampToValueAtTime(0.06 / (i + 1), t + 0.6)
          gain.gain.linearRampToValueAtTime(0.02 / (i + 1), t + 6)
          gain.gain.linearRampToValueAtTime(0, t + 12)
          osc.stop(t + 12.5)
        })
        // Random chimes keep the ambience alive after the pad fades
        chimeRef.current = setInterval(() => {
          const c = audioCtxRef.current
          if (!c) return
          const o = c.createOscillator()
          const g = c.createGain()
          o.type = 'sine'
          o.frequency.value = freqs[Math.floor(Math.random() * freqs.length)] * 2
          g.gain.setValueAtTime(0, c.currentTime)
          g.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.05)
          g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 2.4)
          o.connect(g).connect(master)
          o.start()
          o.stop(c.currentTime + 2.5)
        }, 3200)
        setSoundOn(true)
      } catch {
        /* audio not available */
      }
    } else {
      stopSound()
      setSoundOn(false)
    }
  }, [soundOn, stopSound])

  useEffect(() => stopSound, [stopSound])

  const moodOptions = [
    { id: 'morning', labelKey: 'home.mood.morning', icon: Sun },
    { id: 'meadow', labelKey: 'home.mood.meadow', icon: CloudSun },
    { id: 'harvest', labelKey: 'home.mood.harvest', icon: Sun },
    { id: 'dusk', labelKey: 'home.mood.dusk', icon: Moon },
  ]

  // Cross-fading gradient stop (theme changes ease instead of snapping)
  const Stop = ({ offset, color }) => (
    <motion.stop offset={offset} initial={false} animate={{ stopColor: color }} transition={{ duration: 1.2 }} />
  )

  const blink = reducedMotion ? undefined : { scaleY: [1, 0.1, 1] }
  const blinkT = { duration: 4.5, repeat: Infinity, repeatDelay: 2.5 }

  return (
    <div
      ref={sceneRef}
      className="relative w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-forest-950/40 backdrop-blur-md select-none group"
    >
      {/* ── Top pasture bar with interactive controls ── */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${activeTheme.accentTag}`}>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('home.scene.livingPasture')}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 text-emerald-100 border border-white/10 backdrop-blur-md">
            <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />
            <span>{t('home.scene.health', { percent: Math.round(happiness) })}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 text-emerald-100/80 border border-white/10 backdrop-blur-md italic">
            {t(activeTheme.skyLabel)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-0.5 bg-white/10 border border-white/10 backdrop-blur-md rounded-full p-0.5">
            {moodOptions.map((m) => (
              <button
                key={m.id}
                onClick={() => setTimeOfDay(m.id)}
                title={t(m.labelKey)}
                aria-label={t('home.scene.switchTo', { mood: t(m.labelKey) })}
                className={`grid place-items-center h-6 w-6 rounded-full transition-all cursor-pointer ${
                  timeOfDay === m.id
                    ? 'bg-amber-300 text-forest-950 shadow'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <m.icon className="h-3 w-3" />
              </button>
            ))}
          </div>

          <button
            onClick={toggleSound}
            title={soundOn ? t('home.scene.mute') : t('home.scene.play')}
            aria-label={soundOn ? t('home.scene.mute') : t('home.scene.play')}
            className="grid h-7 w-7 place-items-center rounded-full bg-white/10 border border-white/10 text-emerald-100 backdrop-blur-md hover:bg-white/20 transition cursor-pointer"
          >
            {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={handleScatterFeed}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-forest-950 bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-200 hover:to-yellow-300 shadow-md shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
            title={t('home.scene.scatterFeedTitle')}
          >
            <span>🌾</span>
            <span className="hidden sm:inline">{t('home.scene.scatterFeed')}</span>
          </button>
        </div>
      </div>

      {/* ── Floating Interactive Speech Bubble ── */}
      <AnimatePresence mode="wait">
        {activeSpeech && (
          <motion.div
            key={activeSpeech.id + activeSpeech.title}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] sm:w-auto bg-white/95 text-forest-950 px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-200 backdrop-blur-md flex items-center gap-3 pointer-events-auto"
          >
            <span className="text-2xl" role="img" aria-hidden="true">{activeSpeech.icon}</span>
            <div className="text-left">
              <strong className="block text-xs font-bold text-forest-900 leading-tight">{activeSpeech.title}</strong>
              <span className="text-[11px] text-forest-700 leading-snug">{activeSpeech.message}</span>
            </div>
            <button
              onClick={() => setActiveSpeech(null)}
              className="ml-auto text-forest-400 hover:text-forest-700 text-xs font-bold px-1 cursor-pointer"
              aria-label={t('home.scene.dismiss')}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main SVG Landscape (grains & hearts live here so they track the scene) ── */}
      <div className="relative w-full aspect-[16/10]">
        {/* Falling feed grains */}
        <AnimatePresence>
          {feedGrains.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 1, y: 0, scale: 0.6, rotate: 0 }}
              animate={{ opacity: 0, y: 170, scale: 1, rotate: g.rot }}
              transition={{ duration: 1.7, delay: g.delay, ease: 'easeIn' }}
              style={{ left: `${g.x}%`, top: `${g.y}%` }}
              className="absolute z-20 pointer-events-none text-xs text-amber-300 drop-shadow-md"
            >
              🌾
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Heart bursts rise from whatever was clicked */}
        <AnimatePresence>
          {heartBursts.map((burst) =>
            burst.items.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.2, 1, 0.8], x: h.dx, y: h.dy }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, delay: h.delay, ease: 'easeOut' }}
                style={{ left: `${burst.ax}%`, top: `${burst.ay}%` }}
                className="absolute z-20 pointer-events-none text-rose-400 text-lg drop-shadow"
              >
                ❤
              </motion.div>
            ))
          )}
        </AnimatePresence>

        <svg
          viewBox="0 0 960 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          aria-label="Artistic living farm pasture illustration"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" color={activeTheme.skyTop} />
              <Stop offset="55%" color={activeTheme.skyMid} />
              <Stop offset="100%" color={activeTheme.skyBottom} />
            </linearGradient>

            <linearGradient id="hillFarGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" color={activeTheme.hillFar} />
              <Stop offset="100%" color={activeTheme.hillMid} />
            </linearGradient>

            <linearGradient id="hillNearGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" color={activeTheme.hillNear} />
              <Stop offset="100%" color={activeTheme.hillFront} />
            </linearGradient>

            <linearGradient id="pondGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" color={activeTheme.pondWater} />
              <Stop offset="100%" color={activeTheme.pondShine} />
            </linearGradient>

            <radialGradient id="pondDepth" cx="0.5" cy="0.7" r="0.6">
              <stop offset="0%" stopColor={activeTheme.pondDeep} stopOpacity="0.55" />
              <stop offset="100%" stopColor={activeTheme.pondDeep} stopOpacity="0" />
            </radialGradient>

            <linearGradient id="waterSheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>

            <radialGradient id="horizonGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor={activeTheme.horizonMist} stopOpacity="0.9" />
              <stop offset="100%" stopColor={activeTheme.horizonMist} stopOpacity="0" />
            </radialGradient>

            <radialGradient id="sunCoronaGrad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor={activeTheme.sunCore} stopOpacity="0.9" />
              <stop offset="40%" stopColor={activeTheme.sunCorona} stopOpacity="0.5" />
              <stop offset="100%" stopColor={activeTheme.sunGlow} stopOpacity="0" />
            </radialGradient>

            {/* God-ray fade, running from the sun down-left */}
            <linearGradient id="rayGrad" gradientUnits="userSpaceOnUse" x1="820" y1="90" x2="480" y2="560">
              <stop offset="0%" stopColor={activeTheme.sunCore} stopOpacity="0.42" />
              <stop offset="100%" stopColor={activeTheme.sunCore} stopOpacity="0" />
            </linearGradient>

            {/* Edge darkening for a cinematic frame */}
            <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
              <stop offset="60%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.38" />
            </radialGradient>

            {/* Crescent moon cut-out */}
            <mask id="crescentMask">
              <rect x="-60" y="-60" width="120" height="120" fill="white" />
              <circle cx="15" cy="-7" r="31" fill="black" />
            </mask>

            <filter id="windowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
            <filter id="mistBlur" x="-30%" y="-100%" width="160%" height="300%">
              <feGaussianBlur stdDeviation="10" />
            </filter>

            <linearGradient id="auroraGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
              <stop offset="40%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ════════ 1. SKY ════════ */}
          <rect width="960" height="600" fill="url(#skyGrad)" />
          <ellipse cx="480" cy="290" rx="620" ry="120" fill="url(#horizonGlow)" />

          {/* Sun shafts (day only) */}
          {!activeTheme.stars && (
            <g style={{ mixBlendMode: 'screen' }}>
              {RAYS.map(([a, b], i) => (
                <motion.polygon
                  key={i}
                  points={`814,96 826,96 ${b},600 ${a},600`}
                  fill="url(#rayGrad)"
                  animate={reducedMotion ? { opacity: 0.35 } : { opacity: [0.2, 0.55, 0.2] }}
                  transition={{ duration: 7 + i, delay: i * 1.3, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </g>
          )}

          {/* Night stars */}
          {activeTheme.stars && (
            <g>
              {STARS.map((s) => (
                <motion.circle
                  key={s.id}
                  cx={s.x} cy={s.y} r={s.r}
                  fill="#fef3c7"
                  filter="url(#starGlow)"
                  animate={reducedMotion ? { opacity: 0.8 } : { opacity: [0.25, 1, 0.3] }}
                  transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </g>
          )}

          {/* Aurora ribbons (dusk only) */}
          {activeTheme.aurora && (
            <g opacity="0.55">
              <motion.path
                d="M -100 120 Q 200 60 480 130 T 1060 90"
                stroke="url(#auroraGrad)" strokeWidth="26" fill="none" strokeLinecap="round"
                animate={reducedMotion ? undefined : { d: [
                  'M -100 120 Q 200 60 480 130 T 1060 90',
                  'M -100 100 Q 200 90 480 110 T 1060 110',
                  'M -100 120 Q 200 60 480 130 T 1060 90',
                ] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.path
                d="M -80 160 Q 240 110 500 170 T 1040 140"
                stroke="url(#auroraGrad)" strokeWidth="16" fill="none" opacity="0.6" strokeLinecap="round"
                animate={reducedMotion ? undefined : { d: [
                  'M -80 160 Q 240 110 500 170 T 1040 140',
                  'M -80 140 Q 240 140 500 150 T 1040 160',
                  'M -80 160 Q 240 110 500 170 T 1040 140',
                ] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              />
            </g>
          )}

          {/* Sky sparkles */}
          <g opacity="0.82">
            {SKY_SPARKLES.map((sp) => (
              <g key={sp.id} transform={`translate(${sp.x} ${sp.y})`}>
                <motion.g
                  style={ORIGIN_MID}
                  animate={reducedMotion ? { opacity: 0.75 } : { opacity: [0.3, 1, 0.4], scale: [0.9, 1.35, 0.95] }}
                  transition={{ duration: 3 + sp.delay, delay: sp.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <circle cx={0} cy={0} r={sp.r} fill="#fef3c7" />
                  <circle cx={0} cy={0} r={sp.r * 2.4} fill="rgba(254, 243, 199, 0.18)" />
                </motion.g>
              </g>
            ))}
          </g>

          {/* Birds */}
          <g opacity={timeOfDay === 'dusk' ? 0.7 : 0.62}>
            {BIRD_FLIGHTS.map((bird, index) => (
              <g key={bird.id} transform={`translate(${bird.x} ${bird.y}) scale(${bird.scale})`}>
                <motion.g
                  animate={reducedMotion ? { opacity: 0.5 } : { x: [0, 28, 0], y: [0, -12, 0], opacity: [0.2, 0.9, 0.25] }}
                  transition={{ duration: 12 + index * 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d="M 0 0 Q 12 -10 24 0" stroke="#f8fafc" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 24 0 Q 36 -10 48 0" stroke="#f8fafc" strokeWidth="2" fill="none" strokeLinecap="round" />
                </motion.g>
              </g>
            ))}
          </g>

          {/* Clouds */}
          <motion.g
            opacity={activeTheme.cloudOpacity}
            fill={activeTheme.cloudColor}
            animate={reducedMotion ? undefined : { x: [0, 14, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ellipse cx="220" cy="90" rx="65" ry="18" />
            <ellipse cx="250" cy="80" rx="45" ry="24" />
            <ellipse cx="610" cy="130" rx="80" ry="20" />
            <ellipse cx="650" cy="120" rx="50" ry="26" />
          </motion.g>

          {/* Celestial body — sun / crescent moon */}
          <g transform="translate(820, 90)">
            <motion.circle
              r="52"
              fill="url(#sunCoronaGrad)"
              animate={reducedMotion ? undefined : { r: [50, 56, 50], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle
              r="36"
              fill={activeTheme.moon ? '#fff7e0' : activeTheme.sunCore}
              mask={activeTheme.moon ? 'url(#crescentMask)' : undefined}
            />
            {!activeTheme.moon && (
              <motion.circle
                r="44" fill="none" stroke={activeTheme.sunCorona} strokeWidth="0.8" opacity="0.4"
                animate={reducedMotion ? undefined : { r: [42, 50, 42], opacity: [0.4, 0.15, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </g>

          {/* Distant mountain silhouette */}
          <path
            d="M 0 320 Q 180 230 380 290 T 780 260 Q 880 280 960 300 L 960 600 L 0 600 Z"
            fill="url(#hillFarGrad)"
            opacity="0.85"
          />

          {/* Mid ridge + drifting mist give the valley depth */}
          <path d="M 0 305 Q 220 262 470 292 T 960 272 L 960 600 L 0 600 Z" fill={activeTheme.hillMid} opacity="0.9" />
          <motion.g
            filter="url(#mistBlur)"
            fill={activeTheme.horizonMist}
            animate={reducedMotion ? undefined : { x: [-20, 30, -20] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ellipse cx="260" cy="296" rx="240" ry="14" />
            <ellipse cx="700" cy="286" rx="210" ry="12" />
          </motion.g>

          {/* ════════ 2. STRUCTURES ════════ */}
          {/* Barn & Silo */}
          <g
            className="cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            style={ORIGIN_BASE}
            onClick={() => triggerAnimal('barn', 'barn', '🏡')}
          >
            <rect x="130" y="190" width="42" height="100" rx="4" fill="#64748b" />
            <path d="M 126 190 Q 151 160 176 190 Z" fill="#475569" />
            <line x1="130" y1="215" x2="172" y2="215" stroke="#475569" strokeWidth="2" />
            <line x1="130" y1="240" x2="172" y2="240" stroke="#475569" strokeWidth="2" />
            <line x1="130" y1="265" x2="172" y2="265" stroke="#475569" strokeWidth="2" />

            <polygon points="165,220 225,175 285,220 285,290 165,290" fill="#991b1b" />
            <polygon points="160,222 225,170 290,222 284,226 225,176 166,226" fill="#f87171" />
            <polygon points="160,222 175,200 225,170 275,200 290,222" fill="#b91c1c" />

            <line x1="225" y1="170" x2="225" y2="152" stroke="#d4d4d8" strokeWidth="2" />
            <polygon points="225,152 233,148 225,144" fill="#fbbf24" />
            <circle cx="225" cy="148" r="2.5" fill="#f59e0b" />

            <rect x="205" y="240" width="40" height="50" fill="#7f1d1d" rx="2" />
            <rect x="208" y="243" width="34" height="47" fill="#450a0a" />
            <line x1="208" y1="243" x2="242" y2="290" stroke="#fecaca" strokeWidth="2.5" />
            <line x1="242" y1="243" x2="208" y2="290" stroke="#fecaca" strokeWidth="2.5" />

            <polygon points="215,205 225,195 235,205 235,220 215,220" fill="#fef08a" filter="url(#windowGlow)" />
            <ellipse cx="225" cy="222" rx="12" ry="4" fill="#f59e0b" />
          </g>

          {/* Cottage */}
          <g
            className="cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            style={ORIGIN_BASE}
            onClick={() => triggerAnimal('house', 'house', '☕')}
          >
            <rect x="735" y="195" width="16" height="35" fill="#78350f" />
            <motion.circle
              cx="743" cy="185" r="6" fill="#e2e8f0" opacity="0.6"
              animate={reducedMotion ? undefined : { cy: [185, 155], r: [6, 14], opacity: [0.6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.circle
              cx="745" cy="175" r="8" fill="#e2e8f0" opacity="0.5"
              animate={reducedMotion ? undefined : { cy: [175, 140], r: [8, 18], opacity: [0.5, 0] }}
              transition={{ duration: 3.2, delay: 1, repeat: Infinity, ease: 'easeOut' }}
            />

            <rect x="670" y="225" width="90" height="65" fill="#fef3c7" rx="3" />
            <polygon points="655,228 715,185 775,228" fill="#92400e" />
            <polygon points="665,228 715,193 765,228" fill="#78350f" />

            <rect x="682" y="240" width="18" height="20" rx="2" fill="#fbbf24" filter="url(#windowGlow)" />
            <line x1="691" y1="240" x2="691" y2="260" stroke="#78350f" strokeWidth="1.5" />
            <line x1="682" y1="250" x2="700" y2="250" stroke="#78350f" strokeWidth="1.5" />

            <rect x="732" y="240" width="18" height="20" rx="2" fill="#fbbf24" filter="url(#windowGlow)" />
            <line x1="741" y1="240" x2="741" y2="260" stroke="#78350f" strokeWidth="1.5" />
            <line x1="732" y1="250" x2="750" y2="250" stroke="#78350f" strokeWidth="1.5" />

            <rect x="707" y="252" width="16" height="38" fill="#b45309" rx="1" />
            <circle cx="719" cy="270" r="1.5" fill="#fef08a" />
          </g>

          {/* Chicken coop */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-105"
            style={ORIGIN_BASE}
            onClick={() => triggerAnimal('coop', 'coop', '🛖')}
          >
            <rect x="45" y="260" width="55" height="42" fill="#b45309" rx="2" />
            <polygon points="40,260 72,238 105,260" fill="#78350f" />
            <circle cx="72" cy="282" r="9" fill="#451a03" />
            <polygon points="66,290 78,290 84,310 72,310" fill="#d97706" />
          </g>

          {/* Goat lean-to */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-105"
            style={ORIGIN_BASE}
            onClick={() => triggerAnimal('goatshed', 'goatshed', '🐐')}
          >
            <line x1="390" y1="255" x2="390" y2="295" stroke="#78350f" strokeWidth="4" />
            <line x1="440" y1="255" x2="440" y2="295" stroke="#78350f" strokeWidth="4" />
            <polygon points="380,260 450,250 452,256 382,266" fill="#ca8a04" />
            <polygon points="380,258 450,248 448,252 378,262" fill="#eab308" />
          </g>

          {/* Fences */}
          <g stroke="#a16207" strokeWidth="2.5" opacity="0.85">
            <line x1="300" y1="280" x2="300" y2="310" strokeWidth="4" />
            <line x1="335" y1="283" x2="335" y2="313" strokeWidth="4" />
            <line x1="370" y1="287" x2="370" y2="317" strokeWidth="4" />
            <line x1="295" y1="288" x2="375" y2="295" />
            <line x1="295" y1="298" x2="375" y2="305" />

            <line x1="620" y1="288" x2="620" y2="318" strokeWidth="4" />
            <line x1="655" y1="285" x2="655" y2="315" strokeWidth="4" />
            <line x1="615" y1="295" x2="660" y2="292" />
            <line x1="615" y1="305" x2="660" y2="302" />
          </g>

          {/* Trees */}
          <g>
            <path d="M 800 295 Q 805 240 812 210" stroke="#78350f" strokeWidth="10" strokeLinecap="round" />
            <motion.g
              animate={reducedMotion ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={ORIGIN_BASE}
            >
              <ellipse cx="815" cy="185" rx="42" ry="40" fill="#14532d" />
              <ellipse cx="800" cy="175" rx="36" ry="34" fill="#166534" />
              <ellipse cx="830" cy="178" rx="30" ry="28" fill="#15803d" />
            </motion.g>

            <path d="M 30 295 Q 26 230 20 185" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
            <motion.g
              animate={reducedMotion ? undefined : { rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={ORIGIN_BASE}
            >
              <ellipse cx="22" cy="166" rx="38" ry="30" fill="#166534" />
              <ellipse cx="6" cy="174" rx="28" ry="22" fill="#15803d" />
              <ellipse cx="40" cy="172" rx="26" ry="22" fill="#14532d" />
              <path d="M 20 185 Q 0 170 -15 185" stroke="#15803d" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 20 185 Q 35 160 55 175" stroke="#16a34a" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 20 185 Q 15 150 10 135" stroke="#22c55e" strokeWidth="5" fill="none" strokeLinecap="round" />
            </motion.g>
          </g>

          {/* Midground hill, with a rim of light along the crest */}
          <path d="M 0 310 Q 240 270 480 300 T 960 320 L 960 600 L 0 600 Z" fill="url(#hillNearGrad)" />
          <path d="M 0 310 Q 240 270 480 300 T 960 320" fill="none" stroke={activeTheme.ambientLight} strokeWidth="2.5" />

          {/* Painted grass tufts */}
          <g stroke={activeTheme.grassTone} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.55">
            {GRASS_TUFTS.map((t) => (
              <path
                key={t.id}
                d={`M ${t.x} ${t.y} q -2 ${-t.h / 2} ${-t.l} ${-t.h} M ${t.x} ${t.y} q 1 ${-t.h / 2} ${t.l} ${-t.h}`}
              />
            ))}
          </g>

          {/* ════════ 3. POND ════════ */}
          <g
            className="cursor-pointer"
            onClick={() => triggerAnimal('pond', 'pond', '🦆')}
          >
            <ellipse cx="730" cy="430" rx="165" ry="75" fill="#14532d" opacity="0.6" />
            <ellipse cx="730" cy="432" rx="158" ry="70" fill="#15803d" opacity="0.5" />

            <ellipse cx="730" cy="435" rx="150" ry="64" fill="url(#pondGrad)" />
            <ellipse cx="730" cy="445" rx="140" ry="52" fill="url(#pondDepth)" />
            <ellipse cx="715" cy="425" rx="115" ry="42" fill="url(#waterSheen)" />
            <ellipse cx="730" cy="435" rx="150" ry="64" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />

            {/* Sun / moon shimmer on the water */}
            <motion.ellipse
              cx="790" cy="418" rx="38" ry="4" fill={activeTheme.sunCore} opacity="0.35"
              animate={reducedMotion ? undefined : { rx: [28, 46, 28], opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Ripples */}
            <motion.ellipse
              cx="720" cy="435" rx="40" ry="16" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6"
              animate={reducedMotion ? undefined : { rx: [30, 85], ry: [12, 32], opacity: [0.7, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.ellipse
              cx="750" cy="445" rx="25" ry="10" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.5"
              animate={reducedMotion ? undefined : { rx: [20, 65], ry: [8, 24], opacity: [0.6, 0] }}
              transition={{ duration: 3.8, delay: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />

            {/* Water lilies */}
            <g transform="translate(640, 440)">
              <ellipse cx="0" cy="0" rx="14" ry="6" fill="#166534" />
              <circle cx="0" cy="-3" r="4.5" fill="#f472b6" />
              <circle cx="0" cy="-3" r="2" fill="#fef08a" />
            </g>
            <g transform="translate(805, 455)">
              <ellipse cx="0" cy="0" rx="16" ry="7" fill="#15803d" />
              <circle cx="0" cy="-3" r="5" fill="#fbcfe8" />
              <circle cx="0" cy="-3" r="2.5" fill="#fbbf24" />
            </g>

            {/* Leaping fish */}
            <AnimatePresence>
              {fishLeap && (
                <motion.g
                  initial={{ x: 740, y: 440, opacity: 0, rotate: -40 }}
                  animate={{ x: 755, y: 400, opacity: 1, rotate: 15 }}
                  exit={{ x: 770, y: 445, opacity: 0, rotate: 60 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                  <ellipse cx="0" cy="0" rx="10" ry="4" fill="#cbd5e1" />
                  <polygon points="-8,0 -14,-4 -14,4" fill="#94a3b8" />
                  <circle cx="7" cy="-1" r="1" fill="#0f172a" />
                  <circle cx="-2" cy="8" r="1.5" fill="#e0f2fe" />
                  <circle cx="5" cy="10" r="1.2" fill="#e0f2fe" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Ducks glide across the water, fading in and out at the edges */}
            <g transform="translate(0, 415)">
              <motion.g
                initial={{ x: 690, opacity: 1 }}
                animate={reducedMotion ? { x: 690 } : { x: [650, 722], opacity: [0, 1, 1, 0] }}
                transition={{
                  x: { duration: 16, repeat: Infinity, ease: 'linear' },
                  opacity: { duration: 16, repeat: Infinity, times: [0, 0.1, 0.9, 1], ease: 'linear' },
                }}
              >
                <ellipse cx="0" cy="0" rx="14" ry="9" fill="#ffffff" />
                <circle cx="11" cy="-7" r="7" fill="#ffffff" />
                <polygon points="17,-6 24,-5 17,-3" fill="#f59e0b" />
                <circle cx="13" cy="-8" r="1.2" fill="#0f172a" />
                <path d="M -6 0 Q 0 -5 6 0" stroke="#e2e8f0" strokeWidth="1.5" fill="none" />

                <g transform="translate(-16, 4)">
                  <ellipse cx="0" cy="0" rx="7" ry="5" fill="#fde047" />
                  <circle cx="5" cy="-4" r="4" fill="#fde047" />
                  <polygon points="9,-3 13,-2 9,-1" fill="#f97316" />
                  <circle cx="6" cy="-4" r="0.8" fill="#0f172a" />
                </g>
                <g transform="translate(-28, 7)">
                  <ellipse cx="0" cy="0" rx="6" ry="4" fill="#fde047" />
                  <circle cx="4" cy="-3" r="3.5" fill="#fde047" />
                  <polygon points="7,-3 11,-2 7,-1" fill="#f97316" />
                  <circle cx="5" cy="-4" r="0.7" fill="#0f172a" />
                </g>
              </motion.g>
            </g>

            {/* Reeds */}
            <g stroke="#15803d" strokeWidth="2.5" fill="none">
              <motion.path
                d="M 605 450 Q 600 400 595 380"
                animate={reducedMotion ? undefined : { d: [
                  'M 605 450 Q 600 400 595 380',
                  'M 605 450 Q 604 400 600 380',
                  'M 605 450 Q 600 400 595 380',
                ] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <ellipse cx="595" cy="385" rx="3.5" ry="12" fill="#78350f" stroke="none" />

              <motion.path
                d="M 615 455 Q 618 410 622 390"
                animate={reducedMotion ? undefined : { d: [
                  'M 615 455 Q 618 410 622 390',
                  'M 615 455 Q 613 410 616 390',
                  'M 615 455 Q 618 410 622 390',
                ] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <ellipse cx="622" cy="395" rx="3.5" ry="11" fill="#78350f" stroke="none" />

              <motion.path
                d="M 865 460 Q 872 420 878 395"
                animate={reducedMotion ? undefined : { d: [
                  'M 865 460 Q 872 420 878 395',
                  'M 865 460 Q 866 420 870 395',
                  'M 865 460 Q 872 420 878 395',
                ] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <ellipse cx="878" cy="400" rx="3.5" ry="13" fill="#78350f" stroke="none" />
            </g>
          </g>

          {/* ════════ 4. ANIMALS ════════ */}
          {/* Each animal: outer <g> fixes the position, inner <g> handles hover scale */}

          {/* Cow */}
          <g transform="translate(240, 360)">
            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              style={ORIGIN_BASE}
              onClick={() => triggerAnimal('cow', 'cow', '🐮')}
            >
              <ellipse cx="55" cy="72" rx="55" ry="14" fill="#052e16" opacity="0.4" />

              <rect x="25" y="40" width="10" height="32" rx="3" fill="#e2e8f0" />
              <rect x="25" y="66" width="10" height="6" fill="#1e293b" />
              <rect x="75" y="40" width="10" height="32" rx="3" fill="#e2e8f0" />
              <rect x="75" y="66" width="10" height="6" fill="#1e293b" />

              <rect x="20" y="10" width="75" height="42" rx="18" fill="#f8fafc" />
              <path d="M 35 10 Q 50 18 48 32 Q 38 42 28 35 Z" fill="#1e293b" />
              <path d="M 70 20 Q 85 15 88 30 Q 80 44 68 38 Z" fill="#1e293b" />

              <ellipse cx="32" cy="50" rx="8" ry="6" fill="#fbcfe8" />
              <circle cx="28" cy="54" r="1.5" fill="#f472b6" />
              <circle cx="34" cy="54" r="1.5" fill="#f472b6" />

              <rect x="36" y="42" width="10" height="30" rx="3" fill="#f8fafc" />
              <rect x="36" y="67" width="10" height="5" fill="#1e293b" />
              <rect x="85" y="42" width="10" height="30" rx="3" fill="#f8fafc" />
              <rect x="85" y="67" width="10" height="5" fill="#1e293b" />

              <motion.path
                d="M 20 22 Q 10 35 12 48"
                stroke="#f8fafc" strokeWidth="3.5" fill="none" strokeLinecap="round"
                animate={reducedMotion ? undefined : { d: [
                  'M 20 22 Q 10 35 12 48',
                  'M 20 22 Q 6 30 8 45',
                  'M 20 22 Q 10 35 12 48',
                ] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <ellipse cx="12" cy="48" rx="3.5" ry="5" fill="#1e293b" />

              <rect x="80" y="8" width="16" height="24" rx="6" fill="#f8fafc" />
              <rect x="84" y="24" width="7" height="12" rx="2" fill="#ef4444" />
              <circle cx="87.5" cy="37" r="3" fill="#fbbf24" />

              <g>
                <ellipse cx="102" cy="18" rx="16" ry="13" fill="#f8fafc" />
                <path d="M 96 10 Q 106 12 108 20 Q 98 25 94 18 Z" fill="#1e293b" />

                <motion.ellipse
                  cx="92" cy="8" rx="6" ry="3" fill="#f8fafc"
                  animate={reducedMotion ? undefined : { rotate: [-5, 12, -5] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  style={ORIGIN_MID}
                />
                <ellipse cx="112" cy="8" rx="6" ry="3" fill="#f8fafc" />

                <path d="M 96 7 Q 95 0 98 -2" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 108 7 Q 109 0 106 -2" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                <motion.circle cx="98" cy="15" r="2.5" fill="#0f172a" animate={blink} transition={blinkT} style={ORIGIN_MID} />
                <circle cx="97.5" cy="14" r="0.8" fill="#ffffff" />
                <motion.circle cx="108" cy="15" r="2.5" fill="#0f172a" animate={blink} transition={blinkT} style={ORIGIN_MID} />
                <circle cx="107.5" cy="14" r="0.8" fill="#ffffff" />

                <ellipse cx="114" cy="22" rx="9" ry="7" fill="#fbcfe8" />
                <circle cx="112" cy="22" r="1.5" fill="#be185d" />
                <circle cx="116" cy="22" r="1.5" fill="#be185d" />

                <motion.g
                  animate={reducedMotion ? undefined : { rotate: [-4, 6, -4] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={ORIGIN_TOP}
                >
                  <line x1="116" y1="24" x2="128" y2="28" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="129" cy="28" r="2.5" fill="#ef4444" />
                </motion.g>
              </g>
            </g>
          </g>

          {/* Goat */}
          <g transform="translate(420, 340)">
            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              style={ORIGIN_BASE}
              onClick={() => triggerAnimal('goat', 'goat', '🐐')}
            >
              <ellipse cx="30" cy="62" rx="36" ry="12" fill="#15803d" />
              <ellipse cx="30" cy="60" rx="30" ry="9" fill="#16a34a" />
              <ellipse cx="30" cy="56" rx="28" ry="8" fill="#052e16" opacity="0.35" />

              <line x1="12" y1="30" x2="10" y2="52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
              <line x1="38" y1="30" x2="36" y2="52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="28" cy="24" rx="20" ry="13" fill="#0f172a" />
              <line x1="20" y1="30" x2="22" y2="52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
              <line x1="44" y1="30" x2="48" y2="52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />

              <motion.path
                d="M 8 20 Q 2 15 4 10"
                stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none"
                animate={reducedMotion ? undefined : { rotate: [-10, 20, -10] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                style={ORIGIN_BASE}
              />

              <line x1="42" y1="20" x2="50" y2="10" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
              <ellipse cx="53" cy="8" rx="8" ry="6" fill="#0f172a" />

              <path d="M 50 4 Q 48 -4 44 -6" stroke="#ca8a04" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 54 4 Q 52 -4 48 -6" stroke="#ca8a04" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              <ellipse cx="48" cy="7" rx="4" ry="2" fill="#0f172a" />
              <ellipse cx="56" cy="7" rx="4" ry="2" fill="#0f172a" />

              <circle cx="53" cy="7" r="1.2" fill="#fef08a" />
              <path d="M 56 12 L 58 17 L 55 15" stroke="#e2e8f0" strokeWidth="1.5" fill="none" />
            </g>
          </g>

          {/* Sheep — moved clear of the pond's left shore */}
          <g transform="translate(470, 440)">
            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              style={ORIGIN_BASE}
              onClick={() => triggerAnimal('sheep', 'sheep', '🐑')}
            >
              <ellipse cx="36" cy="54" rx="34" ry="10" fill="#052e16" opacity="0.35" />

              <rect x="18" y="32" width="6" height="20" rx="2" fill="#334155" />
              <rect x="42" y="32" width="6" height="20" rx="2" fill="#334155" />
              <rect x="28" y="34" width="6" height="18" rx="2" fill="#475569" />
              <rect x="52" y="34" width="6" height="18" rx="2" fill="#475569" />

              <g fill="#f8fafc">
                <circle cx="20" cy="22" r="14" />
                <circle cx="34" cy="16" r="16" />
                <circle cx="50" cy="20" r="15" />
                <circle cx="44" cy="30" r="14" />
                <circle cx="28" cy="32" r="15" />
                <circle cx="36" cy="24" r="16" />
              </g>

              <ellipse cx="60" cy="22" rx="10" ry="8" fill="#334155" />
              <circle cx="58" cy="14" r="5" fill="#f8fafc" />
              <circle cx="62" cy="14" r="4.5" fill="#f8fafc" />

              <circle cx="60" cy="20" r="1.5" fill="#f472b6" opacity="0.7" />
              <circle cx="63" cy="19" r="1.4" fill="#ffffff" />
              <circle cx="63" cy="19" r="0.8" fill="#0f172a" />
              <ellipse cx="54" cy="22" rx="5" ry="2.5" fill="#1e293b" />
            </g>
          </g>

          {/* Hen & chicks */}
          <g transform="translate(140, 440)">
            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              style={ORIGIN_BASE}
              onClick={() => triggerAnimal('chicken', 'chicken', '🐔')}
            >
              <ellipse cx="32" cy="34" rx="34" ry="7" fill="#052e16" opacity="0.4" />

              <line x1="16" y1="24" x2="14" y2="34" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="24" y1="24" x2="24" y2="34" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

              <ellipse cx="20" cy="16" rx="16" ry="12" fill="#fef3c7" />
              <path d="M 12 14 Q 22 8 26 18 Q 18 22 12 14 Z" fill="#fde047" />

              <polygon points="4,14 0,6 8,10" fill="#d97706" />
              <polygon points="6,16 2,8 10,12" fill="#b45309" />

              <circle cx="30" cy="10" r="7" fill="#fef3c7" />
              <path d="M 28 4 Q 30 0 32 4 Q 34 0 36 5" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="34" cy="15" r="2.2" fill="#ef4444" />
              <polygon points="36,9 41,11 36,13" fill="#f59e0b" />
              <circle cx="32" cy="9" r="1.2" fill="#0f172a" />

              <g transform="translate(46, 14)">
                <ellipse cx="0" cy="0" rx="5" ry="4" fill="#facc15" />
                <circle cx="3" cy="-3" r="3" fill="#facc15" />
                <polygon points="5,-3 8,-2 5,-1" fill="#f97316" />
                <circle cx="4" cy="-3" r="0.8" fill="#0f172a" />
                <line x1="0" y1="4" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.5" />
              </g>

              <g transform="translate(60, 14)">
                <motion.g
                  animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ellipse cx="0" cy="0" rx="4.5" ry="3.5" fill="#facc15" />
                  <circle cx="3" cy="-3" r="2.8" fill="#facc15" />
                  <polygon points="5,-3 7,-2 5,-1" fill="#f97316" />
                  <circle cx="3.5" cy="-3" r="0.7" fill="#0f172a" />
                  <line x1="0" y1="3" x2="0" y2="7" stroke="#f59e0b" strokeWidth="1.5" />
                </motion.g>
              </g>
            </g>
          </g>

          {/* Butterflies — drawn over the meadow, where they actually flutter */}
          <g opacity="0.85">
            {BUTTERFLIES.map((b, index) => (
              <g key={b.id} transform={`translate(${b.x} ${b.y + 90}) scale(${b.scale})`}>
                <motion.g
                  style={ORIGIN_MID}
                  animate={reducedMotion ? { opacity: 0.7 } : { x: [0, 22, -14, 0], y: [0, -14, 12, 0], rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 7 + index * 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d="M -6 0 Q 0 -9 6 0 Q 0 9 -6 0 Z" fill={b.color} opacity="0.9" />
                  <path d="M 0 -8 Q 4 -3 0 0 M 0 -8 Q -4 -3 0 0" stroke="#f8fafc" strokeWidth="1.4" fill="none" />
                </motion.g>
              </g>
            ))}
          </g>

          {/* ════════ 5. FOREGROUND ════════ */}
          {/* Front hill frames the bottom edge */}
          <path d="M 0 505 Q 200 475 420 510 T 960 490 L 960 600 L 0 600 Z" fill={activeTheme.hillFront} />
          <path d="M 0 505 Q 200 475 420 510 T 960 490 L 960 600 L 0 600 Z" fill="#000" opacity="0.18" />
          <path d="M 0 505 Q 200 475 420 510 T 960 490" fill="none" stroke={activeTheme.ambientLight} strokeWidth="2" />

          <g fill={activeTheme.grassTone} stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round">
            <path d="M 60 520 Q 55 490 48 480 M 60 520 Q 64 485 70 475 M 60 520 Q 75 495 85 490" fill="none" />
            <circle cx="70" cy="473" r="3" fill={activeTheme.flowerTones[0]} stroke="none" />
            <circle cx="48" cy="478" r="2.5" fill={activeTheme.flowerTones[1]} stroke="none" />

            <path d="M 380 540 Q 375 510 368 495 M 380 540 Q 384 505 390 490 M 380 540 Q 395 515 405 508" fill="none" />
            <circle cx="390" cy="488" r="3" fill={activeTheme.flowerTones[2]} stroke="none" />
            <circle cx="405" cy="506" r="2.5" fill={activeTheme.flowerTones[3]} stroke="none" />

            <path d="M 880 520 Q 875 490 870 475 M 880 520 Q 886 485 895 470" fill="none" />
            <circle cx="895" cy="468" r="3" fill="#f43f5e" stroke="none" />
          </g>

          {/* Swaying wildflowers */}
          <g>
            {FLOWERS.map((f) => (
              <g key={f.id} transform={`translate(${f.x} ${f.y})`}>
                <motion.g
                  style={ORIGIN_BASE}
                  animate={reducedMotion ? undefined : { rotate: [-4, 4, -4] }}
                  transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d={`M 0 0 Q 1 ${-f.h / 2} 0 ${-f.h}`} stroke={activeTheme.grassTone} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <circle cx="0" cy={-f.h} r={f.r} fill={activeTheme.flowerTones[f.tone]} />
                  <circle cx="0" cy={-f.h} r={f.r * 0.4} fill="#fef08a" opacity="0.85" />
                </motion.g>
              </g>
            ))}
          </g>

          {/* Fireflies */}
          {activeTheme.fireflies && (
            <g>
              {FIREFLIES.map((f) => (
                <motion.circle
                  key={f.id}
                  cx={f.x} cy={f.y} r={f.r}
                  fill="#fde047"
                  filter="url(#softGlow)"
                  animate={reducedMotion ? { opacity: 0.6 } : {
                    opacity: [0.15, 0.95, 0.2],
                    y: [0, f.driftY, 0],
                    x: [0, f.driftX, 0],
                  }}
                  transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </g>
          )}

          {/* Cinematic vignette */}
          <rect width="960" height="600" fill="url(#vignette)" pointerEvents="none" />
        </svg>
      </div>

      {/* ── Bottom status bar ── */}
      <div className="px-4 py-3 bg-white/10 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-100/90">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>{t('home.scene.clickStory')}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-emerald-200/75 flex-wrap">
          <span className="inline-flex items-center gap-1"><Droplets className="h-3 w-3" /> {t('home.scene.bioflocPond')}</span>
          <span className="inline-flex items-center gap-1"><Wind className="h-3 w-3" /> {t('home.scene.deltaBreeze')}</span>
          <span className="inline-flex items-center gap-1"><Bird className="h-3 w-3" /> {t('home.scene.migratoryBirds')}</span>
          <span className="inline-flex items-center gap-1"><Fish className="h-3 w-3" /> {t('home.scene.tilapiaActive')}</span>
        </div>
      </div>
    </div>
  )
}
