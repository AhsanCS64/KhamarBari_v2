import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, Heart, Sun, CloudSun, Moon, Volume2, VolumeX } from 'lucide-react'

// Mood-based color palette for the pasture canvas
const PASTURE_THEMES = {
  morning: {
    skyTop: '#0d462f',
    skyBottom: '#186a4a',
    hillFar: '#0b3726',
    hillMid: '#115338',
    hillNear: '#166946',
    hillFront: '#1d8055',
    pondWater: '#2dd4bf',
    pondShine: '#5eead4',
    sunGlow: 'rgba(254, 215, 102, 0.4)',
    accentTag: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    ambientLight: 'rgba(254, 240, 138, 0.12)',
    fireflies: false,
  },
  meadow: {
    skyTop: '#064e3b',
    skyBottom: '#047857',
    hillFar: '#064434',
    hillMid: '#065f46',
    hillNear: '#059669',
    hillFront: '#10b981',
    pondWater: '#38bdf8',
    pondShine: '#7dd3fc',
    sunGlow: 'rgba(250, 204, 21, 0.45)',
    accentTag: 'bg-teal-500/20 text-teal-200 border-teal-400/30',
    ambientLight: 'rgba(167, 243, 208, 0.14)',
    fireflies: false,
  },
  harvest: {
    skyTop: '#451a03',
    skyBottom: '#78350f',
    hillFar: '#3d1604',
    hillMid: '#572205',
    hillNear: '#7c2d12',
    hillFront: '#9a3412',
    pondWater: '#0284c7',
    pondShine: '#38bdf8',
    sunGlow: 'rgba(251, 191, 36, 0.55)',
    accentTag: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    ambientLight: 'rgba(253, 230, 138, 0.16)',
    fireflies: false,
  },
  dusk: {
    skyTop: '#03171e',
    skyBottom: '#083344',
    hillFar: '#021e25',
    hillMid: '#042f38',
    hillNear: '#07434f',
    hillFront: '#0e5a6a',
    pondWater: '#0369a1',
    pondShine: '#38bdf8',
    sunGlow: 'rgba(249, 115, 22, 0.35)',
    accentTag: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
    ambientLight: 'rgba(56, 189, 248, 0.1)',
    fireflies: true,
  },
}

export default function AnimatedPastureScene({ mood = 'morning' }) {
  const reducedMotion = useReducedMotion()
  const theme = PASTURE_THEMES[mood] || PASTURE_THEMES.morning

  // Interactive animal states
  const [activeSpeech, setActiveSpeech] = useState(null)
  const [happiness, setHappiness] = useState(100)
  const [feedEffect, setFeedEffect] = useState(false)
  const [feedGrains, setFeedGrains] = useState([])
  const [waterRipples, setWaterRipples] = useState([1, 2])
  const [duckPosition, setDuckPosition] = useState(0)
  const [fishLeap, setFishLeap] = useState(false)

  // Floating speech bubble timeout
  useEffect(() => {
    if (!activeSpeech) return
    const timer = setTimeout(() => setActiveSpeech(null), 3800)
    return () => clearTimeout(timer)
  }, [activeSpeech])

  // Periodic fish jump
  useEffect(() => {
    if (reducedMotion) return
    const interval = setInterval(() => {
      setFishLeap(true)
      setTimeout(() => setFishLeap(false), 1400)
    }, 6500)
    return () => clearInterval(interval)
  }, [reducedMotion])

  // Duck swimming progression
  useEffect(() => {
    if (reducedMotion) return
    const interval = setInterval(() => {
      setDuckPosition((prev) => (prev >= 60 ? -10 : prev + 0.8))
    }, 120)
    return () => clearInterval(interval)
  }, [reducedMotion])

  // Handle scatter feed action
  const handleScatterFeed = () => {
    setFeedEffect(true)
    setHappiness((prev) => Math.min(100, prev + 5))
    setActiveSpeech({
      id: 'all',
      title: 'Pasture Celebration! 🌾',
      message: 'All animals are happily feeding on fresh, organic grains!',
      icon: '✨',
    })

    // Generate falling grain positions
    const grains = Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 40,
      delay: Math.random() * 0.4,
    }))
    setFeedGrains(grains)

    setTimeout(() => {
      setFeedEffect(false)
      setFeedGrains([])
    }, 2800)
  }

  const triggerAnimal = (id, title, message, icon) => {
    setActiveSpeech({ id, title, message, icon })
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-forest-950/40 backdrop-blur-md select-none group">
      {/* Top pasture bar with interactive controls */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${theme.accentTag}`}>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Living Pasture</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/10 text-emerald-100 border border-white/10 backdrop-blur-md">
            <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />
            <span>Health: {happiness}%</span>
          </span>
        </div>

        {/* Scatter feed button */}
        <button
          onClick={handleScatterFeed}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-forest-950 bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-200 hover:to-yellow-300 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          title="Scatter feed to delight all animals"
        >
          <span>🌾 Scatter Feed</span>
        </button>
      </div>

      {/* Floating Interactive Speech Bubble */}
      <AnimatePresence>
        {activeSpeech && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] sm:w-auto bg-white/95 text-forest-950 px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-200 backdrop-blur-md flex items-center gap-3 pointer-events-auto"
          >
            <span className="text-2xl" role="img" aria-hidden="true">{activeSpeech.icon}</span>
            <div className="text-left">
              <strong className="block text-xs font-bold text-forest-900 leading-tight">
                {activeSpeech.title}
              </strong>
              <span className="text-[11px] text-forest-700 leading-snug">
                {activeSpeech.message}
              </span>
            </div>
            <button
              onClick={() => setActiveSpeech(null)}
              className="ml-auto text-forest-400 hover:text-forest-700 text-xs font-bold px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Falling Feed Grains Animation */}
      <AnimatePresence>
        {feedGrains.map((g) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 1, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: 160, scale: 1 }}
            transition={{ duration: 1.6, delay: g.delay, ease: 'easeIn' }}
            style={{ left: `${g.x}%`, top: `${g.y}%` }}
            className="absolute z-25 pointer-events-none text-xs text-amber-300 drop-shadow-md"
          >
            🌾
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Artistic Landscape SVG Canvas */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10]">
        <svg
          viewBox="0 0 960 600"
          className="w-full h-full object-cover transition-colors duration-1000 ease-out"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Artistic living farm pasture illustration"
        >
          <defs>
            {/* Sky Gradient */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.skyTop} />
              <stop offset="100%" stopColor={theme.skyBottom} />
            </linearGradient>

            {/* Hill Gradients */}
            <linearGradient id="hillFarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.hillFar} />
              <stop offset="100%" stopColor={theme.hillMid} />
            </linearGradient>
            <linearGradient id="hillNearGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.hillNear} />
              <stop offset="100%" stopColor={theme.hillFront} />
            </linearGradient>

            {/* Pond Gradient */}
            <linearGradient id="pondGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={theme.pondWater} />
              <stop offset="100%" stopColor={theme.pondShine} />
            </linearGradient>

            {/* Shimmer water filter */}
            <linearGradient id="waterSheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>

            {/* Warm window glow */}
            <filter id="windowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ================= 1. SKY & DISTANT MOUNTAINS ================= */}
          <rect width="960" height="600" fill="url(#skyGrad)" />

          {/* Sun / Moon celestial aura */}
          <g transform="translate(820, 90)">
            <circle r="52" fill={theme.sunGlow} className="animate-pulse" />
            <circle r="36" fill={mood === 'dusk' ? '#fde047' : '#fef08a'} />
            {mood === 'dusk' && (
              <circle cx="10" cy="-6" r="30" fill={theme.skyTop} opacity="0.85" />
            )}
          </g>

          {/* Distant soft clouds */}
          <g opacity="0.45" fill="#ffffff">
            <ellipse cx="220" cy="90" rx="65" ry="18" />
            <ellipse cx="250" cy="80" rx="45" ry="24" />
            <ellipse cx="610" cy="130" rx="80" ry="20" />
            <ellipse cx="650" cy="120" rx="50" ry="26" />
          </g>

          {/* Distant soft mountain silhouette */}
          <path
            d="M 0 320 Q 180 230 380 290 T 780 260 Q 880 280 960 300 L 960 600 L 0 600 Z"
            fill="url(#hillFarGrad)"
            opacity="0.85"
          />

          {/* ================= 2. BACKGROUND HOMES & BARNS ================= */}
          {/* Main Red Barn & Silo (Left-Center) */}
          <g
            className="cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            onClick={() => triggerAnimal('barn', 'Cozy Main Barn', 'Shelters 40 milking cows and stored fresh sweet clover hay.', '🏡')}
          >
            {/* Silo */}
            <rect x="130" y="190" width="42" height="100" rx="4" fill="#64748b" />
            <path d="M 126 190 Q 151 160 176 190 Z" fill="#475569" />
            {/* Silo rings */}
            <line x1="130" y1="215" x2="172" y2="215" stroke="#475569" strokeWidth="2" />
            <line x1="130" y1="240" x2="172" y2="240" stroke="#475569" strokeWidth="2" />
            <line x1="130" y1="265" x2="172" y2="265" stroke="#475569" strokeWidth="2" />

            {/* Barn structure */}
            <polygon points="165,220 225,175 285,220 285,290 165,290" fill="#991b1b" />
            {/* Gambrel Roof */}
            <polygon points="160,222 225,170 290,222 284,226 225,176 166,226" fill="#f87171" />
            <polygon points="160,222 175,200 225,170 275,200 290,222" fill="#b91c1c" />

            {/* Weather-vane on barn */}
            <line x1="225" y1="170" x2="225" y2="152" stroke="#d4d4d8" strokeWidth="2" />
            <polygon points="225,152 233,148 225,144" fill="#fbbf24" />
            <circle cx="225" cy="148" r="2.5" fill="#f59e0b" />

            {/* Barn Door (white cross trim) */}
            <rect x="205" y="240" width="40" height="50" fill="#7f1d1d" rx="2" />
            <rect x="208" y="243" width="34" height="47" fill="#450a0a" />
            {/* White X trim on door */}
            <line x1="208" y1="243" x2="242" y2="290" stroke="#fecaca" strokeWidth="2.5" />
            <line x1="242" y1="243" x2="208" y2="290" stroke="#fecaca" strokeWidth="2.5" />

            {/* Loft Hay Window with warm glow */}
            <polygon points="215,205 225,195 235,205 235,220 215,220" fill="#fef08a" filter="url(#windowGlow)" />
            {/* Peeking Hay */}
            <ellipse cx="225" cy="222" rx="12" ry="4" fill="#f59e0b" />
          </g>

          {/* Farmhouse Cottage with Chimney (Right-Center) */}
          <g
            className="cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            onClick={() => triggerAnimal('house', 'Farmer Cottage', 'Family home since 1994. Fresh chai is brewing on the stove!', '☕')}
          >
            {/* Chimney & Smoke */}
            <rect x="735" y="195" width="16" height="35" fill="#78350f" />
            <motion.circle
              cx="743"
              cy="185"
              r="6"
              fill="#e2e8f0"
              opacity="0.6"
              animate={reducedMotion ? undefined : { cy: [185, 155], r: [6, 14], opacity: [0.6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.circle
              cx="745"
              cy="175"
              r="8"
              fill="#e2e8f0"
              opacity="0.5"
              animate={reducedMotion ? undefined : { cy: [175, 140], r: [8, 18], opacity: [0.5, 0] }}
              transition={{ duration: 3.2, delay: 1, repeat: Infinity, ease: 'easeOut' }}
            />

            {/* Cottage walls */}
            <rect x="670" y="225" width="90" height="65" fill="#fef3c7" rx="3" />
            {/* Slanted cottage roof */}
            <polygon points="655,228 715,185 775,228" fill="#92400e" />
            {/* Roof overhang shadow */}
            <polygon points="665,228 715,193 765,228" fill="#78350f" />

            {/* Glowing Windows */}
            <rect x="682" y="240" width="18" height="20" rx="2" fill="#fbbf24" filter="url(#windowGlow)" />
            <line x1="691" y1="240" x2="691" y2="260" stroke="#78350f" strokeWidth="1.5" />
            <line x1="682" y1="250" x2="700" y2="250" stroke="#78350f" strokeWidth="1.5" />

            <rect x="732" y="240" width="18" height="20" rx="2" fill="#fbbf24" filter="url(#windowGlow)" />
            <line x1="741" y1="240" x2="741" y2="260" stroke="#78350f" strokeWidth="1.5" />
            <line x1="732" y1="250" x2="750" y2="250" stroke="#78350f" strokeWidth="1.5" />

            {/* Cottage door */}
            <rect x="707" y="252" width="16" height="38" fill="#b45309" rx="1" />
            <circle cx="719" cy="270" r="1.5" fill="#fef08a" />
          </g>

          {/* Chicken Coop (Far Left) */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={() => triggerAnimal('coop', 'Hen House & Nesting Boxes', 'Fresh straw nests. Egg collection is 98% Grade A!', '🛖')}
          >
            <rect x="45" y="260" width="55" height="42" fill="#b45309" rx="2" />
            <polygon points="40,260 72,238 105,260" fill="#78350f" />
            {/* Coop circular door & ramp */}
            <circle cx="72" cy="282" r="9" fill="#451a03" />
            <polygon points="66,290 78,290 84,310 72,310" fill="#d97706" />
          </g>

          {/* Goat Rustic Lean-to Shelter (Back-Center) */}
          <g
            className="cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={() => triggerAnimal('goatshed', 'Goat Pavilion', 'Raised slatted wooden floor keeping goats dry and lively.', '🐐')}
          >
            {/* 4 Wooden Posts */}
            <line x1="390" y1="255" x2="390" y2="295" stroke="#78350f" strokeWidth="4" />
            <line x1="440" y1="255" x2="440" y2="295" stroke="#78350f" strokeWidth="4" />
            {/* Slanted Thatch Roof */}
            <polygon points="380,260 450,250 452,256 382,266" fill="#ca8a04" />
            <polygon points="380,258 450,248 448,252 378,262" fill="#eab308" />
          </g>

          {/* Wooden Rustic Pasture Fences */}
          <g stroke="#a16207" strokeWidth="2.5" opacity="0.85">
            {/* Fence posts */}
            <line x1="300" y1="280" x2="300" y2="310" strokeWidth="4" />
            <line x1="335" y1="283" x2="335" y2="313" strokeWidth="4" />
            <line x1="370" y1="287" x2="370" y2="317" strokeWidth="4" />
            {/* Fence rails */}
            <line x1="295" y1="288" x2="375" y2="295" />
            <line x1="295" y1="298" x2="375" y2="305" />

            {/* Right side fence */}
            <line x1="620" y1="288" x2="620" y2="318" strokeWidth="4" />
            <line x1="655" y1="285" x2="655" y2="315" strokeWidth="4" />
            <line x1="615" y1="295" x2="660" y2="292" />
            <line x1="615" y1="305" x2="660" y2="302" />
          </g>

          {/* Lush Background Mango & Banana Trees */}
          <g>
            {/* Big Mango Tree behind cottage */}
            <path d="M 800 295 Q 805 240 812 210" stroke="#78350f" strokeWidth="10" strokeLinecap="round" />
            <ellipse cx="815" cy="185" rx="42" ry="40" fill="#14532d" />
            <ellipse cx="800" cy="175" rx="36" ry="34" fill="#166534" />
            <ellipse cx="830" cy="178" rx="30" ry="28" fill="#15803d" />

            {/* Banana Palm Tree on left near coop */}
            <path d="M 30 295 Q 26 230 20 185" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
            <path d="M 20 185 Q 0 170 -15 185" stroke="#15803d" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M 20 185 Q 35 160 55 175" stroke="#16a34a" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M 20 185 Q 15 150 10 135" stroke="#22c55e" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>

          {/* ================= 3. MIDGROUND PASTURE HILL ================= */}
          <path
            d="M 0 310 Q 240 270 480 300 T 960 320 L 960 600 L 0 600 Z"
            fill="url(#hillNearGrad)"
          />

          {/* ================= 4. THE SERENE POND (RIGHT SIDE) ================= */}
          <g
            className="cursor-pointer"
            onClick={() => triggerAnimal('pond', 'Sparkling Duck Pond', 'Oxygenated earthen pond home to ducks, tilapia & freshwater lilies.', '🦆')}
          >
            {/* Pond earthen bank rim */}
            <ellipse cx="730" cy="430" rx="165" ry="75" fill="#14532d" opacity="0.6" />
            <ellipse cx="730" cy="432" rx="158" ry="70" fill="#15803d" opacity="0.5" />

            {/* Pond Water Basin */}
            <ellipse cx="730" cy="435" rx="150" ry="64" fill="url(#pondGrad)" />
            {/* Water surface reflection sheen */}
            <ellipse cx="715" cy="425" rx="115" ry="42" fill="url(#waterSheen)" />

            {/* Animated Water Ripples */}
            <motion.ellipse
              cx="720"
              cy="435"
              rx="40"
              ry="16"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity="0.6"
              animate={reducedMotion ? undefined : { rx: [30, 85], ry: [12, 32], opacity: [0.7, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.ellipse
              cx="750"
              cy="445"
              rx="25"
              ry="10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.5"
              animate={reducedMotion ? undefined : { rx: [20, 65], ry: [8, 24], opacity: [0.6, 0] }}
              transition={{ duration: 3.8, delay: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />

            {/* Water Lilies & Shapla Lotus */}
            <g transform="translate(640, 440)">
              <ellipse cx="0" cy="0" rx="14" ry="6" fill="#166534" />
              {/* Pink water lily bloom */}
              <circle cx="0" cy="-3" r="4.5" fill="#f472b6" />
              <circle cx="0" cy="-3" r="2" fill="#fef08a" />
            </g>
            <g transform="translate(805, 455)">
              <ellipse cx="0" cy="0" rx="16" ry="7" fill="#15803d" />
              <circle cx="0" cy="-3" r="5" fill="#fbcfe8" />
              <circle cx="0" cy="-3" r="2.5" fill="#fbbf24" />
            </g>

            {/* Leaping Silver Fish */}
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
                  {/* Droplets splash */}
                  <circle cx="-2" cy="8" r="1.5" fill="#e0f2fe" />
                  <circle cx="5" cy="10" r="1.2" fill="#e0f2fe" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Swimming Mother Duck + 2 Ducklings */}
            <g transform={`translate(${660 + duckPosition}, 415)`}>
              {/* Mother Duck */}
              <ellipse cx="0" cy="0" rx="14" ry="9" fill="#ffffff" />
              <circle cx="11" cy="-7" r="7" fill="#ffffff" />
              {/* Yellow Beak */}
              <polygon points="17,-6 24,-5 17,-3" fill="#f59e0b" />
              {/* Eye */}
              <circle cx="13" cy="-8" r="1.2" fill="#0f172a" />
              {/* Wing ripple */}
              <path d="M -6 0 Q 0 -5 6 0" stroke="#e2e8f0" strokeWidth="1.5" fill="none" />

              {/* Duckling 1 */}
              <g transform="translate(-16, 4)">
                <ellipse cx="0" cy="0" rx="7" ry="5" fill="#fde047" />
                <circle cx="5" cy="-4" r="4" fill="#fde047" />
                <polygon points="9,-3 13,-2 9,-1" fill="#f97316" />
                <circle cx="6" cy="-4" r="0.8" fill="#0f172a" />
              </g>

              {/* Duckling 2 */}
              <g transform="translate(-28, 7)">
                <ellipse cx="0" cy="0" rx="6" ry="4" fill="#fde047" />
                <circle cx="4" cy="-3" r="3.5" fill="#fde047" />
                <polygon points="7,-3 11,-2 7,-1" fill="#f97316" />
                <circle cx="5" cy="-4" r="0.7" fill="#0f172a" />
              </g>
            </g>

            {/* Swaying Cattails & Reeds at the pond edge */}
            <g stroke="#15803d" strokeWidth="2.5" fill="none">
              <path d="M 605 450 Q 600 400 595 380" />
              <ellipse cx="595" cy="385" rx="3.5" ry="12" fill="#78350f" stroke="none" />

              <path d="M 615 455 Q 618 410 622 390" />
              <ellipse cx="622" cy="395" rx="3.5" ry="11" fill="#78350f" stroke="none" />

              <path d="M 865 460 Q 872 420 878 395" />
              <ellipse cx="878" cy="400" rx="3.5" ry="13" fill="#78350f" stroke="none" />
            </g>
          </g>

          {/* ================= 5. THE ANIMALS ON THE PASTURE ================= */}

          {/* ----- 5A. THE COW (CENTER-LEFT) ----- */}
          <g
            className="cursor-pointer group/cow transition-transform duration-300 hover:scale-105"
            transform="translate(240, 360)"
            onClick={() => triggerAnimal('cow', 'Laxmi the Deshi-Holstein Cow', 'Produces 18 litres of creamy milk daily. Loves fresh napier grass!', '🐮')}
          >
            {/* Cow shadow */}
            <ellipse cx="55" cy="72" rx="55" ry="14" fill="#052e16" opacity="0.4" />

            {/* Back Legs */}
            <rect x="25" y="40" width="10" height="32" rx="3" fill="#e2e8f0" />
            <rect x="25" y="66" width="10" height="6" fill="#1e293b" />
            <rect x="75" y="40" width="10" height="32" rx="3" fill="#e2e8f0" />
            <rect x="75" y="66" width="10" height="6" fill="#1e293b" />

            {/* Body */}
            <rect x="20" y="10" width="75" height="42" rx="18" fill="#f8fafc" />
            {/* Black spots on body */}
            <path d="M 35 10 Q 50 18 48 32 Q 38 42 28 35 Z" fill="#1e293b" />
            <path d="M 70 20 Q 85 15 88 30 Q 80 44 68 38 Z" fill="#1e293b" />

            {/* Udder with soft pink */}
            <ellipse cx="32" cy="50" rx="8" ry="6" fill="#fbcfe8" />
            <circle cx="28" cy="54" r="1.5" fill="#f472b6" />
            <circle cx="34" cy="54" r="1.5" fill="#f472b6" />

            {/* Front Legs */}
            <rect x="36" y="42" width="10" height="30" rx="3" fill="#f8fafc" />
            <rect x="36" y="67" width="10" height="5" fill="#1e293b" />
            <rect x="85" y="42" width="10" height="30" rx="3" fill="#f8fafc" />
            <rect x="85" y="67" width="10" height="5" fill="#1e293b" />

            {/* Swishing Tail */}
            <motion.path
              d="M 20 22 Q 10 35 12 48"
              stroke="#f8fafc"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              animate={reducedMotion ? undefined : { d: ['M 20 22 Q 10 35 12 48', 'M 20 22 Q 6 30 8 45', 'M 20 22 Q 10 35 12 48'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <ellipse cx="12" cy="48" rx="3.5" ry="5" fill="#1e293b" />

            {/* Neck & Head */}
            <rect x="80" y="8" width="16" height="24" rx="6" fill="#f8fafc" />
            {/* Red Bell Collar */}
            <rect x="84" y="24" width="7" height="12" rx="2" fill="#ef4444" />
            <circle cx="87.5" cy="37" r="3" fill="#fbbf24" />

            {/* Head */}
            <g>
              <ellipse cx="102" cy="18" rx="16" ry="13" fill="#f8fafc" />
              {/* Black face patch */}
              <path d="M 96 10 Q 106 12 108 20 Q 98 25 94 18 Z" fill="#1e293b" />

              {/* Ears */}
              <motion.ellipse
                cx="92"
                cy="8"
                rx="6"
                ry="3"
                fill="#f8fafc"
                animate={reducedMotion ? undefined : { rotate: [-5, 12, -5] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
              <ellipse cx="112" cy="8" rx="6" ry="3" fill="#f8fafc" />

              {/* Cute Horns */}
              <path d="M 96 7 Q 95 0 98 -2" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 108 7 Q 109 0 106 -2" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Big gentle eyes */}
              <circle cx="98" cy="15" r="2.5" fill="#0f172a" />
              <circle cx="97.5" cy="14" r="0.8" fill="#ffffff" />
              <circle cx="108" cy="15" r="2.5" fill="#0f172a" />
              <circle cx="107.5" cy="14" r="0.8" fill="#ffffff" />

              {/* Pink Snout */}
              <ellipse cx="114" cy="22" rx="9" ry="7" fill="#fbcfe8" />
              <circle cx="112" cy="22" r="1.5" fill="#be185d" />
              <circle cx="116" cy="22" r="1.5" fill="#be185d" />

              {/* Chewing Clover/Grass */}
              <motion.g
                animate={reducedMotion ? undefined : { rotate: [-4, 6, -4] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <line x1="116" y1="24" x2="128" y2="28" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                <circle cx="129" cy="28" r="2.5" fill="#ef4444" />
              </motion.g>
            </g>
          </g>

          {/* ----- 5B. THE BLACK BENGAL GOAT (MID-CENTER) ----- */}
          <g
            className="cursor-pointer group/goat transition-transform duration-300 hover:scale-105"
            transform="translate(420, 340)"
            onClick={() => triggerAnimal('goat', 'Chhobi the Black Bengal Goat', 'Agile, playful & proud. Bengal goats are world-famous for premium quality!', '🐐')}
          >
            {/* Grassy mound rock the goat is perched on */}
            <ellipse cx="30" cy="62" rx="36" ry="12" fill="#15803d" />
            <ellipse cx="30" cy="60" rx="30" ry="9" fill="#16a34a" />

            {/* Goat Shadow */}
            <ellipse cx="30" cy="56" rx="28" ry="8" fill="#052e16" opacity="0.35" />

            {/* Back Legs */}
            <line x1="12" y1="30" x2="10" y2="52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="38" y1="30" x2="36" y2="52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />

            {/* Body */}
            <ellipse cx="28" cy="24" rx="20" ry="13" fill="#0f172a" />

            {/* Front Legs */}
            <line x1="20" y1="30" x2="22" y2="52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="44" y1="30" x2="48" y2="52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />

            {/* Wagging Tail */}
            <motion.path
              d="M 8 20 Q 2 15 4 10"
              stroke="#0f172a"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              animate={reducedMotion ? undefined : { rotate: [-10, 20, -10] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />

            {/* Head & Neck */}
            <line x1="42" y1="20" x2="50" y2="10" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
            <ellipse cx="53" cy="8" rx="8" ry="6" fill="#0f172a" />

            {/* Curved Horns */}
            <path d="M 50 4 Q 48 -4 44 -6" stroke="#ca8a04" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 54 4 Q 52 -4 48 -6" stroke="#ca8a04" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Perk Ears */}
            <ellipse cx="48" cy="7" rx="4" ry="2" fill="#0f172a" />
            <ellipse cx="56" cy="7" rx="4" ry="2" fill="#0f172a" />

            {/* Eye & Chin Beard */}
            <circle cx="53" cy="7" r="1.2" fill="#fef08a" />
            <path d="M 56 12 L 58 17 L 55 15" stroke="#e2e8f0" strokeWidth="1.5" fill="none" />
          </g>

          {/* ----- 5C. THE FLUFFY SHEEP (FOREGROUND-RIGHT) ----- */}
          <g
            className="cursor-pointer group/sheep transition-transform duration-300 hover:scale-105"
            transform="translate(540, 390)"
            onClick={() => triggerAnimal('sheep', 'Megh the Garole Sheep', 'Fluffy cloud wool, calm demeanor. Adapted to riverine pasturelands.', '🐑')}
          >
            {/* Shadow */}
            <ellipse cx="36" cy="54" rx="34" ry="10" fill="#052e16" opacity="0.35" />

            {/* Tiny legs */}
            <rect x="18" y="32" width="6" height="20" rx="2" fill="#334155" />
            <rect x="42" y="32" width="6" height="20" rx="2" fill="#334155" />
            <rect x="28" y="34" width="6" height="18" rx="2" fill="#475569" />
            <rect x="52" y="34" width="6" height="18" rx="2" fill="#475569" />

            {/* Cloud-like Wool Body (Multi-circle puffs) */}
            <g fill="#f8fafc">
              <circle cx="20" cy="22" r="14" />
              <circle cx="34" cy="16" r="16" />
              <circle cx="50" cy="20" r="15" />
              <circle cx="44" cy="30" r="14" />
              <circle cx="28" cy="32" r="15" />
              <circle cx="36" cy="24" r="16" />
            </g>

            {/* Dark Face & Ears */}
            <ellipse cx="60" cy="22" rx="10" ry="8" fill="#334155" />
            {/* Wool crown on head */}
            <circle cx="58" cy="14" r="5" fill="#f8fafc" />
            <circle cx="62" cy="14" r="4.5" fill="#f8fafc" />

            {/* Soft pink cheeks & shiny eye */}
            <circle cx="60" cy="20" r="1.5" fill="#f472b6" opacity="0.7" />
            <circle cx="63" cy="19" r="1.4" fill="#ffffff" />
            <circle cx="63" cy="19" r="0.8" fill="#0f172a" />

            {/* Droopy adorable ears */}
            <ellipse cx="54" cy="22" rx="5" ry="2.5" fill="#1e293b" />
          </g>

          {/* ----- 5D. HEN & BABY CHICKS (FOREGROUND-LEFT) ----- */}
          <g
            className="cursor-pointer group/hen transition-transform duration-300 hover:scale-105"
            transform="translate(140, 440)"
            onClick={() => triggerAnimal('chicken', 'Rupa the Deshi Hen & Chicks', 'Freerange foraging with 2 fluffy chicks. Zero antibiotics, pure vitality!', '🐔')}
          >
            {/* Hen Shadow */}
            <ellipse cx="22" cy="34" rx="20" ry="7" fill="#052e16" opacity="0.4" />

            {/* Yellow feet */}
            <line x1="16" y1="24" x2="14" y2="34" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="24" y1="24" x2="24" y2="34" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

            {/* Hen Body with speckled feathers */}
            <ellipse cx="20" cy="16" rx="16" ry="12" fill="#fef3c7" />
            {/* Wing */}
            <path d="M 12 14 Q 22 8 26 18 Q 18 22 12 14 Z" fill="#fde047" />

            {/* Tail Feathers upright */}
            <polygon points="4,14 0,6 8,10" fill="#d97706" />
            <polygon points="6,16 2,8 10,12" fill="#b45309" />

            {/* Head & Red Comb */}
            <circle cx="30" cy="10" r="7" fill="#fef3c7" />
            {/* Red Comb */}
            <path d="M 28 4 Q 30 0 32 4 Q 34 0 36 5" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Red Wattle */}
            <circle cx="34" cy="15" r="2.2" fill="#ef4444" />
            {/* Beak & Eye */}
            <polygon points="36,9 41,11 36,13" fill="#f59e0b" />
            <circle cx="32" cy="9" r="1.2" fill="#0f172a" />

            {/* Baby Chick 1 */}
            <g transform="translate(46, 14)">
              <ellipse cx="0" cy="0" rx="5" ry="4" fill="#facc15" />
              <circle cx="3" cy="-3" r="3" fill="#facc15" />
              <polygon points="5,-3 8,-2 5,-1" fill="#f97316" />
              <circle cx="4" cy="-3" r="0.8" fill="#0f172a" />
              <line x1="0" y1="4" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.5" />
            </g>

            {/* Baby Chick 2 (Hopping) */}
            <motion.g
              transform="translate(60, 14)"
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

          {/* ================= 6. FOREGROUND GRASS TUFTS & WILDFLOWERS ================= */}
          <g fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round">
            {/* Left grass cluster */}
            <path d="M 60 520 Q 55 490 48 480 M 60 520 Q 64 485 70 475 M 60 520 Q 75 495 85 490" fill="none" />
            {/* Flowers */}
            <circle cx="70" cy="473" r="3" fill="#fbbf24" stroke="none" />
            <circle cx="48" cy="478" r="2.5" fill="#f472b6" stroke="none" />

            {/* Center grass cluster */}
            <path d="M 380 540 Q 375 510 368 495 M 380 540 Q 384 505 390 490 M 380 540 Q 395 515 405 508" fill="none" />
            <circle cx="390" cy="488" r="3" fill="#ffffff" stroke="none" />
            <circle cx="405" cy="506" r="2.5" fill="#fde047" stroke="none" />

            {/* Right pond edge grass */}
            <path d="M 880 520 Q 875 490 870 475 M 880 520 Q 886 485 895 470" fill="none" />
            <circle cx="895" cy="468" r="3" fill="#f43f5e" stroke="none" />
          </g>

          {/* Glowing fireflies in Dusk mood */}
          {theme.fireflies && (
            <g fill="#fde047">
              <motion.circle
                cx="320"
                cy="320"
                r="3"
                animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -15, 0], x: [0, 8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="660"
                cy="370"
                r="2.5"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -18, 0], x: [0, -10, 0] }}
                transition={{ duration: 3.2, delay: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="480"
                cy="440"
                r="3.5"
                animate={{ opacity: [0.1, 0.85, 0.1], y: [0, -20, 0] }}
                transition={{ duration: 2.4, delay: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="180"
                cy="380"
                r="2.5"
                animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -12, 0] }}
                transition={{ duration: 3.6, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Bar: Interactive Helper & Status */}
      <div className="px-4 py-3 bg-white/10 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-100/90">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Click any animal, barn, or pond to see their story!</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-emerald-200/75">
          <span>🐮 Cow: 18L/day</span>
          <span>🐔 Layers: 98% Grade A</span>
          <span>🦆 Biofloc Pond</span>
        </div>
      </div>
    </div>
  )
}
