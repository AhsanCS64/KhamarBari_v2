import { motion } from 'framer-motion'
import { Sun, Sparkles, Wheat, Moon } from 'lucide-react'

const MOODS = [
  { id: 'morning', label: 'Morning Dew', icon: Sun, color: 'text-amber-300' },
  { id: 'meadow', label: 'Lush Meadow', icon: Sparkles, color: 'text-emerald-300' },
  { id: 'harvest', label: 'Golden Harvest', icon: Wheat, color: 'text-yellow-400' },
  { id: 'dusk', label: 'Firefly Dusk', icon: Moon, color: 'text-teal-300' },
]

export default function MoodSelector({ currentMood, onSelectMood }) {
  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-white/20 bg-black/25 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <span className="hidden sm:inline-block px-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/60">
        Atmosphere
      </span>
      <div className="flex items-center gap-1">
        {MOODS.map((m) => {
          const Icon = m.icon
          const isActive = currentMood === m.id
          return (
            <button
              key={m.id}
              onClick={() => onSelectMood(m.id)}
              className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                isActive
                  ? 'text-forest-950 font-bold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              aria-pressed={isActive}
              title={`Switch mood to ${m.label}`}
            >
              {isActive && (
                <motion.span
                  layoutId="active-mood-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-fresh-200 via-yellow-200 to-fresh-300 shadow-[0_0_16px_rgba(74,222,128,0.4)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? 'text-forest-950' : m.color}`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{m.label}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
