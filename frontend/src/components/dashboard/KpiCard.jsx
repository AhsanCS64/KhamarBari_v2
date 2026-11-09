import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function KpiCard({ icon: Icon, label, value, unit, tone = 'default', delta, delay = 0 }) {
  const tones = {
    default: 'bg-sage text-forest-700',
    fresh: 'bg-fresh-100 text-fresh-600',
    earth: 'bg-earth/10 text-earth-700',
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-700',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="h-full">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', tones[tone])}>
              {Icon && <Icon className="h-5 w-5" />}
            </div>
            {delta && (
              <span className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                delta.startsWith('-') ? 'bg-red-100 text-red-700' : 'bg-fresh-100 text-fresh-600'
              )}>
                {delta}
              </span>
            )}
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-forest-700/60">{label}</p>
          <p className="mt-1 text-2xl font-bold text-forest-900">
            {value}
            {unit && <span className="text-base font-medium text-forest-700/70 ml-1">{unit}</span>}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}