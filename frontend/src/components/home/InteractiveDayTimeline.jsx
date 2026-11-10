import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Sun, Sparkles, Truck, Moon, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'

const TIMELINE_STEPS = [
  {
    id: 'dawn',
    icon: Sun,
    color: 'from-amber-400 to-yellow-500',
    previewMetrics: [
      { label: 'milk', value: 'milkValue' },
      { label: 'eggs', value: 'eggsValue' },
      { label: 'logged', value: 'loggedValue' },
    ],
  },
  {
    id: 'noon',
    icon: Sparkles,
    color: 'from-emerald-400 to-green-500',
    previewMetrics: [
      { label: 'feed', value: 'feedValue' },
      { label: 'vaccines', value: 'clear' },
      { label: 'workers', value: 'present' },
    ],
  },
  {
    id: 'afternoon',
    icon: Truck,
    color: 'from-blue-400 to-indigo-500',
    previewMetrics: [
      { label: 'sales', value: 'salesValue' },
      { label: 'received', value: 'receivedValue' },
      { label: 'credit', value: 'creditValue' },
    ],
  },
  {
    id: 'evening',
    icon: Moon,
    color: 'from-purple-400 to-teal-500',
    previewMetrics: [
      { label: 'margin', value: 'marginValue' },
      { label: 'expenses', value: 'expensesValue' },
      { label: 'schedule', value: 'prepared' },
    ],
  },
]

export default function InteractiveDayTimeline() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const current = TIMELINE_STEPS[activeStep]
  const copyKey = `home.timeline.steps.${current.id}`

  return (
    <section className="py-20 lg:py-28 bg-[#fdfdf9] border-y border-forest-100/80 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full mb-3">
            {t('home.timeline.kicker')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-forest-950">
            {t('home.timeline.title')}
          </h2>
          <p className="mt-3 text-base text-forest-600">
            {t('home.timeline.description')}
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
                <span>{t(`home.timeline.steps.${s.id}.time`)}</span>
                <span className="hidden md:inline font-normal opacity-75">· {t(`home.timeline.steps.${s.id}.badge`)}</span>
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
                  <span>{t(`${copyKey}.time`)} • {t(`${copyKey}.badge`).toUpperCase()}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-forest-950 mt-2">
                  {t(`${copyKey}.title`)}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-forest-700 leading-relaxed">
                  {t(`${copyKey}.description`)}
                </p>

                <div className="mt-5 flex items-start gap-2 rounded-xl bg-forest-50/70 p-3.5 border border-forest-100/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs font-semibold text-forest-800">
                    {t(`${copyKey}.highlight`)}
                  </span>
                </div>
              </div>

              {/* Right Column: Live Simulated Farm Output Card */}
              <div className="md:col-span-5 rounded-2xl border border-forest-100 bg-gradient-to-b from-[#f9faf6] to-white p-5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">
                  {t('home.timeline.telemetry')}
                </span>

                <div className="mt-4 space-y-3">
                  {current.previewMetrics.map((pm) => (
                    <div key={pm.label} className="flex justify-between items-center py-2 border-b border-forest-100/60 text-xs">
                      <span className="text-forest-600 font-medium">{t(`${copyKey}.${pm.label}`)}</span>
                      <span className="font-mono font-bold text-forest-950 bg-white px-2 py-0.5 rounded border border-forest-100">
                        {t(`${copyKey}.${pm.value}`)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    {t('home.timeline.cloudSynced')}
                  </span>
                  <button
                    onClick={() => setActiveStep((prev) => (prev + 1) % TIMELINE_STEPS.length)}
                    className="flex items-center gap-1 text-forest-900 hover:text-emerald-700 cursor-pointer"
                  >
                    {t('home.timeline.nextHour')} <ArrowRight className="h-3 w-3" />
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
