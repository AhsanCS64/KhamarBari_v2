import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Tractor, LineChart, Egg, Warehouse, Users, FileSpreadsheet,
  ArrowUpRight, ShieldCheck, Sparkles, MapPin, CheckCircle2,
  AlertTriangle, Droplets, Zap
} from 'lucide-react'

export default function FeatureBentoGrid() {
  const { t } = useTranslation()
  const [selectedBranch, setSelectedBranch] = useState('rangpur')

  const branches = {
    rangpur: { productionKey: 'rangpurProduction' },
    gazipur: { productionKey: 'gazipurProduction' },
    bogura: { productionKey: 'boguraProduction' },
    sylhet: { productionKey: 'sylhetProduction' },
  }

  return (
    <section id="features" className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-cream via-[#f8faf4] to-cream">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 -left-48 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 h-96 w-96 rounded-full bg-yellow-200/25 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-forest-200/80 bg-forest-50/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t('home.features.kicker')}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-forest-950"
          >
            {t('home.features.titleStart')}{' '}
            <span className="bg-gradient-to-r from-emerald-700 via-forest-800 to-emerald-900 bg-clip-text text-transparent">
              {t('home.features.titleHighlight')}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-base sm:text-lg text-forest-700/80 max-w-xl mx-auto"
          >
            {t('home.features.description')}
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Animal Records & Habitats (Spans 2 columns on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 group relative overflow-hidden rounded-2xl border border-forest-100 bg-white p-6 shadow-sm hover:border-emerald-300 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  <Tractor className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-mono font-bold text-forest-400">{t('home.features.habitat.category')}</span>
              </div>
              <h3 className="text-xl font-bold text-forest-950">{t('home.features.habitat.title')}</h3>
              <p className="mt-1 text-sm text-forest-600">
                {t('home.features.habitat.description')}
              </p>
            </div>

            {/* Visual Micro-Widget */}
            <div className="mt-6 rounded-xl border border-forest-100/80 bg-forest-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-forest-800 mb-2">
                <span>{t('home.features.habitat.utilization')}</span>
                <span className="font-mono text-emerald-700 font-bold">{t('home.features.habitat.capacity')}</span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 w-full rounded-full bg-forest-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-fresh-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: '88.4%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-white border border-forest-200 text-[10px] font-semibold text-forest-800">
                  {t('home.features.habitat.cows')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-forest-200 text-[10px] font-semibold text-forest-800">
                  {t('home.features.habitat.hens')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-forest-200 text-[10px] font-semibold text-forest-800">
                  {t('home.features.habitat.fish')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Nationwide Multi-Branch Radar (Spans 2 columns on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-2 group relative overflow-hidden rounded-2xl border border-forest-100 bg-white p-6 shadow-sm hover:border-emerald-300 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-800 font-bold">
                  <MapPin className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-mono font-bold text-forest-400">{t('home.features.branches.category')}</span>
              </div>
              <h3 className="text-xl font-bold text-forest-950">{t('home.features.branches.title')}</h3>
              <p className="mt-1 text-sm text-forest-600">
                {t('home.features.branches.description')}
              </p>
            </div>

            {/* Interactive Branch Switcher */}
            <div className="mt-6 rounded-xl border border-forest-100/80 bg-forest-50/50 p-3">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {Object.keys(branches).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSelectedBranch(k)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      selectedBranch === k
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-forest-700 hover:bg-forest-100'
                    }`}
                  >
                    {k.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs font-semibold text-forest-900 bg-white p-2.5 rounded-lg border border-forest-100">
                <span className="font-bold">{t(`home.features.branches.${selectedBranch}`)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-800">{t(`home.features.branches.${branches[selectedBranch].productionKey}`)}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Finance & Taka Precision (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="group relative overflow-hidden rounded-2xl border border-forest-100 bg-white p-6 shadow-sm hover:border-emerald-300 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <LineChart className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-mono font-bold text-forest-400">{t('home.features.cashflow.category')}</span>
              </div>
              <h3 className="text-lg font-bold text-forest-950">{t('home.features.cashflow.title')}</h3>
              <p className="mt-1 text-xs text-forest-600 leading-relaxed">
                {t('home.features.cashflow.description')}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/40 p-3">
              <div className="flex justify-between text-xs font-bold text-amber-950">
                <span>{t('home.features.cashflow.margin')}</span>
                <span className="font-mono text-emerald-700">+42.6%</span>
              </div>
              <div className="mt-2 space-y-1 text-[11px] text-amber-900/80">
                <div className="flex justify-between">
                  <span>{t('home.features.cashflow.feed')}</span>
                  <span className="font-mono">52%</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('home.features.cashflow.labor')}</span>
                  <span className="font-mono">22%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Production Telemetry (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="group relative overflow-hidden rounded-2xl border border-forest-100 bg-white p-6 shadow-sm hover:border-emerald-300 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-800 font-bold">
                  <Egg className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-mono font-bold text-forest-400">{t('home.features.harvest.category')}</span>
              </div>
              <h3 className="text-lg font-bold text-forest-950">{t('home.features.harvest.title')}</h3>
              <p className="mt-1 text-xs text-forest-600 leading-relaxed">
                {t('home.features.harvest.description')}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-blue-200/80 bg-blue-50/40 p-3">
              <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                <span>{t('home.features.harvest.quality')}</span>
                <span className="text-blue-700 font-mono">98.2%</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-900">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                <span>{t('home.features.harvest.zeroSpoilage')}</span>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Inventory & Expiry Sentry (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl border border-forest-100 bg-white p-6 shadow-sm hover:border-emerald-300 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-800 font-bold">
                  <Warehouse className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-mono font-bold text-forest-400">{t('home.features.inventory.category')}</span>
              </div>
              <h3 className="text-lg font-bold text-forest-950">{t('home.features.inventory.title')}</h3>
              <p className="mt-1 text-xs text-forest-600 leading-relaxed">
                {t('home.features.inventory.description')}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-orange-200/80 bg-orange-50/40 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                <span>{t('home.features.inventory.warning')}</span>
              </div>
              <span className="mt-1 block text-[11px] text-orange-800/80">
                {t('home.features.inventory.reserve')}
              </span>
            </div>
          </motion.div>

          {/* Card 6: Worker Attendance & Payroll (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.24 }}
            className="group relative overflow-hidden rounded-2xl border border-forest-100 bg-white p-6 shadow-sm hover:border-emerald-300 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-100 text-teal-800 font-bold">
                  <Users className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-mono font-bold text-forest-400">{t('home.features.workers.category')}</span>
              </div>
              <h3 className="text-lg font-bold text-forest-950">{t('home.features.workers.title')}</h3>
              <p className="mt-1 text-xs text-forest-600 leading-relaxed">
                {t('home.features.workers.description')}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-teal-200/80 bg-teal-50/40 p-3">
              <div className="flex items-center justify-between text-xs font-bold text-teal-950">
                <span>{t('home.features.workers.active')}</span>
                <span className="text-teal-700 font-mono">{t('home.features.workers.present')}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-teal-900">
                <Zap className="h-3.5 w-3.5 text-teal-600" />
                <span>{t('home.features.workers.payout')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
