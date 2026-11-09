import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Search, Pencil, Trash2, Zap, AlertTriangle, Download,
  Wallet, Clock, TrendingUp,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import UtilityDialog from '@/components/utilities/UtilityDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listUtilities, deleteUtility, getUtilitiesTotals } from '@/services/utilitiesService'
import { UTILITY_TYPES, BILL_STATUSES } from '@/lib/utilityOptions'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

export default function UtilitiesPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ totalBills: 0, totalAmount: 0, unpaidCount: 0, unpaidAmount: 0, byType: {} })

  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [month, setMonth] = useState('')
  const [page, setPage] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null, loading: false })

  const refresh = async () => {
    setLoading(true); setError('')
    const { data, error } = await listUtilities({
      farmId: farm.id, branchId: selectedBranchId, search, type, status, month,
    })
    if (error) { setError(error); setLoading(false); return }
    setRows(data)
    const tot = await getUtilitiesTotals({ farmId: farm.id, branchId: selectedBranchId })
    setTotals(tot.data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm.id, selectedBranchId, search, type, status, month])

  useEffect(() => { setPage(1) }, [search, type, status, month, selectedBranchId])

  const pageRows = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page])
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  const monthlyData = useMemo(() => {
    const byMonth = {}
    rows.forEach((r) => {
      const m = r.billingPeriod?.slice(0, 7) || 'unknown'
      if (!byMonth[m]) byMonth[m] = { month: m, amount: 0, unpaid: 0 }
      byMonth[m].amount += r.amount
      if (r.status !== 'paid') byMonth[m].unpaid += r.amount
    })
    return Object.values(byMonth).sort((a, b) => (a.month < b.month ? -1 : 1)).slice(-6)
  }, [rows])

  const bdt = (n) => `৳${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    await deleteUtility(confirm.row.id)
    setConfirm({ open: false, row: null, loading: false })
    refresh()
  }

  const exportCsv = () => {
    const header = ['Period', 'Type', 'Provider', 'Meter', 'Prev', 'Current', 'Consumption', 'Amount', 'Due', 'Paid', 'Status']
    const lines = [header.join(',')]
    rows.forEach((r) => {
      lines.push([
        r.billingPeriod, r.type, `"${r.provider || ''}"`, r.meterNo || '',
        r.prevReading, r.currentReading, r.consumption, r.amount,
        r.dueDate || '', r.paidDate || '', r.status,
      ].join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `utilities-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.utilities')}</h1>
          <p className="mt-1 text-sm text-forest-700/70">{t('utilities.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" /> {t('common.export')}
          </Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4" /> {t('utilities.add')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('utilities.totalBills')} value={totals.totalBills} tone="default" icon={Zap} />
        <KpiCard label={t('utilities.totalAmount')} value={bdt(totals.totalAmount)} tone="fresh" icon={TrendingUp} />
        <KpiCard label={t('utilities.unpaidCount')} value={totals.unpaidCount} tone="warning" icon={Clock} />
        <KpiCard label={t('utilities.unpaidAmount')} value={bdt(totals.unpaidAmount)} tone="earth" icon={Wallet} />
      </div>

      {monthlyData.length > 0 && (
        <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
          <h3 className="text-sm font-semibold text-forest-900 mb-2">{t('utilities.monthlyTrend')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5EDE6" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
              <Tooltip formatter={(v) => bdt(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E5EDE6', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="amount" name={t('utilities.totalAmount')} fill="#245C3A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="unpaid" name={t('utilities.unpaidAmount')} fill="#DC2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-700/50" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('utilities.searchPlaceholder')} className="pl-9" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm">
          <option value="all">{t('utilities.allTypes')}</option>
          {UTILITY_TYPES.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm">
          <option value="all">{t('utilities.allStatuses')}</option>
          {BILL_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm" />
      </div>

      <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
        {loading ? (
          <SproutLoader label={t('common.loading')} />
        ) : error ? (
          <EmptyState icon={AlertTriangle} title={t('errors.generic')} description={error} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Zap}
            title={t('utilities.emptyTitle')}
            description={t('utilities.emptyDesc')}
            action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> {t('utilities.add')}</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('utilities.billingPeriod')}</th>
                    <th className="px-4 py-3 font-semibold">{t('utilities.type')}</th>
                    <th className="px-4 py-3 font-semibold">{t('utilities.consumption')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('utilities.amount')}</th>
                    <th className="px-4 py-3 font-semibold">{t('utilities.dueDate')}</th>
                    <th className="px-4 py-3 font-semibold">{t('utilities.status')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const cfg = UTILITY_TYPES.find((u) => u.id === r.type)
                    const st = BILL_STATUSES.find((s) => s.id === r.status)
                    return (
                      <tr key={r.id} className="border-t border-forest-50 hover:bg-sage/20">
                        <td className="px-4 py-3 text-forest-700/80 whitespace-nowrap">{r.billingPeriod}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-forest-900">{cfg?.label || r.type}</div>
                          {r.provider && <div className="text-xs text-forest-700/60">{r.provider}</div>}
                        </td>
                        <td className="px-4 py-3 text-xs text-forest-700/80">
                          {r.consumption} {r.unit}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{bdt(r.amount)}</td>
                        <td className="px-4 py-3 text-xs text-forest-700/80">{r.dueDate || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ color: st?.color, background: `${st?.color}1A` }}
                          >
                            {st?.label || r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => { setEditing(r); setDialogOpen(true) }} className="rounded-lg p-1.5 hover:bg-sage text-forest-700" title={t('common.edit')}>
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setConfirm({ open: true, row: r, loading: false })} className="rounded-lg p-1.5 hover:bg-red-50 text-red-600" title={t('common.delete')}>
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

      <UtilityDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}
        editing={editing}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
        title={t('utilities.deleteTitle')}
        description={t('utilities.deleteDesc')}
        confirmLabel={t('common.delete')}
        destructive
        loading={confirm.loading}
        onConfirm={onDelete}
      />
    </div>
  )
}

function KpiCard({ label, value, tone = 'default', icon: Icon }) {
  const tones = {
    default: 'bg-sage text-forest-700',
    fresh: 'bg-fresh-100 text-fresh-600',
    earth: 'bg-earth/10 text-earth-700',
    warning: 'bg-amber-100 text-amber-700',
  }
  return (
    <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', tones[tone])}>
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-wide text-forest-700/60">{label}</p>
      <p className="mt-1 text-lg font-bold text-forest-900">{value}</p>
    </div>
  )
}