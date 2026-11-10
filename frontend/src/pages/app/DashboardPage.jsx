import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpRight,
  Beef,
  CalendarDays,
  Clock3,
  Egg,
  Milk,
  Plus,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Package,
  Users,
  Warehouse,
  FileSpreadsheet,
} from 'lucide-react'
import { getDashboardSummary } from '@/services/dashboardService'
import SaleDialog from '@/components/sales/SaleDialog'
import ExpenseDialog from '@/components/expenses/ExpenseDialog'
import ProductionDialog from '@/components/production/ProductionDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'

const cx = (...a) => a.filter(Boolean).join(' ')

// ─────────────────────────────────────────────────────────────────────────────
// UI primitives (self-contained; palette matches the sidebar: forest + lime)
// ─────────────────────────────────────────────────────────────────────────────
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]'
  const variants = {
    primary: 'bg-[#145034] text-white hover:bg-[#0f3d28] focus-visible:ring-[#145034] shadow-lg shadow-[#145034]/20',
    lime: 'bg-[#d9f88c] text-[#0d2a1a] hover:bg-[#e6fba4] focus-visible:ring-[#d9f88c] focus-visible:ring-offset-[#0f3624] shadow-[0_6px_20px_rgba(217,248,140,0.25)]',
    secondary: 'bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400 border border-slate-200',
    glass: 'bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white/60 focus-visible:ring-offset-[#0f3624] border border-white/15',
    ghost: 'text-slate-600 hover:bg-slate-100/80 focus-visible:ring-slate-300',
  }
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }
  return (
    <button className={cx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

const Card = ({ children, className = '', ...props }) => (
  <div
    className={cx(
      'rounded-2xl bg-white ring-1 ring-slate-900/[0.06] shadow-[0_1px_2px_rgba(16,24,20,0.04),0_12px_28px_-16px_rgba(16,40,28,0.18)]',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }) => (
  <div className={cx('flex flex-col gap-1.5 p-5 pb-3', className)}>{children}</div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={cx('font-semibold leading-tight tracking-tight text-slate-900', className)}>{children}</h3>
)

const CardContent = ({ children, className = '' }) => <div className={cx('p-5 pt-0', className)}>{children}</div>

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/15',
    danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/15',
    info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/15',
  }
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  )
}

// Staggered entrance, one orchestrated moment on load
const Reveal = ({ i = 0, children, className = '' }) => {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const smooth = (pts) =>
  pts.reduce((d, [x, y], i, a) => {
    if (i === 0) return `M${x},${y}`
    const mx = (a[i - 1][0] + x) / 2
    return `${d} C${mx},${a[i - 1][1]} ${mx},${y} ${x},${y}`
  }, '')

function useCountUp(target, duration = 900) {
  const reduced = useReducedMotion()
  const [v, setV] = useState(reduced ? target : 0)
  useEffect(() => {
    if (reduced) { setV(target); return }
    let raf
    let start
    const tick = (ts) => {
      if (start === undefined) start = ts
      const p = Math.min(1, (ts - start) / duration)
      setV(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduced])
  return v
}

const StatCard = ({ stat, locale }) => {
  const Icon = stat.icon
  const n = useCountUp(stat.value)
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(16,60,38,0.35)]">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className={cx('grid h-10 w-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3', stat.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-slate-400">{stat.period}</span>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">{stat.title}</p>
        <p className="mt-1 text-[28px] font-bold leading-none tracking-tight text-slate-900 tabular-nums">
          {stat.currency ? '৳' : ''}{Math.round(n).toLocaleString(locale)}{stat.suffix || ''}
        </p>
      </div>
      <p className="px-5 pb-4 text-xs text-slate-400">{stat.caption}</p>
    </Card>
  )
}

const IncomeExpenseChart = ({ data, formatCurrency }) => {
  const [hover, setHover] = useState(null)
  const W = 600, H = 230, L = 40, R = 14, T = 14, B = 28
  const maxAmount = Math.max(0, ...data.flatMap((row) => [row.income, row.expense]))
  const maxVal = Math.max(1000, Math.ceil(maxAmount / 1000) * 1000)
  const pw = W - L - R, ph = H - T - B
  const step = pw / Math.max(data.length - 1, 1)
  const x = (i) => L + i * step
  const y = (v) => T + ph - (v / maxVal) * ph
  const inc = data.map((d, i) => [x(i), y(d.income)])
  const exp = data.map((d, i) => [x(i), y(d.expense)])
  const incLine = smooth(inc), expLine = smooth(exp)
  const area = (line, pts) => `${line} L${pts[pts.length - 1][0]},${T + ph} L${pts[0][0]},${T + ph} Z`
  const active = hover ?? data.length - 1
  const d = data[active]
  const pct = Math.min(86, Math.max(14, (x(active) / W) * 100))

  if (!data.some((row) => row.income > 0 || row.expense > 0)) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 text-center text-sm text-slate-500">
        No sales or expenses have been recorded in the last 7 days.
      </div>
    )
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Income versus expense for the last 7 days"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="incFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f9d5c" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#1f9d5c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0786b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f0786b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((tick) => {
          const value = (maxVal / 4) * tick
          return (
          <g key={tick}>
            <line x1={L} x2={W - R} y1={y(value)} y2={y(value)} stroke="#e2e8f0" strokeDasharray={tick === 0 ? undefined : '3 5'} />
            <text x={L - 8} y={y(value) + 3} textAnchor="end" fontSize="10" fill="#94a3b8" className="tabular-nums">
              {tick === 0 ? '0' : `৳${Math.round(value / 1000)}k`}
            </text>
          </g>
          )
        })}

        <path d={area(expLine, exp)} fill="url(#expFill)" />
        <path d={area(incLine, inc)} fill="url(#incFill)" />
        <path d={expLine} fill="none" stroke="#f0786b" strokeWidth="2" strokeLinecap="round" />
        <path d={incLine} fill="none" stroke="#1f9d5c" strokeWidth="2.5" strokeLinecap="round" />

        {/* Hover guide */}
        <line x1={x(active)} x2={x(active)} y1={T} y2={T + ph} stroke="#145034" strokeOpacity="0.25" strokeDasharray="2 4" />
        <circle cx={x(active)} cy={y(d.income)} r="5" fill="#fff" stroke="#1f9d5c" strokeWidth="2.5" />
        <circle cx={x(active)} cy={y(d.expense)} r="5" fill="#fff" stroke="#f0786b" strokeWidth="2.5" />

        {data.map((row, i) => (
          <g key={`${row.day}-${i}`}>
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fontWeight={i === active ? 700 : 500} fill={i === active ? '#145034' : '#94a3b8'}>
              {row.day}
            </text>
            <rect
              x={x(i) - step / 2}
              y={T}
              width={step}
              height={ph + B}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseMove={() => setHover(i)}
            />
          </g>
        ))}
      </svg>

      <div
        className="pointer-events-none absolute top-1 -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur transition-[left] duration-150"
        style={{ left: `${pct}%` }}
      >
        <p className="mb-1 font-semibold text-slate-700">{d.day}</p>
        <p className="flex items-center gap-1.5 text-slate-500"><span className="h-2 w-2 rounded-full bg-[#1f9d5c]" />Income <b className="ml-auto pl-3 text-slate-800 tabular-nums">{formatCurrency(d.income)}</b></p>
        <p className="flex items-center gap-1.5 text-slate-500"><span className="h-2 w-2 rounded-full bg-[#f0786b]" />Expense <b className="ml-auto pl-3 text-slate-800 tabular-nums">{formatCurrency(d.expense)}</b></p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Loader & EmptyState
// ─────────────────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => <div className={cx('animate-pulse rounded-2xl bg-slate-200/70', className)} />

const SproutLoader = () => (
  <div className="min-h-screen bg-[#f3f6f1] p-4 md:p-6" role="status" aria-live="polite">
    <div className="mx-auto max-w-7xl space-y-6">
      <Skeleton className="h-44 !bg-[#145034]/15" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-44" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
      <p className="text-center text-sm text-slate-500">Loading your farm…</p>
    </div>
  </div>
)

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="text-base font-semibold text-slate-700">{title}</h3>
    <p className="max-w-sm text-sm text-slate-500">{description}</p>
    {actionLabel && (
      <Button size="sm" onClick={onAction}>
        <Plus className="h-4 w-4" /> {actionLabel}
      </Button>
    )}
  </div>
)

const ALERT_STYLES = {
  high: { bar: 'bg-rose-500', chip: 'bg-rose-100 text-rose-600' },
  medium: { bar: 'bg-amber-400', chip: 'bg-amber-100 text-amber-700' },
  low: { bar: 'bg-sky-400', chip: 'bg-sky-100 text-sky-700' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function ModernizedFarmDashboard() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((state) => state.farm)
  const user = useAuthStore((state) => state.user)
  const selectedBranchId = useAppStore((state) => state.selectedBranchId)
  const farmId = farm?.id || farm?._id
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [ready, setReady] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickDialog, setQuickDialog] = useState(null)
  const requestRef = useRef(0)

  const refreshDashboard = useCallback(async () => {
    const requestId = ++requestRef.current
    if (!farmId) {
      setDashboard(null)
      setError(t('dashboard.missingFarm', 'Farm information is unavailable. Please sign in again.'))
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    const result = await getDashboardSummary({
      farmId,
      branchId: selectedBranchId,
      range: '7d',
    })
    if (requestId !== requestRef.current) return
    if (result.error || !result.data) {
      setDashboard(null)
      setError(result.error || t('errors.generic', 'Unable to load dashboard data.'))
      setLoading(false)
      return
    }
    setDashboard(result.data)
    setUpdatedAt(new Date())
    setLoading(false)
  }, [farmId, selectedBranchId, t])

  useEffect(() => {
    if (loading) return
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [loading])

  useEffect(() => {
    refreshDashboard()
    return () => { requestRef.current += 1 }
  }, [refreshDashboard])

  const kpis = dashboard?.kpis || {}
  const stats = useMemo(() => [
    {
      title: t('dashboard.totalAnimals', 'Active animals'),
      value: kpis.totalAnimals || 0,
      period: t('dashboard.current', 'Current'),
      caption: t('dashboard.totalAnimalsCaption', 'Active farm inventory'),
      icon: Beef,
      color: 'text-amber-600 bg-amber-100',
    },
    {
      title: t('dashboard.milkProduction', 'Milk today'),
      value: kpis.productionToday?.milk || 0,
      suffix: ' L',
      period: t('dashboard.today', 'Today'),
      caption: t('dashboard.recordedProduction', 'Recorded production'),
      icon: Milk,
      color: 'text-sky-600 bg-sky-100',
    },
    {
      title: t('dashboard.eggProduction', 'Eggs today'),
      value: kpis.productionToday?.eggs || 0,
      period: t('dashboard.today', 'Today'),
      caption: t('dashboard.recordedProduction', 'Recorded production'),
      icon: Egg,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      title: t('dashboard.revenue30d', 'Revenue (30 days)'),
      value: kpis.revenue30d || 0,
      currency: true,
      period: t('dashboard.last30Days', 'Last 30 days'),
      caption: t('dashboard.fromSales', 'From recorded sales'),
      icon: Wallet,
      color: 'text-emerald-700 bg-emerald-100',
    },
  ], [kpis, t])

  const quickActions = [
    { key: 'animal', label: t('actions.addAnimal', 'Add Animal'), icon: Beef, tone: 'from-emerald-400 to-emerald-600', to: '/dashboard/animals' },
    { key: 'production', label: t('actions.recordProduction', 'Record Production'), icon: Milk, tone: 'from-rose-400 to-rose-600' },
    { key: 'sale', label: t('actions.newSale', 'New Sale'), icon: ShoppingCart, tone: 'from-sky-400 to-sky-600' },
    { key: 'expense', label: t('actions.addExpense', 'Add Expense'), icon: Wallet, tone: 'from-amber-400 to-amber-600' },
    { key: 'reports', label: t('actions.viewReports', 'View Reports'), icon: FileSpreadsheet, tone: 'from-violet-400 to-violet-600', to: '/dashboard/reports' },
  ]

  const alerts = dashboard?.alerts || []
  const activities = dashboard?.recentActivity || []
  const healthBreakdown = dashboard?.healthBreakdown || []
  const healthTotal = healthBreakdown.reduce((sum, item) => sum + item.value, 0)
  const formatCurrency = useCallback(
    (value) => `৳${Number(value || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-BD')}`,
    [i18n.language]
  )

  const runQuickAction = (action) => {
    setQuickAddOpen(false)
    if (action.key === 'production' || action.key === 'sale' || action.key === 'expense') {
      setQuickDialog(action.key)
    }
  }

  const renderQuickAction = (action) => {
    const Icon = action.icon
    const className = 'group flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 text-center outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[#145034]/25 hover:bg-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#145034]/50'
    const content = (
      <>
        <span className={cx('grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3', action.tone)}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-xs font-semibold text-slate-700">{action.label}</span>
      </>
    )
    return action.to ? (
      <Link key={action.key} to={action.to} className={className}>{content}</Link>
    ) : (
      <button key={action.key} type="button" onClick={() => runQuickAction(action)} className={className}>{content}</button>
    )
  }

  if (loading) return <SproutLoader />
  if (error || !dashboard) {
    return (
      <div className="p-4 md:p-6">
        <Card className="mx-auto max-w-2xl p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">{t('errors.generic', 'Unable to load dashboard')}</h1>
          <p role="alert" className="mt-2 text-sm text-slate-600">{error || t('errors.generic', 'Please try again.')}</p>
          <Button className="mt-4" onClick={refreshDashboard}>{t('common.retry', 'Try again')}</Button>
        </Card>
      </div>
    )
  }

  const hour = new Date().getHours()
  const firstName = user?.name?.trim().split(/\s+/)[0] || t('dashboard.farmer', 'Farmer')
  const greeting =
    hour < 12 ? t('dashboard.greeting', 'Good morning, {{name}} 👋', { name: firstName })
    : hour < 18 ? t('dashboard.greetingAfternoon', 'Good afternoon, {{name}} 👋', { name: firstName })
    : t('dashboard.greetingEvening', 'Good evening, {{name}} 👋', { name: firstName })

  return (
    <div className="min-h-screen bg-[#f3f6f1] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero */}
        <Reveal i={0}>
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f3624] via-[#145034] to-[#1b6a45] p-6 text-white shadow-[0_24px_48px_-24px_rgba(15,54,36,0.7)] md:p-8">
            {/* Sun and hills, echoing the pasture scene */}
            <svg aria-hidden="true" viewBox="0 0 520 220" className="pointer-events-none absolute bottom-0 right-0 h-full w-auto max-w-[70%] opacity-90" preserveAspectRatio="xMaxYMax slice">
              <defs>
                <radialGradient id="heroSun" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#d9f88c" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#d9f88c" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="400" cy="70" r="110" fill="url(#heroSun)" />
              <circle cx="400" cy="70" r="26" fill="#fef9c3" />
              <path d="M0 170 Q120 120 260 160 T520 140 V220 H0Z" fill="#d9f88c" opacity="0.08" />
              <path d="M0 195 Q140 160 280 188 T520 172 V220 H0Z" fill="#d9f88c" opacity="0.12" />
            </svg>

            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-[32px] md:leading-tight">{greeting}</h1>
                <p className="mt-1.5 text-sm text-[#c5e3c6]">
                  {t('dashboard.subtitle', "Here's what's happening on your farm today.")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                    <Milk className="h-3.5 w-3.5 text-[#d9f88c]" /> {Number(kpis.productionToday?.milk || 0).toLocaleString(i18n.language)} L {t('dashboard.collectedToday', 'collected today')}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-300" /> {alerts.length} {t('dashboard.alerts', 'Alerts').toLowerCase()}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                    <Users className="h-3.5 w-3.5 text-sky-300" /> {kpis.activeWorkers || 0} {t('footer.activeWorkers', 'active workers')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium backdrop-blur-sm">
                  <CalendarDays className="h-4 w-4" />
                  {new Date().toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-BD', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="relative">
                  <Button
                    variant="lime"
                    size="sm"
                    type="button"
                    aria-expanded={quickAddOpen}
                    aria-controls="dashboard-quick-add"
                    onClick={() => setQuickAddOpen((open) => !open)}
                  >
                  <Plus className="h-4 w-4" />
                  {t('actions.quickAdd', 'Quick Add')}
                  </Button>
                  {quickAddOpen && (
                    <div id="dashboard-quick-add" className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl">
                      {quickActions.filter((action) => action.key !== 'reports').map((action) => {
                        const Icon = action.icon
                        const content = <><Icon className="h-4 w-4 text-[#145034]" /><span>{action.label}</span></>
                        return action.to ? (
                          <Link key={action.key} to={action.to} onClick={() => setQuickAddOpen(false)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145034]/50">
                            {content}
                          </Link>
                        ) : (
                          <button key={action.key} type="button" onClick={() => runQuickAction(action)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145034]/50">
                            {content}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.title} i={i + 1}>
              <StatCard stat={stat} locale={i18n.language === 'bn' ? 'bn-BD' : 'en-BD'} />
            </Reveal>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            <Reveal i={5}>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{t('dashboard.incomeExpense', 'Income vs Expense')}</CardTitle>
                    <p className="text-xs text-slate-400">{t('dashboard.last7Days', 'Last 7 days')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={kpis.netProfit >= 0 ? 'success' : 'danger'}>
                      {kpis.netProfit >= 0 ? <TrendingUp className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {t('dashboard.net30Days', '30-day net')}: {formatCurrency(kpis.netProfit)}
                    </Badge>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#1f9d5c]" />Income</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f0786b]" />Expense</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <IncomeExpenseChart data={dashboard.incomeVsExpense} formatCurrency={formatCurrency} />
                </CardContent>
              </Card>
            </Reveal>

            <Reveal i={6}>
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.quickActions', 'Quick Actions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {quickActions.map(renderQuickAction)}
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal i={7}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t('dashboard.recentActivity', 'Recent Activity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length ? (
                    <ol className="relative">
                      <span aria-hidden="true" className="absolute bottom-3 left-[17px] top-3 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />
                      {activities.map((activity) => {
                        const Icon = activity.type === 'animal' ? Beef
                          : activity.type === 'sale' ? ShoppingCart
                            : activity.type === 'expense' ? Wallet : Milk
                        return (
                          <li key={`${activity.type}-${activity.id}`} className="relative flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50">
                            <div className="relative z-10 grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-white text-[#145034] ring-1 ring-slate-200">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                              <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                                <Clock3 className="h-3 w-3" /> {activity.time}
                              </p>
                            </div>
                            <Link to={activity.href} aria-label={`${t('common.view', 'View')} ${activity.title}`} className="rounded p-1 text-slate-400 hover:text-[#145034] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145034]/50">
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </li>
                        )
                      })}
                    </ol>
                  ) : (
                    <p className="py-8 text-center text-sm text-slate-500">{t('dashboard.noRecentActivity', 'No recent activity has been recorded.')}</p>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Reveal i={5}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    {t('dashboard.alerts', 'Alerts')}
                  </CardTitle>
                  <Badge variant={alerts.some((alert) => alert.severity === 'high') ? 'danger' : alerts.length ? 'warning' : 'success'}>
                    {alerts.length}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {alerts.length ? (
                    <div className="space-y-2.5">
                      {alerts.slice(0, 6).map((alert) => {
                        const styles = ALERT_STYLES[alert.severity] || ALERT_STYLES.low
                        return (
                          <Link key={alert.id} to={alert.href} className="relative flex items-start gap-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 py-3 pl-4 pr-3 outline-none transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#145034]/50">
                            <span aria-hidden="true" className={cx('absolute inset-y-0 left-0 w-1', styles.bar)} />
                            <div className={cx('rounded-lg p-1.5', styles.chip)}>
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                              <p className="text-xs text-slate-500">{alert.detail}</p>
                            </div>
                          </Link>
                        )
                      })}
                      {alerts.length > 6 && (
                        <p className="pt-1 text-center text-xs text-slate-500">
                          +{alerts.length - 6} {t('dashboard.moreAlerts', 'more alerts')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-slate-500">{t('dashboard.noAlerts', 'No current alerts.')}</p>
                  )}
                </CardContent>
              </Card>
            </Reveal>

            <Reveal i={6}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t('dashboard.farmOverview', 'Farm Overview')}</CardTitle>
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    {Number(kpis.totalAnimals || 0).toLocaleString(i18n.language)} {t('dashboard.activeAnimals', 'active animals')}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="mb-5 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                    {healthBreakdown.map((item, index) => (
                      <div
                        key={item.name}
                        className={cx(
                          'h-full transition-[width] duration-1000 ease-out',
                          index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-amber-500' : 'bg-rose-500'
                        )}
                        style={{ width: ready && healthTotal ? `${(item.value / healthTotal) * 100}%` : '0%' }}
                      />
                    ))}
                  </div>

                  {healthTotal ? (
                    <div className="space-y-3">
                      {healthBreakdown.map((item, index) => {
                        const pct = Math.round((item.value / healthTotal) * 100)
                        const color = index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-amber-500' : 'bg-rose-500'
                        return (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 font-medium text-slate-600">
                                <span className={cx('h-2 w-2 rounded-full', color)} />
                                {t(`dashboard.health.${item.name}`, item.name)}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 tabular-nums">
                                {Number(item.value || 0).toLocaleString(i18n.language)} <span className="font-medium text-slate-400">· {pct}%</span>
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div className={cx('h-full rounded-full transition-[width] duration-1000 ease-out', color)} style={{ width: ready ? `${pct}%` : '0%' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-slate-500">{t('dashboard.noAnimals', 'No active animals recorded.')}</p>
                  )}

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-600">{t('dashboard.enclosureUtilization', 'Enclosure utilization')}</span>
                      <span className="text-xs font-semibold text-slate-800">
                        {Number(kpis.utilizationRate || 0)}% · {Number(kpis.totalCapacity || 0).toLocaleString(i18n.language)} {t('dashboard.capacity', 'capacity')}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-sky-500 transition-[width] duration-1000" style={{ width: ready ? `${Math.min(100, Number(kpis.utilizationRate || 0))}%` : '0%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal i={7}>
              <Link to="/dashboard/inventory" className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#145034]/50">
                <Card className="group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(16,60,38,0.35)]">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-600 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                        <Warehouse className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{t('inventory.title', 'Inventory')}</p>
                        <p className="text-xs text-slate-500">
                          {Number(kpis.inventoryItemCount || 0).toLocaleString(i18n.language)} {t('inventory.items', 'items')} · {Number(kpis.lowStockCount || 0).toLocaleString(i18n.language)} {t('dashboard.lowStock', 'low stock')}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#145034]" />
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          </div>
        </div>

        {/* Status bar */}
        <Reveal i={8}>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/70 px-5 py-3 ring-1 ring-slate-900/[0.06]">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                {t('footer.lastUpdated', 'Last updated')}: {updatedAt?.toLocaleTimeString(i18n.language === 'bn' ? 'bn-BD' : 'en-BD', { hour: 'numeric', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" /> {Number(kpis.activeWorkers || 0).toLocaleString(i18n.language)} {t('footer.activeWorkers', 'active workers')}
              </span>
              <span className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-amber-500" />
                {Number(kpis.lowStockCount || 0).toLocaleString(i18n.language)} {t('dashboard.lowStockItems', 'low-stock items')}
              </span>
            </div>
            <Link
              to="/dashboard/settings"
              className="rounded-md text-xs font-semibold text-[#145034] outline-none transition-colors hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-[#145034]/50"
            >
              {t('footer.settings', 'Settings')} →
            </Link>
          </div>
        </Reveal>
      </div>
      {quickDialog === 'sale' && (
        <SaleDialog open onOpenChange={(open) => !open && setQuickDialog(null)} onSaved={refreshDashboard} />
      )}
      {quickDialog === 'production' && (
        <ProductionDialog open onOpenChange={(open) => !open && setQuickDialog(null)} onSaved={refreshDashboard} />
      )}
      {quickDialog === 'expense' && (
        <ExpenseDialog open onOpenChange={(open) => !open && setQuickDialog(null)} onSaved={refreshDashboard} />
      )}
    </div>
  )
}
