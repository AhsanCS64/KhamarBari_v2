
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  tone = 'default',
  delta,
  delay = 0,
}) {
  const tones = {
    default: {
      icon: 'bg-sage text-forest-700',
      glow: 'group-hover:shadow-sage/30',
    },
    fresh: {
      icon: 'bg-fresh-100 text-fresh-600',
      glow: 'group-hover:shadow-fresh-200/60',
    },
    earth: {
      icon: 'bg-earth/10 text-earth-700',
      glow: 'group-hover:shadow-earth/20',
    },
    danger: {
      icon: 'bg-red-100 text-red-600',
      glow: 'group-hover:shadow-red-200/50',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-700',
      glow: 'group-hover:shadow-amber-200/50',
    },
  }

  const selectedTone = tones[tone] || tones.default

  const isNegative = delta?.trim().startsWith('-')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className={cn(
          'group relative h-full overflow-hidden border border-forest-900/[0.06]',
          'bg-white/90 shadow-sm backdrop-blur-sm',
          'transition-all duration-300 ease-out',
          'hover:border-forest-700/15 hover:shadow-xl',
          selectedTone.glow
        )}
      >
        {/* Subtle decorative background */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sage/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <CardContent className="relative p-5">
          <div className="flex items-start justify-between">
            {/* Icon */}
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-2xl',
                'transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
                selectedTone.icon
              )}
            >
              {Icon && <Icon className="h-[21px] w-[21px]" strokeWidth={1.8} />}
            </div>

            {/* Delta indicator */}
            {delta && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1',
                  'text-[11px] font-semibold tracking-wide',
                  'transition-transform duration-300 group-hover:scale-105',
                  isNegative
                    ? 'bg-red-50 text-red-600'
                    : 'bg-fresh-50 text-fresh-700'
                )}
              >
                <span className="text-[10px]">
                  {isNegative ? '↓' : '↑'}
                </span>
                {delta.replace(/^[+-]/, '')}
              </span>
            )}
          </div>

          {/* KPI information */}
          <div className="mt-5 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-700/55">
              {label}
            </p>

            <div className="flex items-baseline gap-1.5 min-w-0">
              <p className="min-w-0 truncate text-[28px] font-bold leading-tight tracking-tight text-forest-900 tabular-nums">
                {value}
              </p>

              {unit && (
                <span className="shrink-0 text-sm font-medium text-forest-700/60">
                  {unit}
                </span>
              )}
            </div>
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-forest-700/10 to-transparent transition-all duration-300 group-hover:via-forest-700/25" />
        </CardContent>
      </Card>
    </motion.div>
  )
}
