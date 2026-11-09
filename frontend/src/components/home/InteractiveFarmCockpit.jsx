import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import {
  Tractor, Egg, LineChart, Bell, ArrowUpRight, CheckCircle2,
  Sparkles, Droplets, HeartPulse, ShieldCheck, ChevronRight,
  TrendingUp, Leaf, Plus
} from 'lucide-react'

const DOMAINS = {
  dairy: {
    id: 'dairy',
    name: 'Dairy & Cattle',
    icon: Tractor,
    badge: '180 Holstein & Sahiwal',
    color: 'from-amber-500/20 to-emerald-500/10',
    accent: '#3e7652',
    metrics: [
      { label: 'Active Milking Herd', value: '142', sub: '98.6% in peak lactation', trend: '+4 this month', icon: Tractor, isPositive: true },
      { label: 'Today\'s Milk Yield', value: '864', unit: 'Litres', sub: 'Morning: 480L · Evening: 384L', trend: '+7.8% vs last week', icon: Droplets, isPositive: true },
      { label: 'Daily Dairy Net', value: '৳51,840', sub: 'Avg ৳60 / litre collected', trend: '+৳4,200', icon: LineChart, isPositive: true },
    ],
    bars: [62, 70, 68, 85, 76, 92, 84, 96, 88, 100, 94, 98],
    actionLabel: 'Log Evening Milking (+20L)',
    actionIncrement: 20,
    unit: 'Litres',
    activity: 'Rangpur Line 2: Batch A automated cooling tank at 3.8°C',
  },
  poultry: {
    id: 'poultry',
    name: 'Smart Poultry',
    icon: Egg,
    badge: '14,000 Sonali & Layers',
    color: 'from-orange-500/20 to-amber-500/10',
    accent: '#d97706',
    metrics: [
      { label: 'Flock Headcount', value: '14,250', sub: 'Shed 1: 8k · Shed 2: 6.2k', trend: '99.4% livability', icon: Tractor, isPositive: true },
      { label: 'Today\'s Egg Collection', value: '11,840', unit: 'Eggs', sub: 'Grade A: 96.5% · Grade B: 3.5%', trend: '+420 vs yesterday', icon: Egg, isPositive: true },
      { label: 'Feed Conversion (FCR)', value: '1.48', sub: 'Automated feeder running', trend: '-0.04 optimal', icon: Sparkles, isPositive: true },
    ],
    bars: [75, 82, 80, 88, 84, 92, 90, 96, 94, 98, 97, 100],
    actionLabel: 'Collect Shed 2 Egg Tray (+180)',
    actionIncrement: 180,
    unit: 'Eggs',
    activity: 'Broiler House B: Temp 24.5°C · Humidity 62% optimal',
  },
  aqua: {
    id: 'aqua',
    name: 'Fisheries & Ponds',
    icon: Droplets,
    badge: '6 Biofloc & Earthen Ponds',
    color: 'from-cyan-500/20 to-blue-500/10',
    accent: '#0284c7',
    metrics: [
      { label: 'Total Biomass', value: '8.4', unit: 'Tons', sub: 'Rui, Katla & Monosex Tilapia', trend: '+650kg bi-weekly', icon: Droplets, isPositive: true },
      { label: 'Dissolved Oxygen (DO)', value: '6.9', unit: 'mg/L', sub: 'Aerators 3 & 4 on schedule', trend: 'Healthy range', icon: HeartPulse, isPositive: true },
      { label: 'Estimated Pond Value', value: '৳1,480,000', sub: 'Next harvest in 18 days', trend: 'High demand', icon: LineChart, isPositive: true },
    ],
    bars: [45, 52, 60, 64, 72, 78, 82, 88, 91, 95, 96, 99],
    actionLabel: 'Record Water Quality (DO 7.1)',
    actionIncrement: 1,
    unit: 'Checks',
    activity: 'Pond 3: Automatic feeder scheduled for 05:00 PM',
  },
  finance: {
    id: 'finance',
    name: 'Cashflow & Revenue',
    icon: LineChart,
    badge: 'Consolidated All Branches',
    color: 'from-emerald-500/20 to-teal-500/10',
    accent: '#059669',
    metrics: [
      { label: '30-Day Gross Sales', value: '৳1,248,000', sub: 'Dairy + Eggs + Livestock', trend: '+14.2% MoM', icon: LineChart, isPositive: true },
      { label: 'Operational Costs', value: '৳682,000', sub: 'Feed, Medicine, Salaries', trend: '-3.8% efficiency', icon: Tractor, isPositive: true },
      { label: 'Net Profit Margin', value: '45.3%', sub: 'Healthy net surplus', trend: '+৳86,500', icon: TrendingUp, isPositive: true },
    ],
    bars: [55, 62, 58, 74, 69, 83, 79, 90, 85, 96, 92, 100],
    actionLabel: 'Record Wholesale Sale (+৳15,000)',
    actionIncrement: 15000,
    unit: '৳',
    activity: 'Auto-disbursed worker wages via bKash: ৳92,000 completed',
  },
}

export default function InteractiveFarmCockpit() {
  const [activeTab, setActiveTab] = useState('dairy')
  const [actionCount, setActionCount] = useState(0)
  const [celebrationToast, setCelebrationToast] = useState(null)
  const [bursts, setBursts] = useState([])

  const currentDomain = DOMAINS[activeTab]

  // 3D spring tilt physics on mouse move
  const cardRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 280, damping: 25 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 280, damping: 25 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width - 0.5
    const yPct = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(xPct)
    mouseY.set(yPct)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  // Handle celebratory interactive test action
  const handleTriggerAction = (e) => {
    setActionCount((c) => c + 1)
    const toastMessage = `✓ ${currentDomain.actionLabel.replace('Log ', '').replace('Collect ', '').replace('Record ', '')} logged to cloud!`
    setCelebrationToast(toastMessage)

    // Add confetti bursts
    const newBurstId = Date.now()
    setBursts((prev) => [...prev, newBurstId])
    setTimeout(() => {
      setBursts((prev) => prev.filter((id) => id !== newBurstId))
    }, 1200)

    setTimeout(() => {
      setCelebrationToast(null)
    }, 3800)
  }

  return (
    <div className="relative w-full select-none" style={{ perspective: 1200 }}>
      {/* Background Soft Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-fresh-400/20 via-yellow-300/15 to-emerald-500/20 blur-3xl opacity-75 pointer-events-none" />

      {/* Floating Accent Badge 1: Top Left */}
      <motion.div
        className="hidden sm:flex absolute -top-5 -left-4 z-20 items-center gap-2 px-3 py-2 rounded-xl bg-white/95 dark:bg-forest-900/90 border border-emerald-200/80 shadow-[0_12px_32px_rgba(15,61,46,0.18)] backdrop-blur-md"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800/80">Biosafety Status</span>
          <span className="text-xs font-bold text-forest-950 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            100% Vaccinated · All Clear
          </span>
        </div>
      </motion.div>

      {/* Floating Accent Badge 2: Bottom Right */}
      <motion.div
        className="hidden sm:flex absolute -bottom-5 -right-4 z-20 items-center gap-2 px-3 py-2 rounded-xl bg-white/95 border border-amber-200/80 shadow-[0_12px_32px_rgba(20,40,25,0.18)] backdrop-blur-md"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-800">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800/80">Fresh Record</span>
          <span className="text-xs font-bold text-forest-950">
            {activeTab === 'dairy' ? 'Milk: 864 Litres Today' : activeTab === 'poultry' ? 'Eggs: 11,840 Trays' : 'Net Margin: +45.3%'}
          </span>
        </div>
      </motion.div>

      {/* Main 3D Card Shell */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(6,32,22,0.28),0_2px_8px_rgba(6,32,22,0.08)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_32px_95px_rgba(6,32,22,0.35)]"
      >
        {/* Cockpit Top Chrome Header */}
        <div className="flex items-center justify-between border-b border-forest-100/70 bg-[#fbfdf9] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
              <Leaf className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-forest-950 tracking-tight">KhamarBari</span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                  FARM OS v2.4
                </span>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-forest-600/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Rangpur · Gazipur · Bogura synced
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-forest-100 bg-white px-2.5 py-1 text-xs font-semibold text-forest-700 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-full border border-forest-100 bg-white text-forest-700">
              <Bell className="h-3.5 w-3.5" />
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-700 text-xs font-bold text-white shadow-xs">
              SH
            </div>
          </div>
        </div>

        {/* Sector Tabs Bar */}
        <div className="flex overflow-x-auto scrollbar-none border-b border-forest-100/60 bg-forest-50/40 p-1.5 gap-1">
          {Object.values(DOMAINS).map((dom) => {
            const Icon = dom.icon
            const isCurrent = activeTab === dom.id
            return (
              <button
                key={dom.id}
                onClick={() => setActiveTab(dom.id)}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isCurrent
                    ? 'text-forest-950 shadow-xs'
                    : 'text-forest-700/70 hover:text-forest-900 hover:bg-white/60'
                }`}
              >
                {isCurrent && (
                  <motion.span
                    layoutId="active-cockpit-tab"
                    className="absolute inset-0 rounded-lg bg-white ring-1 ring-forest-200/80 shadow-xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${isCurrent ? 'text-emerald-700' : 'text-forest-500'}`} />
                  {dom.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Cockpit Main Body Content */}
        <div className="p-4 sm:p-6">
          {/* Section Sub-heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">
                ACTIVE SECTOR • {currentDomain.badge}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-forest-950">
                {currentDomain.name} Real-time Overview
              </h3>
            </div>

            {/* Interactive "Try a Live Action" Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleTriggerAction}
              className="relative inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-gradient-to-r from-emerald-600 to-forest-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-500 hover:to-forest-500 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{currentDomain.actionLabel}</span>
              <Sparkles className="h-3 w-3 text-yellow-300 animate-spin [animation-duration:4s]" />

              {/* Mini particles burst on click */}
              {bursts.map((id) => (
                <motion.span
                  key={id}
                  className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-sm"
                  initial={{ opacity: 1, y: 0, scale: 0.6 }}
                  animate={{ opacity: 0, y: -24, scale: 1.2 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                >
                  ✨ +1
                </motion.span>
              ))}
            </motion.button>
          </div>

          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {currentDomain.metrics.map((m, idx) => {
              const Icon = m.icon
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="rounded-xl border border-forest-100 bg-white/80 p-3 sm:p-3.5 shadow-2xs hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-forest-600">{m.label}</span>
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-forest-50 text-forest-700">
                      <Icon className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <strong className="text-xl sm:text-2xl font-extrabold tracking-tight text-forest-950 font-mono">
                      {idx === 1 && actionCount > 0 ? (
                        <span className="text-emerald-700">
                          {Number(m.value.replace(/,/g, '')) + actionCount * currentDomain.actionIncrement}
                        </span>
                      ) : (
                        m.value
                      )}
                    </strong>
                    {m.unit && <span className="text-xs font-semibold text-forest-600">{m.unit}</span>}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-forest-500">
                    <span>{m.sub}</span>
                    <span className="inline-flex items-center gap-0.5 font-bold text-emerald-700">
                      <ArrowUpRight className="h-3 w-3" />
                      {m.trend}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Interactive Trend Chart Bar */}
          <div className="mt-4 rounded-xl border border-forest-100 bg-[#f9faf7] p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-forest-900">12-Day Production Velocity</span>
                <span className="text-[10px] font-medium text-forest-500">· Peak efficiency</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +16.8% Average gain
              </span>
            </div>

            {/* Bars */}
            <div className="flex h-20 items-end justify-between gap-1 sm:gap-2 pt-2 border-b border-forest-100">
              {currentDomain.bars.map((height, i) => (
                <div key={i} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                  <motion.div
                    className={`w-full rounded-t-sm transition-colors duration-200 ${
                      i >= 10
                        ? 'bg-gradient-to-t from-emerald-600 to-fresh-400'
                        : i % 2 === 0
                        ? 'bg-emerald-200/90 hover:bg-emerald-300'
                        : 'bg-emerald-300/90 hover:bg-emerald-400'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.6, delay: i * 0.03, ease: 'easeOut' }}
                  />
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-forest-950 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                    {height}%
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-forest-400 mt-1 font-mono">
              <span>01 Aug</span>
              <span>04 Aug</span>
              <span>08 Aug</span>
              <span>Today (Peak)</span>
            </div>
          </div>

          {/* Real-time Activity Footer Pill */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-forest-600 bg-white/70 rounded-lg px-3 py-2 border border-forest-100">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {currentDomain.activity}
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-forest-400">Synced 2s ago</span>
          </div>
        </div>

        {/* Celebration Toast inside Cockpit */}
        <AnimatePresence>
          {celebrationToast && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="absolute bottom-3 left-4 right-4 sm:left-auto sm:right-4 z-30 flex items-center gap-2 rounded-xl bg-forest-900 text-white px-4 py-2.5 shadow-xl text-xs font-semibold border border-emerald-400/30"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{celebrationToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
