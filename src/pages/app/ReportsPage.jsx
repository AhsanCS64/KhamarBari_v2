import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp, TrendingDown, Wallet, ShoppingCart, Package, Users,
  Beef, DollarSign, BarChart3, AlertTriangle, Printer,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { Button } from '@/components/ui/button'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import ReportFilters from '@/components/reports/ReportFilters'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import {
  getOverview, getProfitLoss, getExpensesBreakdown,
  getSalesReport, getProductionReport, getInventoryReport, getWorkersReport,
} from '@/services/reportsService'
import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories'
import { SALE_ITEM_TYPES } from '@/lib/saleOptions'
import { PRODUCTION_TYPES } from '@/lib/productionTypes'
import { INVENTORY_CATEGORIES } from '@/lib/inventoryOptions'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview',   label: 'reports.overview',   icon: BarChart3 },
  { id: 'profitLoss', label: 'reports.profitLoss', icon: TrendingUp },
  { id: 'expenses',   label: 'reports.expenses',   icon: Wallet },
  { id: 'sales',      label: 'reports.sales',      icon: ShoppingCart },
  { id: 'production', label: 'reports.production', icon: Package },
  { id: 'inventory',  label: 'reports.inventory',  icon: Package },
  { id: 'workers',    label: 'reports.workers',    icon: Users },
]

export default function ReportsPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)

  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [dateFrom, setDateFrom] = useState(firstOfMonth.toISOString().slice(0, 10))
  const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10))
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState({})

  const bdt = (n) =>
    `৳${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const params = { farmId: farm.id, branchId: selectedBranchId, dateFrom, dateTo }

    Promise.all([
      getOverview(params),
      getProfitLoss(params),
      getExpensesBreakdown(params),
      getSalesReport(params),
      getProductionReport(params),
      getInventoryReport({ farmId: farm.id, branchId: selectedBranchId }),
      getWorkersReport(params),
    ])
      .then(([ov, pl, ex, sa, pr, iv, wk]) => {
        if (cancelled) return
        const firstError = [ov, pl, ex, sa, pr, iv, wk].find((r) => r.error)
        if (firstError) {
          setError(firstError.error)
          setLoading(false)
          return
        }
        setData({
          overview: ov.data,
          profitLoss: pl.data,
          expenses: ex.data,
          sales: sa.data,
          production: pr.data,
          inventory: iv.data,
          workers: wk.data,
        })
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e?.message || 'Failed to load reports')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [farm.id, selectedBranchId, dateFrom, dateTo])

  const exportCsv = () => {
    let header = []
    let rows = []

    if (tab === 'profitLoss') {
      header = ['Month', 'Revenue', 'Collected', 'Expenses', 'Utilities', 'Profit']
      rows = data.profitLoss.map((r) => [r.month, r.revenue, r.collected, r.expenses, r.utilities, r.profit])
    } else if (tab === 'expenses') {
      header = ['Category', 'Amount', 'Count']
      rows = data.expenses.categories.map((r) => [r.category, r.amount, r.count])
    } else if (tab === 'sales') {
      header = ['Item Type', 'Revenue', 'Collected', 'Count']
      rows = data.sales.items.map((r) => [r.itemType, r.revenue, r.collected, r.count])
    } else if (tab === 'production') {
      header = ['Type', 'Quantity', 'Unit', 'Records']
      rows = data.production.types.map((r) => [r.type, r.quantity, r.unit, r.count])
    } else if (tab === 'inventory') {
      header = ['Category', 'Items', 'Value']
      rows = data.inventory.categories.map((r) => [r.category, r.items, r.value])
    } else {
      header = ['Metric', 'Value']
      rows = Object.entries(data.overview).filter(([, v]) => typeof v !== 'object')
    }

    const lines = [header.join(','), ...rows.map((r) => r.join(','))]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${tab}-${dateFrom}-to-${dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-6">
        <SproutLoader label={t('common.loading')} />
      </div>
    )
  }

  if (error) {
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

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.reports')}</h1>
          <p className="mt-1 text-sm text-forest-700/70">{t('reports.subtitle')}</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> {t('reports.print')}
        </Button>
      </div>

      <ReportFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onExport={exportCsv}
        canExport
      />

      <div className="flex flex-wrap gap-1 rounded-2xl border border-forest-50 bg-white p-1 shadow-card">
        {TABS.map((tb) => {
          const Icon = tb.icon
          const active = tab === tb.id
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                active ? 'bg-forest text-white shadow-soft' : 'text-forest-700 hover:bg-sage'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(tb.label)}
            </button>
          )
        })}
      </div>

      {tab === 'overview' && <OverviewTab data={data.overview} bdt={bdt} t={t} />}
      {tab === 'profitLoss' && <ProfitLossTab data={data.profitLoss} bdt={bdt} t={t} />}
      {tab === 'expenses' && <ExpensesTab data={data.expenses} bdt={bdt} t={t} />}
      {tab === 'sales' && <SalesTab data={data.sales} bdt={bdt} t={t} />}
      {tab === 'production' && <ProductionTab data={data.production} t={t} />}
      {tab === 'inventory' && <InventoryTab data={data.inventory} bdt={bdt} t={t} />}
      {tab === 'workers' && <WorkersTab data={data.workers} bdt={bdt} t={t} />}
    </div>
  )
}

/* ─────────── TAB COMPONENTS ─────────── */

function OverviewTab({ data, bdt, t }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <BigKpi icon={TrendingUp} label={t('reports.revenue')} value={bdt(data.revenue)} color="fresh" />
        <BigKpi icon={TrendingDown} label={t('reports.expenses')} value={bdt(data.totalExpenditure)} color="earth" />
        <BigKpi icon={DollarSign} label={t('reports.netProfit')} value={bdt(data.netProfit)} color={data.netProfit >= 0 ? 'fresh' : 'danger'} />
        <BigKpi icon={Beef} label={t('reports.animals')} value={data.animals} color="default" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniKpi label={t('reports.collected')} value={bdt(data.collected)} />
        <MiniKpi label={t('reports.receivables')} value={bdt(data.receivables)} warning={data.receivables > 0} />
        <MiniKpi label={t('reports.profitMargin')} value={`${data.profitMargin.toFixed(1)}%`} />
        <MiniKpi label={t('reports.inventoryValue')} value={bdt(data.inventoryValue)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MiniKpi label={t('reports.activeWorkers')} value={`${data.activeWorkers} / ${data.totalWorkers}`} />
        <MiniKpi label={t('reports.monthlySalary')} value={bdt(data.monthlySalary)} />
        <MiniKpi label={t('reports.lowStock')} value={data.lowStockCount} warning={data.lowStockCount > 0} />
        <MiniKpi label={t('reports.enclosures')} value={data.enclosures} />
        <MiniKpi label={t('reports.occupancy')} value={`${data.occupancy.toLocaleString()} / ${data.capacity.toLocaleString()}`} />
      </div>
    </div>
  )
}

function ProfitLossTab({ data, bdt, t }) {
  if (!data || data.length === 0) return <EmptyState icon={TrendingUp} title={t('reports.noData')} />
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
        <h3 className="text-sm font-semibold text-forest-900 mb-3">{t('reports.pnlTrend')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5EDE6" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
            <Tooltip formatter={(v) => bdt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E5EDE6', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name={t('reports.revenue')} fill="#65A765" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" name={t('reports.expenses')} fill="#8B6A43" radius={[6, 6, 0, 0]} />
            <Bar dataKey="profit" name={t('reports.netProfit')} fill="#245C3A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('reports.month')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('reports.revenue')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('reports.collected')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('reports.expenses')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('reports.utilities')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('reports.netProfit')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.month} className="border-t border-forest-50">
                <td className="px-4 py-3 font-medium text-forest-900">{r.month}</td>
                <td className="px-4 py-3 text-right tabular-nums">{bdt(r.revenue)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{bdt(r.collected)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{bdt(r.expenses)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{bdt(r.utilities)}</td>
                <td className={cn('px-4 py-3 text-right font-semibold tabular-nums', r.profit < 0 ? 'text-red-600' : 'text-forest-900')}>
                  {bdt(r.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ExpensesTab({ data, bdt, t }) {
  if (!data || data.categories.length === 0) return <EmptyState icon={Wallet} title={t('reports.noData')} />
  const colors = EXPENSE_CATEGORIES.reduce((acc, c) => { acc[c.id] = c.color; return acc }, {})
  const pieData = data.categories.map((c) => ({
    name: EXPENSE_CATEGORIES.find((x) => x.id === c.category)?.label || c.category,
    value: c.amount,
    color: colors[c.category] || '#999',
  }))
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
        <h3 className="text-sm font-semibold text-forest-900 mb-3">{t('reports.byCategory')}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3} stroke="#fff" strokeWidth={2}>
              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(v) => bdt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E5EDE6', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('expenses.category')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('expenses.count')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('expenses.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((c) => {
              const cat = EXPENSE_CATEGORIES.find((x) => x.id === c.category)
              return (
                <tr key={c.category} className="border-t border-forest-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span className="h-2 w-2 rounded-full" style={{ background: cat?.color }} />
                      {cat?.label || c.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.count}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{bdt(c.amount)}</td>
                </tr>
              )
            })}
            <tr className="border-t-2 border-forest-100 bg-sage/30">
              <td className="px-4 py-3 font-semibold" colSpan={2}>{t('expenses.total')}</td>
              <td className="px-4 py-3 text-right font-bold tabular-nums">{bdt(data.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SalesTab({ data, bdt, t }) {
  if (!data || data.items.length === 0) return <EmptyState icon={ShoppingCart} title={t('reports.noData')} />
  const chartData = data.items.map((i) => ({
    name: SALE_ITEM_TYPES.find((x) => x.id === i.itemType)?.label || i.itemType,
    revenue: i.revenue,
    collected: i.collected,
  }))
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
        <h3 className="text-sm font-semibold text-forest-900 mb-3">{t('reports.byItemType')}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5EDE6" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
            <Tooltip formatter={(v) => bdt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E5EDE6', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name={t('reports.revenue')} fill="#65A765" radius={[6, 6, 0, 0]} />
            <Bar dataKey="collected" name={t('reports.collected')} fill="#245C3A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('sales.item')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('reports.revenue')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('reports.collected')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('sales.count')}</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((i) => (
              <tr key={i.itemType} className="border-t border-forest-50">
                <td className="px-4 py-3 font-medium text-forest-900">
                  {SALE_ITEM_TYPES.find((x) => x.id === i.itemType)?.label || i.itemType}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{bdt(i.revenue)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{bdt(i.collected)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{i.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductionTab({ data, t }) {
  if (!data || data.types.length === 0) return <EmptyState icon={Package} title={t('reports.noData')} />
  return (
    <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
          <tr>
            <th className="px-4 py-3 font-semibold">{t('production.type')}</th>
            <th className="px-4 py-3 text-right font-semibold">{t('production.quantity')}</th>
            <th className="px-4 py-3 text-right font-semibold">{t('production.unit')}</th>
            <th className="px-4 py-3 text-right font-semibold">{t('common.count')}</th>
          </tr>
        </thead>
        <tbody>
          {data.types.map((r) => {
            const cfg = PRODUCTION_TYPES.find((x) => x.id === r.type)
            return (
              <tr key={r.type} className="border-t border-forest-50">
                <td className="px-4 py-3 font-medium text-forest-900">{cfg?.label || r.type}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{r.quantity}</td>
                <td className="px-4 py-3 text-right text-forest-700/70">{r.unit}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.count}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function InventoryTab({ data, bdt, t }) {
  if (!data || data.categories.length === 0) return <EmptyState icon={Package} title={t('reports.noData')} />
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <MiniKpi label={t('reports.totalItems')} value={data.totalItems} />
        <MiniKpi label={t('reports.inventoryValue')} value={bdt(data.totalValue)} />
        <MiniKpi label={t('reports.lowStock')} value={data.lowStock} warning={data.lowStock > 0} />
        <MiniKpi label={t('reports.expiring')} value={data.expiring + data.expired} warning={data.expiring + data.expired > 0} />
      </div>
      <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('inventory.category')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('reports.items')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('reports.value')}</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((c) => (
              <tr key={c.category} className="border-t border-forest-50">
                <td className="px-4 py-3 font-medium text-forest-900">
                  {INVENTORY_CATEGORIES.find((x) => x.id === c.category)?.label || c.category}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{c.items}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{bdt(c.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WorkersTab({ data, bdt, t }) {
  if (!data) return null
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <MiniKpi label={t('reports.totalWorkers')} value={data.totalWorkers} />
        <MiniKpi label={t('reports.activeWorkers')} value={data.activeWorkers} />
        <MiniKpi label={t('reports.monthlySalary')} value={bdt(data.monthlySalary)} />
        <MiniKpi label={t('reports.totalPaid')} value={bdt(data.totalPaid)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
          <h3 className="text-sm font-semibold text-forest-900 mb-3">{t('reports.attendance')}</h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(data.attendanceByStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="capitalize text-forest-700">{status.replace('_', ' ')}</span>
                <span className="font-semibold tabular-nums text-forest-900">{count}</span>
              </li>
            ))}
            {Object.keys(data.attendanceByStatus).length === 0 && (
              <li className="text-forest-700/60 text-xs">{t('reports.noData')}</li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
          <h3 className="text-sm font-semibold text-forest-900 mb-3">{t('reports.payments')}</h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(data.paidByType).map(([type, amount]) => (
              <li key={type} className="flex justify-between">
                <span className="capitalize text-forest-700">{type}</span>
                <span className="font-semibold tabular-nums text-forest-900">{bdt(amount)}</span>
              </li>
            ))}
            {Object.keys(data.paidByType).length === 0 && (
              <li className="text-forest-700/60 text-xs">{t('reports.noData')}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ─────────── SMALL COMPONENTS ─────────── */

function BigKpi({ icon: Icon, label, value, color = 'default' }) {
  const tones = {
    default: 'bg-sage text-forest-700',
    fresh: 'bg-fresh-100 text-fresh-600',
    earth: 'bg-earth/10 text-earth-700',
    danger: 'bg-red-100 text-red-600',
  }
  return (
    <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', tones[color])}>
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-wide text-forest-700/60">{label}</p>
      <p className="mt-1 text-xl font-bold text-forest-900">{value}</p>
    </div>
  )
}

function MiniKpi({ label, value, warning = false }) {
  return (
    <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
      <p className="text-[11px] uppercase tracking-wide text-forest-700/60">{label}</p>
      <p className={cn('mt-1 text-lg font-bold', warning ? 'text-red-600' : 'text-forest-900')}>{value}</p>
    </div>
  )
}