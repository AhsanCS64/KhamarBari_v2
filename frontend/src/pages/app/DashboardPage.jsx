import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Beef,
  Bird,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Egg,
  Leaf,
  Milk,
  Plus,
  ShoppingCart,
  Sprout,
  TrendingUp,
  Wallet,
  Package,
  Users,
  Stethoscope,
  Sun,
  Warehouse,
  Zap,
  FileSpreadsheet,
  MapPin,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart'
import HealthPieChart from '@/components/charts/HealthPieChart'
import ProductionTrendChart from '@/components/charts/ProductionTrendChart'
import HabitatUtilizationChart from '@/components/charts/HabitatUtilizationChart'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { getDashboardSummary, getRecentActivity, getAlerts } from '@/services/dashboardService'
import { listEnclosures } from '@/services/enclosuresService'
import { storage } from '@/services/storage'
import { cn } from '@/lib/utils'
import './DashboardPage.css'

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const { selectedBranchId, dateRange, setDateRange } = useAppStore()
  const showDashboardAlerts = storage.get('preferences', {})?.showDashboardAlerts !== false

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [activity, setActivity] = useState([])
  const [alerts, setAlerts] = useState([])
  const [alertError, setAlertError] = useState('')
  const [enclosures, setEnclosures] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([
      getDashboardSummary({ farmId: farm.id, branchId: selectedBranchId, range: dateRange }),
      getRecentActivity({ farmId: farm.id, branchId: selectedBranchId }),
      getAlerts({ farmId: farm.id, branchId: selectedBranchId }),
      listEnclosures({ branchId: selectedBranchId }),
    ])
      .then(([s, a, al, enclosureResult]) => {
        if (cancelled) return
        if (s.error || !s.data || enclosureResult.error) {
          setError(s.error || enclosureResult.error || 'Failed to load dashboard')
          setLoading(false)
          return
        }
        setSummary(s.data)
        setActivity(a.data || [])
        setAlerts(al.data || [])
        setAlertError(al.error || '')
        setEnclosures(enclosureResult.data || [])
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e?.message || 'Failed to load dashboard')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [farm.id, selectedBranchId, dateRange])

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center p-6">
        <SproutLoader label={t('common.loading')} />
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertTriangle}
          title={t('errors.generic')}
          description={error}
          action={<Button onClick={() => window.location.reload()}>{t('common.retry')}</Button>}
        />
      </div>
    )
  }

  const { kpis, incomeVsExpense, healthBreakdown, productionTrend } = summary
  const bdt = (n) => `৳${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`
  const highAlerts = alerts.filter((a) => a.severity === 'high').length

  const modules = [
    { title: 'Livestock', subtitle: 'Cattle & herd records', icon: Beef, tone: 'bg-emerald-50 text-emerald-800', to: '/dashboard/animals' },
    { title: 'Habitats & Enclosures', subtitle: 'Capacity & occupancy', icon: Warehouse, tone: 'bg-teal-50 text-teal-800', to: '/dashboard/animals' },
    { title: 'Production Tracking', subtitle: 'Milk, eggs & harvests', icon: Milk, tone: 'bg-blue-50 text-blue-800', to: '/dashboard/production' },
    { title: 'Inventory & Supplies', subtitle: 'Feed, medicine & alerts', icon: Package, tone: 'bg-amber-50 text-amber-800', to: '/dashboard/inventory' },
    { title: 'Sales & Invoices', subtitle: 'Wholesale revenue & bKash', icon: ShoppingCart, tone: 'bg-cyan-50 text-cyan-800', to: '/dashboard/sales' },
    { title: 'Expenses & Costs', subtitle: 'Feed, supplies & fuel', icon: Wallet, tone: 'bg-rose-50 text-rose-800', to: '/dashboard/expenses' },
    { title: 'Workers & Payroll', subtitle: 'Attendance & salaries', icon: Users, tone: 'bg-purple-50 text-purple-800', to: '/dashboard/workers' },
    { title: 'Reports & Audits', subtitle: 'P&L statements & CSV/PDF', icon: FileSpreadsheet, tone: 'bg-lime-50 text-lime-800', to: '/dashboard/reports' },
  ]

  return (
    <main className="dashboard-page min-w-0 space-y-6 p-4 text-slate-800 sm:p-6 xl:p-8">
      {/* Top Header */}
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Farm Operations Center · {farm.farmName || farm.name || 'KhamarBari'}</span>
            <span className="text-forest-300">|</span>
            <span className="text-forest-600 font-mono font-normal">
              {selectedBranchId === 'all' ? 'All Branches Consolidated' : `Branch ID: ${selectedBranchId}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-forest-950">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-forest-600">
            {t('dashboard.subtitle')} · Monitor livestock health, output velocity, stock sentry and finances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-forest-100 bg-white px-3 py-1.5 text-xs text-forest-700 shadow-2xs">
            <CalendarDays className="h-4 w-4 text-emerald-700" />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          <Button asChild size="sm" className="rounded-xl bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 font-semibold cursor-pointer">
            <Link to="/dashboard/animals">
              <Plus className="mr-1.5 h-4 w-4" />
              {t('quick.addAnimal')}
            </Link>
          </Button>
        </div>
      </header>

      {/* Operations Executive Banner */}
      <section className="dashboard-hero-banner p-6 sm:p-8 text-white relative">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100 mb-4 backdrop-blur-xs">
              <Sun className="h-3.5 w-3.5 text-yellow-300" />
              <span>Real-Time Operational Telemetry</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Every branch and habitat, <span className="text-fresh-300">synchronized.</span>
            </h2>

            <p className="mt-2.5 max-w-lg text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Consolidated livestock records, production collection, supplies velocity and net margin in Bangladeshi Taka.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button asChild size="sm" className="rounded-xl bg-fresh-400 font-bold text-forest-950 hover:bg-fresh-300 shadow-md cursor-pointer">
                <Link to="/dashboard/production" className="flex items-center gap-1.5">
                  <span>Log Production</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold backdrop-blur-xs cursor-pointer">
                <Link to="/dashboard/sales">View Sales Invoices</Link>
              </Button>
            </div>
          </div>

          {/* 4 Dynamic Hero Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <HeroMetric
              icon={Beef}
              label={t('kpi.totalAnimals')}
              value={Number(kpis.totalAnimals || 0).toLocaleString()}
              foot={kpis.totalCapacity ? `${kpis.utilizationRate}% of ${kpis.totalCapacity.toLocaleString()} max` : t('dashboard.stockFoot')}
            />
            <HeroMetric
              icon={Egg}
              label={t('kpi.productionToday')}
              value={`${Number(kpis.productionToday?.milk || 0).toLocaleString()} L`}
              foot={`${Number(kpis.productionToday?.eggs || 0).toLocaleString()} eggs collected`}
            />
            <HeroMetric
              icon={Wallet}
              label={t('dashboard.periodExpenses', { range: t(`range.${dateRange}`) })}
              value={bdt(kpis.expenses30d)}
              foot="Feed, health & operations"
            />
            <HeroMetric
              icon={TrendingUp}
              label={t('dashboard.periodNet', { range: t(`range.${dateRange}`) })}
              value={bdt(kpis.netProfit)}
              foot={kpis.netProfit >= 0 ? 'Net profit surplus' : 'Operating deficit'}
              isPositive={kpis.netProfit >= 0}
            />
          </div>
        </div>
      </section>

      {/* At-a-Glance Stat Row */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3">
        <MiniMetric icon={Users} label={t('kpi.male')} value={kpis.male} />
        <MiniMetric icon={Users} label={t('kpi.female')} value={kpis.female} />
        <MiniMetric icon={Leaf} label={t('kpi.healthy')} value={kpis.healthy} />
        <MiniMetric icon={Stethoscope} label={t('kpi.sick')} value={kpis.sick} warning={kpis.sick > 0} />
        <MiniMetric icon={Activity} label="Births / Deaths" value={`${kpis.births30d || 0} / ${kpis.deaths30d || 0}`} />
        <MiniMetric icon={Users} label="Active Workforce" value={`${kpis.activeWorkers || 0} / ${kpis.totalWorkers || 0}`} />
        <MiniMetric icon={Package} label="Low Stock Items" value={kpis.lowStockCount || 0} warning={kpis.lowStockCount > 0} />
      </section>

      {/* Main Diagrams Section (Grid of 4 Advanced Diagrams) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              OPERATIONAL TELEMETRY & DIAGRAMS
            </span>
            <h2 className="text-xl font-extrabold text-forest-950">Farm Performance Analytics</h2>
          </div>
          <span className="text-xs font-semibold text-forest-600 bg-white px-3 py-1.5 rounded-xl border border-forest-100 shadow-2xs">
            Live Database Synced
          </span>
        </div>

        {/* Row 1: Cash Flow & Health Gauge */}
        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          {/* Diagram 1: Cash Flow */}
          <Card className="dashboard-stat-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-forest-100/70 bg-[#fbfdf9] px-5 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Financial Telemetry</span>
                <CardTitle className="text-base font-bold text-forest-950 mt-0.5">{t('chart.incomeVsExpense')}</CardTitle>
              </div>
              <Badge variant="outline" className="rounded-lg border-emerald-200 bg-emerald-50 text-emerald-800 font-mono text-xs">
                Range: {dateRange}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <IncomeExpenseChart data={incomeVsExpense} />
            </CardContent>
          </Card>

          {/* Diagram 2: Animal Wellbeing Radial Gauge */}
          <Card className="dashboard-stat-card overflow-hidden">
            <CardContent className="p-0">
              <HealthPieChart
                data={healthBreakdown}
                title={t('chart.health')}
                unit={t('dashboard.animalUnit')}
                scopeLabel={selectedBranchId === 'all' ? t('branch.all') : t('dashboard.branchScoped', 'Selected branch')}
              />
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Production Trend & Habitat Capacity Radar */}
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1.1fr]">
          {/* Diagram 3: 14-Day Production Output Waveform */}
          <Card className="dashboard-stat-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-forest-100/70 bg-[#fbfdf9] px-5 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Harvest Telemetry</span>
                <CardTitle className="text-base font-bold text-forest-950 mt-0.5">{t('chart.productionTrend')}</CardTitle>
              </div>
              <Link
                to="/dashboard/production"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                <span>{t('common.viewAll')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <ProductionTrendChart data={productionTrend} />
            </CardContent>
          </Card>

          {/* Diagram 4: Habitat Utilization & Enclosure Capacity */}
          <Card className="dashboard-stat-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-forest-100/70 bg-[#fbfdf9] px-5 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Habitats & Capacity</span>
                <CardTitle className="text-base font-bold text-forest-950 mt-0.5">Enclosure Occupancy Radar</CardTitle>
              </div>
              <Link
                to="/dashboard/animals"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                <span>Manage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <HabitatUtilizationChart enclosures={enclosures} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Connected Modules Grid */}
      <section className="space-y-3 pt-2">
        <SectionHeading
          eyebrow="Integrated Farm Modules"
          title="Direct Operation Management"
          note="Navigate across all farm operational departments."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => (
            <Link
              key={module.title}
              to={module.to}
              className="dashboard-module-card group flex items-center gap-3.5 p-3.5"
            >
              <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', module.tone)}>
                <module.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-forest-950">{module.title}</span>
                <span className="block text-[11px] text-forest-500 mt-0.5 truncate">{module.subtitle}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-forest-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" />
            </Link>
          ))}
        </div>
      </section>

      {/* Activity Logs & Needs Attention Section */}
      <section className="grid gap-5 xl:grid-cols-3 pt-2">
        {/* Real Farm Activity Log */}
        {showDashboardAlerts && (
          <Card className="dashboard-stat-card xl:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between border-b border-forest-100/70 px-5 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Audit Trail</span>
                <CardTitle className="text-base font-bold text-forest-950 mt-0.5">{t('panel.recentActivity')}</CardTitle>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <Clock3 className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {activity.length === 0 ? (
                <EmptyState title={t('empty.noActivity')} />
              ) : (
                <ul className="space-y-3">
                  {activity.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex gap-3 items-start border-b border-forest-50 pb-2.5 last:border-0 last:pb-0">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
                        <Activity className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-semibold text-forest-950 leading-snug">{item.title}</p>
                        <p className="text-[10px] text-forest-400 mt-0.5">{item.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Real Needs Attention Alerts */}
        <Card className="dashboard-stat-card xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between border-b border-forest-100/70 px-5 py-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Health & Inventory Watch</span>
              <CardTitle className="text-base font-bold text-forest-950 mt-0.5">{t('panel.alerts')}</CardTitle>
            </div>
            <span className={cn('grid h-7 w-7 place-items-center rounded-lg', highAlerts ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700')}>
              <AlertTriangle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {alertError ? (
              <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-900">
                Alerts could not be loaded: {alertError}
              </div>
            ) : alerts.length === 0 ? (
              <EmptyState title={t('empty.noAlerts')} />
            ) : (
              <ul className="space-y-2.5">
                {alerts.slice(0, 5).map((alert) => (
                  <li key={alert.id}>
                    <Link
                      to={alert.href || '/dashboard/animals'}
                      className="group flex gap-2.5 rounded-xl border border-forest-100/70 bg-white p-2.5 text-xs transition-all hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
                    >
                      <span className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        alert.severity === 'high' ? 'bg-rose-500 ring-4 ring-rose-100' : alert.severity === 'medium' ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-emerald-500 ring-4 ring-emerald-100',
                      )} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-forest-950 group-hover:text-emerald-800">{alert.title}</p>
                          <span className={cn(
                            'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                            alert.severity === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700',
                          )}>
                            {alert.severity === 'high' ? 'Urgent' : 'Monitor'}
                          </span>
                        </div>
                        {alert.detail && <p className="mt-1 text-[11px] leading-relaxed text-forest-500">{alert.detail}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Operational Shortcuts */}
        <Card className="dashboard-stat-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-forest-100/70 px-5 py-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Fast Entry</span>
              <CardTitle className="text-base font-bold text-forest-950 mt-0.5">{t('panel.quickActions')}</CardTitle>
            </div>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <Zap className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5 p-4 sm:p-5">
            <QuickAction to="/dashboard/animals" icon={Beef} label={t('quick.addAnimal')} />
            <QuickAction to="/dashboard/expenses" icon={Wallet} label={t('quick.addExpense')} />
            <QuickAction to="/dashboard/sales" icon={ShoppingCart} label={t('quick.recordSale')} />
            <QuickAction to="/dashboard/production" icon={Egg} label={t('quick.addProduction')} />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function HeroMetric({ icon: Icon, label, value, foot, isPositive = true }) {
  return (
    <div className="dashboard-hero-metric p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-emerald-100/80">{label}</span>
        <Icon className="h-4 w-4 text-fresh-300" />
      </div>
      <p className="mt-2 break-words text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-emerald-200/70 truncate">{foot}</p>
    </div>
  )
}

function MiniMetric({ icon: Icon, label, value, warning = false }) {
  return (
    <div className="dashboard-stat-card flex items-center gap-3 p-3">
      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', warning ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800')}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-forest-500">{label}</p>
        <p className={cn('mt-0.5 text-base sm:text-lg font-black font-mono tabular-nums', warning ? 'text-amber-800' : 'text-forest-950')}>
          {value ?? '—'}
        </p>
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, note }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">{eyebrow}</p>
        <h2 className="text-lg font-extrabold text-forest-950">{title}</h2>
      </div>
      <p className="text-xs text-forest-500">{note}</p>
    </div>
  )
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="group flex flex-col justify-between p-3 rounded-xl border border-forest-100 bg-[#fbfdf9] hover:border-emerald-300 hover:bg-forest-50/50 transition-all shadow-2xs"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-800 mb-2 group-hover:scale-105 transition-transform">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex items-center justify-between text-xs font-bold text-forest-900">
        <span>{label}</span>
        <ArrowUpRight className="h-3 w-3 text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  )
}

function DateRangePicker({ value, onChange }) {
  const { t } = useTranslation()
  const options = [
    { v: '7d', label: t('range.7d') },
    { v: '30d', label: t('range.30d') },
    { v: '90d', label: t('range.90d') },
    { v: 'ytd', label: t('range.ytd') },
  ]

  return (
    <div className="flex items-center gap-1">
      {options.map((option) => (
        <button
          key={option.v}
          type="button"
          onClick={() => onChange(option.v)}
          className={cn(
            'rounded-lg px-2 py-1 text-xs font-semibold transition cursor-pointer',
            value === option.v
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-forest-600 hover:bg-forest-50 hover:text-emerald-900',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
