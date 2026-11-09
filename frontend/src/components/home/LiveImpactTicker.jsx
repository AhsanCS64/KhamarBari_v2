import { motion } from 'framer-motion'
import { Tractor, Droplets, LineChart, MapPin, Sparkles, ShieldCheck } from 'lucide-react'

const STATS = [
  {
    icon: Tractor,
    value: '120,000+',
    label: 'Livestock & Habitats',
    sub: 'Tracked across 450+ farms',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  {
    icon: Droplets,
    value: '480,000 L',
    label: 'Milk & Yield Logged',
    sub: 'Automated milking & pond logs',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  {
    icon: LineChart,
    value: '৳52.4M+',
    label: 'Revenue Automated',
    sub: 'Instant bKash & wholesale billing',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    icon: MapPin,
    value: '64 Districts',
    label: 'Pan-Bangladesh',
    sub: 'Dhaka to Rangpur to Cox\'s Bazar',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
]

export default function LiveImpactTicker() {
  return (
    <div className="relative -mt-8 sm:-mt-12 z-20 container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-emerald-100/80 bg-white/95 p-4 sm:p-6 shadow-[0_16px_48px_rgba(15,61,46,0.08)] backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-forest-100/60">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
              Transforming Agriculture Across Bangladesh
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Govt. DLS & Fishery Guidelines Compliant · Bank Loan Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          {STATS.map((s, idx) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="group relative flex flex-col justify-between rounded-xl border border-forest-100/70 bg-gradient-to-b from-[#fbfdf9] to-white p-3.5 sm:p-4 hover:border-emerald-300 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl border ${s.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="mt-3">
                  <span className="block font-mono text-xl sm:text-2xl font-black tracking-tight text-forest-950">
                    {s.value}
                  </span>
                  <span className="block text-xs font-bold text-forest-900 mt-0.5">
                    {s.label}
                  </span>
                  <span className="block text-[11px] text-forest-500 mt-0.5">
                    {s.sub}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
