import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Sparkles, Truck, Moon, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'

const TIMELINE_STEPS = [
  {
    id: 'dawn',
    time: '06:00 AM',
    title: 'Dawn Milking & Morning Harvest',
    icon: Sun,
    badge: 'Morning Routine',
    color: 'from-amber-400 to-yellow-500',
    description: 'Farmhands record morning milk yields, egg crate counts, and pond water temperature in 30 seconds on their phone.',
    highlight: 'Zero lost data, zero messy notebooks on wet barn floors.',
    previewMetrics: [
      { label: 'Morning Milk Collected', val: '480 Litres' },
      { label: 'Egg Trays Stacked', val: '120 Trays' },
      { label: 'Logged via Phone', val: '06:14 AM' },
    ],
  },
  {
    id: 'noon',
    time: '11:30 AM',
    title: 'Precision Feed & Vaccine Sentry',
    icon: Sparkles,
    badge: 'Midday Optimization',
    color: 'from-emerald-400 to-green-500',
    description: 'Smart algorithms calculate exact feed conversion ratios and send instant alert notifications before feed runs dry or vaccines lapse.',
    highlight: 'Saves up to 15% on wasted concentrate feeds each week.',
    previewMetrics: [
      { label: 'Feed Dispensed', val: '420 kg' },
      { label: 'Vaccines Due', val: 'All Clear' },
      { label: 'Active Farmhands', val: '100% Present' },
    ],
  },
  {
    id: 'afternoon',
    time: '04:30 PM',
    title: 'Wholesale Buyer Invoicing & bKash',
    icon: Truck,
    badge: 'Afternoon Dispatch',
    color: 'from-blue-400 to-indigo-500',
    description: 'Create printed or WhatsApp invoice receipts for milk chilling centers, live bird traders and local markets in two taps.',
    highlight: 'Every Taka tracked with buyer contact and outstanding credit balances.',
    previewMetrics: [
      { label: 'Daily Sales Total', val: '৳48,500' },
      { label: 'bKash Received', val: '৳35,000' },
      { label: 'Credit Balance', val: '৳13,500' },
    ],
  },
  {
    id: 'evening',
    time: '08:00 PM',
    title: 'Evening Peace of Mind & P&L',
    icon: Moon,
    badge: 'Daily Wrap-up',
    color: 'from-purple-400 to-teal-500',
    description: 'As the animals sleep safely, the owner receives a crystal clear daily financial summary showing true net profit across all branches.',
    highlight: 'No late-night accounting stress. Full clarity, complete control.',
    previewMetrics: [
      { label: 'Day\'s Net Margin', val: '+43.8%' },
      { label: 'Total Farm Expenses', val: '৳24,100' },
      { label: 'Tomorrow\'s Schedule', val: 'Auto-prepared' },
    ],
  },
]

export default function InteractiveDayTimeline() {
  const [activeStep, setActiveStep] = useState(0)
  const current = TIMELINE_STEPS[activeStep]

  return (
    <section className="py-20 lg:py-28 bg-[#fdfdf9] border-y border-forest-100/80 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full mb-3">
            A CALMER, MORE PROFITABLE ROUTINE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-forest-950">
            A typical day powered by KhamarBari
          </h2>
          <p className="mt-3 text-base text-forest-600">
            From the first morning milk pail to peaceful evening rest, see how intuitive farm software transforms your daily rhythm.
          </p>
        </div>

        {/* Step Selector Pills */}
        <div className="max-w-3xl mx-auto flex overflow-x-auto pb-4 gap-2 sm:gap-3 justify-start sm:justify-center">
          {TIMELINE_STEPS.map((s, idx) => {
            const Icon = s.icon
            const isSelected = activeStep === idx
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`relative flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-forest-900 text-white shadow-md'
                    : 'bg-white text-forest-700 border border-forest-100 hover:border-emerald-300'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-fresh-400' : 'text-forest-500'}`} />
                <span>{s.time}</span>
                <span className="hidden md:inline font-normal opacity-75">· {s.badge}</span>
              </button>
            )
          })}
        </div>

        {/* Main Interactive Showcase Card */}
        <div className="max-w-4xl mx-auto mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center rounded-3xl border border-forest-100 bg-white p-6 sm:p-10 shadow-lg"
            >
              {/* Left Column: Narrative */}
              <div className="md:col-span-7">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100">
                    {activeStep + 1}
                  </span>
                  <span>{current.time} • {current.badge.toUpperCase()}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-forest-950 mt-2">
                  {current.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-forest-700 leading-relaxed">
                  {current.description}
                </p>

                <div className="mt-5 flex items-start gap-2 rounded-xl bg-forest-50/70 p-3.5 border border-forest-100/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs font-semibold text-forest-800">
                    {current.highlight}
                  </span>
                </div>
              </div>

              {/* Right Column: Live Simulated Farm Output Card */}
              <div className="md:col-span-5 rounded-2xl border border-forest-100 bg-gradient-to-b from-[#f9faf6] to-white p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">
                  LIVE SIMULATION TELEMETRY
                </span>

                <div className="mt-4 space-y-3">
                  {current.previewMetrics.map((pm) => (
                    <div key={pm.label} className="flex justify-between items-center py-2 border-b border-forest-100/60 text-xs">
                      <span className="text-forest-600 font-medium">{pm.label}</span>
                      <span className="font-mono font-bold text-forest-950 bg-white px-2 py-0.5 rounded border border-forest-100">
                        {pm.val}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Cloud Synced
                  </span>
                  <button
                    onClick={() => setActiveStep((prev) => (prev + 1) % TIMELINE_STEPS.length)}
                    className="flex items-center gap-1 text-forest-900 hover:text-emerald-700 cursor-pointer"
                  >
                    Next hour <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
