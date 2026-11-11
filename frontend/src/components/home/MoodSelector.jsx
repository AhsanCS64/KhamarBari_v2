
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Sun, Sparkles, Wheat, Moon, Clock3 } from 'lucide-react'

const MOODS = [
  { id: 'morning', labelKey: 'home.mood.morning', icon: Sun, color: 'text-amber-300' },
  { id: 'meadow', labelKey: 'home.mood.meadow', icon: Sparkles, color: 'text-emerald-300' },
  { id: 'harvest', labelKey: 'home.mood.harvest', icon: Wheat, color: 'text-yellow-400' },
  { id: 'dusk', labelKey: 'home.mood.dusk', icon: Moon, color: 'text-teal-300' },
]

export default function MoodSelector({ currentMood, onSelectMood, isAuto, onEnableAuto }) {
  const { t } = useTranslation()

  return (
    <div
      className="
        inline-flex items-center gap-1
        rounded-full border border-white/15
        bg-black/30 p-1.5
        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
        backdrop-blur-2xl
        ring-1 ring-white/5
      "
      role="group"
      aria-label={t('home.mood.atmosphere')}
    >
      <span className="
        hidden sm:inline-block
        px-2.5 text-[10px] font-bold
        uppercase tracking-[0.16em]
        text-white/50
      ">
        {t('home.mood.atmosphere')}
      </span>

      <div className="flex items-center gap-0.5">
        <motion.button
          type="button"
          onClick={onEnableAuto}
          whileTap={{ scale: 0.94 }}
          className={`
            relative isolate flex items-center gap-1.5 rounded-full
            px-3 py-2 text-xs font-medium transition-colors duration-200
            outline-none focus-visible:ring-2 focus-visible:ring-white/80
            focus-visible:ring-offset-2 focus-visible:ring-offset-black/50
            ${isAuto ? 'text-forest-950' : 'text-white/65 hover:text-white hover:bg-white/10'}
          `}
          aria-pressed={isAuto}
          aria-label={t('home.mood.auto', 'Auto')}
          title={t('home.mood.auto', 'Auto')}
        >
          {isAuto && (
            <motion.span
              layoutId="active-mood-pill"
              className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-fresh-200 via-yellow-200 to-fresh-300 shadow-[0_2px_14px_rgba(74,222,128,0.3)] ring-1 ring-white/40"
              transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.7 }}
            />
          )}
          <Clock3 className={`h-3.5 w-3.5 shrink-0 ${isAuto ? 'text-forest-950' : 'text-sky-300'}`} strokeWidth={2} />
          <span className="hidden md:inline whitespace-nowrap">{t('home.mood.auto', 'Auto')}</span>
        </motion.button>
        {MOODS.map((m) => {
          const Icon = m.icon
          const isActive = currentMood === m.id
          const label = t(m.labelKey)

          return (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => onSelectMood(m.id)}
              whileTap={{ scale: 0.94 }}
              className={`
                relative isolate flex items-center
                gap-1.5 rounded-full
                px-3 py-2 text-xs font-medium
                transition-colors duration-200
                outline-none
                focus-visible:ring-2
                focus-visible:ring-white/80
                focus-visible:ring-offset-2
                focus-visible:ring-offset-black/50
                ${isActive
                  ? 'text-forest-950'
                  : 'text-white/65 hover:text-white hover:bg-white/10'
                }
              `}
              aria-pressed={isActive}
              aria-label={label}
              title={label}
            >
              {isActive && (
                <motion.span
                  layoutId="active-mood-pill"
                  className="
                    absolute inset-0 -z-10
                    rounded-full
                    bg-gradient-to-br
                    from-fresh-200 via-yellow-200 to-fresh-300
                    shadow-[0_2px_14px_rgba(74,222,128,0.3)]
                    ring-1 ring-white/40
                  "
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                    mass: 0.7,
                  }}
                />
              )}

              <Icon
                className={`
                  h-3.5 w-3.5 shrink-0
                  transition-transform duration-300
                  ${isActive
                    ? 'text-forest-950'
                    : `${m.color} group-hover:scale-110`
                  }
                `}
                strokeWidth={2}
              />

              <span className="hidden md:inline whitespace-nowrap">
                {label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
