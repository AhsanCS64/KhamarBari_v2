import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Leaf, Sun, Sparkles, Wind } from 'lucide-react'

// Particle definition for ambient nature flow
const LEAF_PRESETS = [
  { id: 1, left: '8%', delay: 0, duration: 18, size: 24, rotation: 120, xOffset: 35 },
  { id: 2, left: '22%', delay: 3, duration: 22, size: 18, rotation: -90, xOffset: -40 },
  { id: 3, left: '38%', delay: 7, duration: 20, size: 20, rotation: 180, xOffset: 25 },
  { id: 4, left: '55%', delay: 1.5, duration: 24, size: 16, rotation: -140, xOffset: -30 },
  { id: 5, left: '72%', delay: 5, duration: 19, size: 22, rotation: 90, xOffset: 45 },
  { id: 6, left: '88%', delay: 8, duration: 23, size: 19, rotation: -160, xOffset: -35 },
]

const SUNBEAM_PRESETS = [
  { id: 1, angle: '115deg', left: '15%', opacity: 0.14, width: '180px' },
  { id: 2, angle: '125deg', left: '38%', opacity: 0.18, width: '240px' },
  { id: 3, angle: '135deg', left: '62%', opacity: 0.15, width: '220px' },
  { id: 4, angle: '145deg', left: '82%', opacity: 0.12, width: '190px' },
]

export default function AtmosphericBackdrop({ mood = 'morning' }) {
  const reducedMotion = useReducedMotion()

  // Atmospheric colors based on the selected mood
  const theme = useMemo(() => {
    switch (mood) {
      case 'meadow':
        return {
          skyGradient: 'linear-gradient(180deg, #0b3d2b 0%, #11573c 45%, #186a4a 80%, #1e7d58 100%)',
          sunColor: '#fde047',
          sunGlow: 'rgba(253, 224, 71, 0.45)',
          sunCorona: 'rgba(250, 204, 21, 0.22)',
          hillFront: '#124833',
          hillBack: '#0d3726',
          mistColor: 'rgba(167, 243, 208, 0.08)',
          particleColor: 'text-emerald-300/60',
          accentGlow: 'rgba(74, 222, 128, 0.15)',
        }
      case 'harvest':
        return {
          skyGradient: 'linear-gradient(180deg, #2b1f0d 0%, #452e12 35%, #633e13 70%, #825016 100%)',
          sunColor: '#fbbf24',
          sunGlow: 'rgba(251, 191, 36, 0.55)',
          sunCorona: 'rgba(245, 158, 11, 0.28)',
          hillFront: '#3d250c',
          hillBack: '#2e1b09',
          mistColor: 'rgba(253, 230, 138, 0.09)',
          particleColor: 'text-amber-300/70',
          accentGlow: 'rgba(245, 158, 11, 0.2)',
        }
      case 'dusk':
        return {
          skyGradient: 'linear-gradient(180deg, #06181b 0%, #092c30 40%, #0c3e38 75%, #10493b 100%)',
          sunColor: '#f97316',
          sunGlow: 'rgba(249, 115, 22, 0.45)',
          sunCorona: 'rgba(234, 88, 12, 0.2)',
          hillFront: '#092323',
          hillBack: '#051819',
          mistColor: 'rgba(153, 246, 228, 0.06)',
          particleColor: 'text-teal-200/75',
          accentGlow: 'rgba(45, 212, 191, 0.16)',
        }
      case 'morning':
      default:
        return {
          skyGradient: 'linear-gradient(180deg, #092f20 0%, #0d462f 35%, #136041 70%, #1a7852 100%)',
          sunColor: '#fed766',
          sunGlow: 'rgba(254, 215, 102, 0.55)',
          sunCorona: 'rgba(253, 224, 71, 0.28)',
          hillFront: '#0d3f2b',
          hillBack: '#082a1d',
          mistColor: 'rgba(254, 240, 138, 0.08)',
          particleColor: 'text-yellow-200/65',
          accentGlow: 'rgba(250, 204, 21, 0.18)',
        }
    }
  }, [mood])

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden transition-colors duration-1000 ease-out"
      style={{ background: theme.skyGradient }}
      aria-hidden="true"
    >
      {/* Dynamic Sun with pulsating rays and rotating corona */}
      <div className="absolute -top-12 right-[8%] sm:right-[15%] lg:right-[22%] z-0">
        {/* Outer solar corona pulse */}
        <motion.div
          className="absolute -inset-16 rounded-full blur-3xl"
          style={{ background: theme.sunCorona }}
          animate={reducedMotion ? undefined : { scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Inner intense glow */}
        <div
          className="absolute -inset-8 rounded-full blur-2xl"
          style={{ background: theme.sunGlow }}
        />

        {/* Rotating sun flare ring */}
        <motion.div
          className="relative h-44 w-44 sm:h-56 sm:w-56"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full opacity-80" fill="none">
            <circle cx="100" cy="100" r="50" fill={theme.sunColor} fillOpacity="0.4" />
            <circle cx="100" cy="100" r="32" fill={theme.sunColor} />
            {/* 16 Sun rays */}
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
          </svg>
        </motion.div>
      </div>

      {/* Gentle Morning Sunbeams passing across the horizon */}
      <div className="absolute inset-0 opacity-70">
        {SUNBEAM_PRESETS.map((beam) => (
          <div
            key={beam.id}
            className="absolute -top-[30%] -bottom-[30%] origin-top-left"
            style={{
              left: beam.left,
              width: beam.width,
              background: `linear-gradient(${beam.angle}, transparent 0%, ${theme.sunGlow} 50%, transparent 100%)`,
              opacity: beam.opacity,
              transform: 'skewX(-18deg)',
            }}
          />
        ))}
      </div>

      {/* Gentle Floating Clouds */}
      <motion.div
        className="absolute top-12 left-0 h-14 w-80 rounded-full bg-white/10 blur-xl"
        animate={reducedMotion ? undefined : { x: ['-20%', '120%'] }}
        transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-28 left-0 h-10 w-56 rounded-full bg-white/15 blur-lg"
        animate={reducedMotion ? undefined : { x: ['-30%', '130%'] }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear', delay: 12 }}
      />

      {/* Flocks of birds gently soaring across the upper sky */}
      {!reducedMotion && (
        <motion.div
          className="absolute top-16 left-0 flex items-center gap-3 opacity-40 text-emerald-100"
          animate={{ x: ['-10%', '110vw'], y: [0, -12, 6, -8, 0] }}
          transition={{ duration: 42, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Bird 1 */}
          <svg width="18" height="10" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 10C5 3 11 3 12 7C13 3 19 3 22 10" strokeLinecap="round" />
          </svg>
          {/* Bird 2 */}
          <svg width="14" height="8" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2" className="mt-2">
            <path d="M2 10C5 3 11 3 12 7C13 3 19 3 22 10" strokeLinecap="round" />
          </svg>
          {/* Bird 3 */}
          <svg width="11" height="6" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2" className="-mt-1">
            <path d="M2 10C5 3 11 3 12 7C13 3 19 3 22 10" strokeLinecap="round" />
          </svg>
        </motion.div>
      )}

      {/* Floating Leaves & Golden Spores with Organic Drift */}
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
            transition={
              reducedMotion
                ? undefined
                : {
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'linear',
                  }
            }
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

      {/* Firefly effect for Dusk mode */}
      {mood === 'dusk' && !reducedMotion && (
        <div className="absolute inset-0">
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={`firefly-${i}`}
              className="absolute h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_#fde047]"
              style={{
                top: `${15 + (i * 5.5)}%`,
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
      )}

      {/* Layered Rolling Green Terraced Hills along bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-56 z-0">
        {/* Back hill wave */}
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          className="absolute bottom-0 w-full h-full opacity-60 preserve-3d"
          preserveAspectRatio="none"
        >
          <path
            d="M0,160 C320,100 640,210 960,140 C1200,90 1340,160 1440,150 L1440,280 L0,280 Z"
            fill={theme.hillBack}
          />
        </svg>

        {/* Mid hill wave with terrace lines */}
        <svg
          viewBox="0 0 1440 240"
          fill="none"
          className="absolute bottom-0 w-full h-full opacity-85 preserve-3d"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 C240,180 520,80 840,140 C1120,190 1320,110 1440,130 L1440,240 L0,240 Z"
            fill={theme.hillFront}
          />
        </svg>

        {/* Morning ground mist */}
        <div
          className="absolute bottom-0 inset-x-0 h-28 blur-xl"
          style={{ background: theme.mistColor }}
        />
      </div>

      {/* Tactile subtle agricultural grid alignment overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  )
}
