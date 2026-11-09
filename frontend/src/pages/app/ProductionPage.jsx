import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Search, Pencil, Trash2, Milk, Egg, Weight, Heart, Baby, Skull,
  Wheat, AlertTriangle, Download, TrendingUp, Activity, Ham,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ProductionDialog from '@/components/production/ProductionDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listProduction, deleteProduction, getProductionTotals, getProductionTrend } from '@/services/productionService'
import { PRODUCTION_TYPES, SESSIONS } from '@/lib/productionTypes'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12
const ICON_MAP = { Milk, Egg, Weight, Heart, Baby, Skull, Wheat, Ham }

export default function ProductionPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ byType: {}, count: 0 })
  const [trend, setTrend] = useState([])
  const [trendType, setTrendType] = useState('milk')

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null, loading: false })

  const refresh = async () => {
    setLoading(true); setError('')
    const { data, error } = await listProduction({
      farmId: farm.id, branchId: selectedBranchId, type, search, dateFrom, dateTo,
    })
    if (error) { setError(error); setLoading(false); return }
    setRows(data)
    const tot = await getProductionTotals({ farmId: farm.id, branchId: selectedBranchId, dateFrom, dateTo })
    setTotals(tot.data)
    const tr = await getProductionTrend({ farmId: farm.id, branchId: selectedBranchId, type: trendType, days: 14 })
    setTrend(tr.data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm.id, selectedBranchId, search, type, dateFrom, dateTo, trendType])

  useEffect(() => { setPage(1) }, [search, type, dateFrom, dateTo, selectedBranchId])

  const pageRows = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page])
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  const fmt = (n, unit) =>
    `${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')} ${unit || ''}`

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    const result = await deleteProduction(confirm.row.id)
    if (result.error) {
      setError(result.error)
      setConfirm((current) => ({ ...current, loading: false }))
      return
    }
    setConfirm({ open: false, row: null, loading: false })
    window.dispatchEvent(new CustomEvent('khamar:enclosures-changed'))
    refresh()
  }

  const exportCsv = () => {
    const header = ['Date', 'Type', 'Enclosure', 'Animal', 'Session', 'Quantity', 'Unit', 'Meat Yield (kg)', 'Quality', 'Recorder', 'Notes']
    const lines = [header.join(',')]
    rows.forEach((r) => {
      lines.push([
        r.date, r.type, `"${r.enclosureName || ''}"`, `"${r.animalName || ''}"`, r.session || '', r.quantity, r.unit, r.meatYieldKg || '',
        r.quality || '', `"${r.recorder || ''}"`, `"${(r.notes || '').replace(/"/g, '""')}"`,
      ].join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `production-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const trendTypeCfg = PRODUCTION_TYPES.find((p) => p.id === trendType)

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.production')}</h1>
          <p className="mt-1 text-sm text-forest-700/70">{t('production.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" /> {t('common.export')}
          </Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> {t('production.add')}
          </Button>
        </div>
      </div>

      {/* KPI tiles per type */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {PRODUCTION_TYPES.slice(0, 4).map((p) => {
          const Icon = ICON_MAP[p.icon] || Activity
          const stat = totals.byType[p.id]
          return (
            <div key={p.id} className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: p.color }} />
                </div>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-forest-700/60">{p.label}</p>
              <p className="mt-1 text-lg font-bold text-forest-900">
                {stat ? fmt(stat.quantity, stat.unit) : '—'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Trend chart with type selector */}
      <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-forest-900">{t('production.trend')}</h3>
          <select
            value={trendType}
            onChange={(e) => setTrendType(e.target.value)}
            className="h-8 rounded-lg border border-forest-100 bg-white px-2 text-xs"
          >
            {PRODUCTION_TYPES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        {trend.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-forest-700/60">
            {t('empty.noProduction')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5EDE6" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
              <Tooltip formatter={(v) => fmt(v, trendTypeCfg?.unit)} contentStyle={{ borderRadius: 12, border: '1px solid #E5EDE6', fontSize: 12 }} />
              <Line type="monotone" dataKey="quantity" name={trendTypeCfg?.label} stroke={trendTypeCfg?.color || '#245C3A'} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-700/50" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('production.searchPlaceholder')} className="pl-9" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm">
          <option value="all">{t('production.allTypes')}</option>
          {PRODUCTION_TYPES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm" />
      </div>

      <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
        {loading ? (
          <SproutLoader label={t('common.loading')} />
        ) : error ? (
          <EmptyState icon={AlertTriangle} title={t('errors.generic')} description={error} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Milk}
            title={t('production.emptyTitle')}
            description={t('production.emptyDesc')}
            action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> {t('production.add')}</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('production.date')}</th>
                    <th className="px-4 py-3 font-semibold">{t('production.type')}</th>
                    <th className="px-4 py-3 font-semibold">Habitat / Animal</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('production.quantity')}</th>
                    <th className="px-4 py-3 text-right font-semibold">Meat Yield</th>
                    <th className="px-4 py-3 font-semibold">{t('production.session')}</th>
                    <th className="px-4 py-3 font-semibold">{t('production.recorder')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const p = PRODUCTION_TYPES.find((x) => x.id === r.type)
                    const Icon = ICON_MAP[p?.icon] || Activity
                    const sess = SESSIONS.find((s) => s.id === r.session)
                    return (
                      <tr key={r.id} className="border-t border-forest-50 hover:bg-sage/20">
                        <td className="px-4 py-3 text-forest-700/80 whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <span className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: `${p?.color}15` }}>
                              <Icon className="h-3.5 w-3.5" style={{ color: p?.color }} />
                            </span>
                            {p?.label || r.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-forest-700/80">
                          <div className="font-medium text-forest-950">{r.enclosureName || r.animalName || '—'}</div>
                          {r.enclosureName && r.animalName && (
                            <div className="text-[11px] text-forest-500 font-normal">{r.animalName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{fmt(r.quantity, r.unit)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-xs">
                          {r.meatYieldKg ? (
                            <span className="inline-flex items-center gap-1 text-red-700 font-semibold capitalize">
                              <Ham className="h-3 w-3" />
                              {r.meatType ? `${r.meatType.replace('_', ' ')} · ` : ''}{r.meatYieldKg} kg
                            </span>
                          ) : <span className="text-forest-700/40">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-forest-700/60">{sess?.label || '—'}</td>
                        <td className="px-4 py-3 text-xs text-forest-700/60">{r.recorder || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => { setEditing(r); setDialogOpen(true) }} className="rounded-lg p-1.5 hover:bg-sage text-forest-700" aria-label="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setConfirm({ open: true, row: r, loading: false })} className="rounded-lg p-1.5 hover:bg-red-50 text-red-600" aria-label="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-forest-50 text-sm">
                <span className="text-forest-700/60">{t('common.page')} {page} / {totalPages}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    {t('common.prev')}
                  </Button>
                  <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ProductionDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}
        editing={editing}
        onSaved={() => {
          window.dispatchEvent(new CustomEvent('khamar:enclosures-changed'))
          refresh()
        }}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
        title={t('production.deleteTitle')}
        description={t('production.deleteDesc')}
        confirmLabel={t('common.delete')}
        destructive
        loading={confirm.loading}
        onConfirm={onDelete}
      />
    </div>
  )
}