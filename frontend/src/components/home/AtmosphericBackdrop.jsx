import { useMemo, useRef } from 'react'
import { motion, useReducedMotion, useTime, useTransform } from 'framer-motion'
import { Leaf, Sun, Sparkles, Wind, Moon, Star, CloudFog } from 'lucide-react'

// ─── Particle presets ────────────────────────────────────────────────────────
const LEAF_PRESETS = [
  { id: 1, left: '8%', delay: 0, duration: 18, size: 24, rotation: 120, xOffset: 35 },
  { id: 2, left: '22%', delay: 3, duration: 22, size: 18, rotation: -90, xOffset: -40 },
  { id: 3, left: '38%', delay: 7, duration: 20, size: 20, rotation: 180, xOffset: 25 },
  { id: 4, left: '55%', delay: 1.5, duration: 24, size: 16, rotation: -140, xOffset: -30 },
  { id: 5, left: '72%', delay: 5, duration: 19, size: 22, rotation: 90, xOffset: 45 },
  { id: 6, left: '88%', delay: 8, duration: 23, size: 19, rotation: -160, xOffset: -35 },
  { id: 7, left: '15%', delay: 11, duration: 21, size: 15, rotation: 60, xOffset: 28 },
  { id: 8, left: '47%', delay: 13, duration: 25, size: 21, rotation: -110, xOffset: -38 },
  { id: 9, left: '81%', delay: 2, duration: 17, size: 17, rotation: 150, xOffset: 32 },
]

const SUNBEAM_PRESETS = [
  { id: 1, angle: '115deg', left: '15%', opacity: 0.14, width: '180px' },
  { id: 2, angle: '125deg', left: '38%', opacity: 0.18, width: '240px' },
  { id: 3, angle: '135deg', left: '62%', opacity: 0.15, width: '220px' },
  { id: 4, angle: '145deg', left: '82%', opacity: 0.12, width: '190px' },
  { id: 5, angle: '120deg', left: '5%', opacity: 0.10, width: '160px' },
  { id: 6, angle: '140deg', left: '50%', opacity: 0.13, width: '200px' },
]

const STAR_PRESETS = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  left: `${(i * 37.7) % 100}%`,
  top: `${(i * 13.3) % 60}%`,
  size: 1 + (i % 3) * 0.6,
  delay: (i * 0.21) % 4,
  duration: 2 + (i % 5) * 0.8,
}))

const CLOUD_PRESETS = [
  { id: 1, top: '10%', height: 56, width: 320, opacity: 0.10, duration: 75, delay: 0 },
  { id: 2, top: '24%', height: 40, width: 224, opacity: 0.15, duration: 90, delay: 12 },
  { id: 3, top: '42%', height: 32, width: 190, opacity: 0.08, duration: 110, delay: 24 },
  { id: 4, top: '6%', height: 72, width: 420, opacity: 0.06, duration: 140, delay: 40 },
]

const BIRD_PRESETS = [
  { id: 1, top: '14%', duration: 42, delay: 0, scale: 1, yDrift: [-14, 8, -10, 0] },
  { id: 2, top: '22%', duration: 56, delay: 8, scale: 0.7, yDrift: [10, -6, 4, 0] },
]

// ─── Theme definitions ──────────────────────────────────────────────────────
const THEMES = {
  meadow: {
    skyGradient: 'linear-gradient(180deg, #0b3d2b 0%, #11573c 45%, #186a4a 80%, #1e7d58 100%)',
    sunColor: '#fde047',
    sunGlow: 'rgba(253, 224, 71, 0.45)',
    sunCorona: 'rgba(250, 204, 21, 0.22)',
    hillFront: '#124833',
    hillBack: '#0d3726',
    hillDeep: '#082418',
    mistColor: 'rgba(167, 243, 208, 0.08)',
    particleColor: 'text-emerald-300/60',
    accentGlow: 'rgba(74, 222, 128, 0.15)',
    waterColor: 'rgba(94, 234, 212, 0.35)',
    starOpacity: 0,
    aurora: false,
    butterflies: true,
    fireflies: false,
    rays: true,
  },
  harvest: {
    skyGradient: 'linear-gradient(180deg, #2b1f0d 0%, #452e12 35%, #633e13 70%, #825016 100%)',
    sunColor: '#fbbf24',
    sunGlow: 'rgba(251, 191, 36, 0.55)',
    sunCorona: 'rgba(245, 158, 11, 0.28)',
    hillFront: '#3d250c',
    hillBack: '#2e1b09',
    hillDeep: '#1f1206',
    mistColor: 'rgba(253, 230, 138, 0.09)',
    particleColor: 'text-amber-300/70',
    accentGlow: 'rgba(245, 158, 11, 0.2)',
    waterColor: 'rgba(251, 191, 36, 0.35)',
    starOpacity: 0,
    aurora: false,
    butterflies: true,
    fireflies: false,
    rays: true,
  },
  dusk: {
    skyGradient: 'linear-gradient(180deg, #06181b 0%, #092c30 40%, #0c3e38 75%, #10493b 100%)',
    sunColor: '#f97316',
    sunGlow: 'rgba(249, 115, 22, 0.45)',
    sunCorona: 'rgba(234, 88, 12, 0.2)',
    hillFront: '#092323',
    hillBack: '#051819',
    hillDeep: '#020e0e',
    mistColor: 'rgba(153, 246, 228, 0.06)',
    particleColor: 'text-teal-200/75',
    accentGlow: 'rgba(45, 212, 191, 0.16)',
    waterColor: 'rgba(45, 212, 191, 0.3)',
    starOpacity: 0.55,
    aurora: true,
    butterflies: false,
    fireflies: true,
    rays: true,
  },
  morning: {
    skyGradient: 'linear-gradient(180deg, #092f20 0%, #0d462f 35%, #136041 70%, #1a7852 100%)',
    sunColor: '#fed766',
    sunGlow: 'rgba(254, 215, 102, 0.55)',
    sunCorona: 'rgba(253, 224, 71, 0.28)',
    hillFront: '#0d3f2b',
    hillBack: '#082a1d',
    hillDeep: '#041a11',
    mistColor: 'rgba(254, 240, 138, 0.08)',
    particleColor: 'text-yellow-200/65',
    accentGlow: 'rgba(250, 204, 21, 0.18)',
    waterColor: 'rgba(254, 240, 138, 0.28)',
    starOpacity: 0,
    aurora: false,
    butterflies: true,
    fireflies: false,
    rays: true,
  },
}

// ─── Subtle twinkling stars ─────────────────────────────────────────────────
function StarField({ opacity, reducedMotion }) {
  if (reducedMotion || opacity === 0) return null
  return (
    <div className="absolute inset-0" style={{ opacity }}>
      {STAR_PRESETS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 3}px rgba(255,255,255,0.9)`,
          }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.2, 0.7] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Aurora ribbons for dusk ────────────────────────────────────────────────
function Aurora({ reducedMotion }) {
  if (reducedMotion) return null
  return (
    <div className="absolute inset-x-0 top-0 h-[55%] overflow-hidden mix-blend-screen opacity-45">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-40 w-[150%] blur-3xl"
          style={{
            top: `${8 + i * 15}%`,
            left: '-25%',
            background: `linear-gradient(90deg, transparent, ${
              ['rgba(45, 212, 191, 0.55)', 'rgba(129, 140, 248, 0.45)', 'rgba(244, 114, 182, 0.35)'][i]
            }, transparent)`,
          }}
          animate={{
            x: ['-25%', '15%', '-25%'],
            scaleY: [1, 1.35, 1],
            opacity: [0.35, 0.85, 0.35],
          }}
          transition={{ duration: 9 + i * 3, repeat: Infinity, delay: i * 1.6, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── Butterflies (daytime moods) ────────────────────────────────────────────
function Butterflies({ reducedMotion }) {
  if (reducedMotion) return null
  const flies = [
    { id: 1, x: '28%', y: '58%', delay: 0, duration: 11 },
    { id: 2, x: '64%', y: '48%', delay: 2.5, duration: 13 },
    { id: 3, x: '82%', y: '66%', delay: 5, duration: 9 },
  ]
  return (
    <div className="absolute inset-0">
      {flies.map((f) => (
        <motion.div
          key={f.id}
          className="absolute text-yellow-200/80"
          style={{ left: f.x, top: f.y }}
          animate={{
            x: [0, 26, -18, 12, 0],
            y: [0, -22, -38, -12, 0],
            rotate: [0, 12, -12, 4, 0],
          }}
          transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            animate={{ rotateY: [0, 180, 0] }}
            transition={{ duration: 0.42, repeat: Infinity }}
          >
            <svg width="12" height="10" viewBox="0 0 16 12" fill="currentColor" opacity="0.85">
              <path d="M8 6C6 1 1 0 0 3C0 6 4 7 8 6Z" />
              <path d="M8 6C10 1 15 0 16 3C16 6 12 7 8 6Z" />
            </svg>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Fireflies (dusk) ───────────────────────────────────────────────────────
function Fireflies({ reducedMotion }) {
  if (reducedMotion) return null
  return (
    <div className="absolute inset-0">
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={`firefly-${i}`}
          className="absolute h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_#fde047]"
          style={{
            top: `${12 + (i * 4.7) % 70}%`,
            left: `${(i * 7.5 + 4) % 94}%`,
          }}
          animate={{
            opacity: [0.1, 1, 0.2, 0.9, 0.1],
            scale: [0.8, 1.4, 0.9, 1.3, 0.8],
            x: [0, (i % 2 === 0 ? 1 : -1) * 35, 0],
            y: [0, (i % 3 === 0 ? -1 : 1) * 25, 0],
          }}
          transition={{
            duration: 4.5 + (i % 4),
            repeat: Infinity,
            delay: i * 0.35,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Sunbeams ──────────────────────────────────────────────────────────────
function Sunbeams({ theme, reducedMotion }) {
  return (
    <div className="absolute inset-0 opacity-70">
      {SUNBEAM_PRESETS.map((beam, i) => (
        <motion.div
          key={beam.id}
          className="absolute -top-[30%] -bottom-[30%] origin-top-left"
          style={{
            left: beam.left,
            width: beam.width,
            background: `linear-gradient(${beam.angle}, transparent 0%, ${theme.sunGlow} 50%, transparent 100%)`,
            opacity: beam.opacity,
            transform: 'skewX(-18deg)',
          }}
          animate={
            reducedMotion
              ? undefined
              : { opacity: [beam.opacity * 0.6, beam.opacity * 1.4, beam.opacity * 0.6] }
          }
          transition={{ duration: 8 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ─── Cloud layer ───────────────────────────────────────────────────────────
function CloudLayer({ reducedMotion }) {
  return (
    <>
      {CLOUD_PRESETS.map((c) => (
        <motion.div
          key={c.id}
          className="absolute left-0 rounded-full bg-white blur-xl"
          style={{ top: c.top, height: c.height, width: c.width, opacity: c.opacity }}
          animate={reducedMotion ? undefined : { x: ['-25%', '125vw'] }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </>
  )
}

// ─── Bird flock ────────────────────────────────────────────────────────────
function BirdFlock({ reducedMotion }) {
  if (reducedMotion) return null
  return (
    <>
      {BIRD_PRESETS.map((bird) => (
        <motion.div
          key={bird.id}
          className="absolute left-0 flex items-center gap-3 opacity-40 text-emerald-100"
          style={{ top: bird.top, scale: bird.scale }}
          animate={{ x: ['-10%', '110vw'], y: bird.yDrift }}
          transition={{
            x: { duration: bird.duration, delay: bird.delay, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: bird.duration / 4, delay: bird.delay, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <svg width="18" height="10" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 10C5 3 11 3 12 7C13 3 19 3 22 10" strokeLinecap="round" />
          </svg>
          <svg width="14" height="8" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2" className="mt-2">
            <path d="M2 10C5 3 11 3 12 7C13 3 19 3 22 10" strokeLinecap="round" />
          </svg>
          <svg width="11" height="6" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2" className="-mt-1">
            <path d="M2 10C5 3 11 3 12 7C13 3 19 3 22 10" strokeLinecap="round" />
          </svg>
        </motion.div>
      ))}
    </>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function AtmosphericBackdrop({ mood = 'morning' }) {
  const reducedMotion = useReducedMotion()
  const time = useTime()
  const theme = THEMES[mood] ?? THEMES.morning

  // Slow continuous sun rotation driven by useTime
  const sunRotation = useTransform(time, (t) => (t / 120) % 360)
  const coronaScale = useTransform(time, (t) => 1 + Math.sin(t / 3500) * 0.18)

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden transition-colors duration-1000 ease-out"
      style={{ background: theme.skyGradient }}
      aria-hidden="true"
    >
      {/* ── Stars (mood-dependent) ── */}
      <StarField opacity={theme.starOpacity} reducedMotion={reducedMotion} />

      {/* ── Aurora (dusk) ── */}
      {theme.aurora && <Aurora reducedMotion={reducedMotion} />}

      {/* ── Sun / celestial body ── */}
      <div className="absolute -top-12 right-[8%] sm:right-[15%] lg:right-[22%] z-0">
        {/* Outer solar corona pulse */}
        <motion.div
          className="absolute -inset-16 rounded-full blur-3xl"
          style={{ background: theme.sunCorona, scale: coronaScale }}
        />

        {/* Inner intense glow */}
        <div
          className="absolute -inset-8 rounded-full blur-2xl"
          style={{ background: theme.sunGlow }}
        />

        {/* Rotating flare ring + rays */}
        <motion.div
          className="relative h-44 w-44 sm:h-56 sm:w-56"
          style={{ rotate: sunRotation }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full opacity-85" fill="none">
            <circle cx="100" cy="100" r="50" fill={theme.sunColor} fillOpacity="0.4" />
            <circle cx="100" cy="100" r="32" fill={theme.sunColor} />
            {[...Array(16)].map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="16"
                x2="100"
                y2="34"
                stroke={theme.sunColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${i * 22.5} 100 100)`}
                opacity={i % 2 === 0 ? '0.9' : '0.45'}
              />
            ))}
            {/* Extra fine rays */}
            {[...Array(32)].map((_, i) => (
              <line
                key={`fine-${i}`}
                x1="100"
                y1="22"
                x2="100"
                y2="28"
                stroke={theme.sunColor}
                strokeWidth="1"
                strokeLinecap="round"
                transform={`rotate(${i * 11.25 + 5.625} 100 100)`}
                opacity={0.25}
              />
            ))}
          </svg>
        </motion.div>
      </div>

      {/* ── Sunbeams ── */}
      {theme.rays && <Sunbeams theme={theme} reducedMotion={reducedMotion} />}

      {/* ── Clouds ── */}
      <CloudLayer reducedMotion={reducedMotion} />

      {/* ── Birds ── */}
      <BirdFlock reducedMotion={reducedMotion} />

      {/* ── Floating leaves & spores ── */}
      <div className="absolute inset-0">
        {LEAF_PRESETS.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute bottom-0 ${theme.particleColor}`}
            style={{ left: p.left }}
            initial={{ y: '10%', opacity: 0 }}
            animate={
              reducedMotion
                ? { opacity: 0.4 }
                : {
                    y: ['10%', '-115vh'],
                    x: [0, p.xOffset, -p.xOffset * 0.7, p.xOffset * 0.5, 0],
                    rotate: [0, p.rotation, p.rotation * 1.5, p.rotation * 2],
                    opacity: [0, 0.85, 0.95, 0.7, 0],
                  }
            }
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {p.id % 2 === 0 ? (
              <Leaf style={{ width: p.size, height: p.size }} />
            ) : (
              <div
                className="rounded-full bg-current shadow-[0_0_12px_currentColor]"
                style={{ width: p.size * 0.45, height: p.size * 0.45 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Fireflies (dusk) ── */}
      {theme.fireflies && <Fireflies reducedMotion={reducedMotion} />}

      {/* ── Butterflies (day moods) ── */}
      {theme.butterflies && <Butterflies reducedMotion={reducedMotion} />}

      {/* ── Layered rolling terraced hills ── */}
      <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-56 z-0">
        {/* Deepest back ridge */}
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          className="absolute bottom-0 w-full h-full opacity-40"
          preserveAspectRatio="none"
        >
          <path
            d="M0,190 C280,140 540,220 820,170 C1080,130 1280,180 1440,160 L1440,280 L0,280 Z"
            fill={theme.hillDeep}
          />
        </svg>

        {/* Back hill wave */}
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          className="absolute bottom-0 w-full h-full opacity-60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,160 C320,100 640,210 960,140 C1200,90 1340,160 1440,150 L1440,280 L0,280 Z"
            fill={theme.hillBack}
          />
        </svg>

        {/* Mid hill wave with terrace highlight */}
        <svg
          viewBox="0 0 1440 240"
          fill="none"
          className="absolute bottom-0 w-full h-full opacity-85"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 C240,180 520,80 840,140 C1120,190 1320,110 1440,130 L1440,240 L0,240 Z"
            fill={theme.hillFront}
          />
          {/* Terrace line following the crest */}
          <path
            d="M0,120 C240,180 520,80 840,140 C1120,190 1320,110 1440,130"
            stroke={theme.sunColor}
            strokeOpacity="0.12"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* Pond reflection shimmer */}
        <motion.div
          className="absolute bottom-3 left-[18%] h-3 w-32 rounded-full blur-md"
          style={{ background: theme.waterColor }}
          animate={reducedMotion ? undefined : { opacity: [0.4, 0.9, 0.4], scaleX: [0.9, 1.1, 0.9] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1 left-[62%] h-2 w-20 rounded-full blur-sm"
          style={{ background: theme.waterColor }}
          animate={reducedMotion ? undefined : { opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1.2, ease: 'easeInOut' }}
        />

        {/* Ground mist */}
        <div
          className="absolute bottom-0 inset-x-0 h-28 blur-xl"
          style={{ background: theme.mistColor }}
        />
      </div>

      {/* ── Accent bloom in bottom corners ── */}
      <motion.div
        className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl"
        style={{ background: theme.accentGlow }}
        animate={reducedMotion ? undefined : { opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: theme.accentGlow }}
        animate={reducedMotion ? undefined : { opacity: [0.7, 0.4, 0.7] }}
        transition={{ duration: 11, repeat: Infinity, delay: 2, ease: 'easeInOut' }}
      />

      {/* ── Tactile agricultural grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Subtle vignette for depth ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.22) 100%)',
        }}
      />
    </div>
  )
}