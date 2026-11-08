import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Search, Pencil, Trash2, ShoppingCart, AlertTriangle, Download,
  TrendingUp, Wallet, Receipt,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import SaleDialog from '@/components/sales/SaleDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listSales, deleteSale, getSalesTotals } from '@/services/salesService'
import { SALE_ITEM_TYPES, PAYMENT_STATUSES } from '@/lib/saleOptions'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

export default function SalesPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ revenue: 0, collected: 0, outstanding: 0, count: 0 })

  const [search, setSearch] = useState('')
  const [itemType, setItemType] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null, loading: false })

  const refresh = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await listSales({
      farmId: farm.id,
      branchId: selectedBranchId,
      search,
      itemType,
      paymentStatus,
      dateFrom,
      dateTo,
    })
    if (error) {
      setError(error)
      setLoading(false)
      return
    }
    setRows(data)
    const tot = await getSalesTotals({
      farmId: farm.id,
      branchId: selectedBranchId,
      dateFrom,
      dateTo,
    })
    setTotals(tot.data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm.id, selectedBranchId, search, itemType, paymentStatus, dateFrom, dateTo])

  useEffect(() => {
    setPage(1)
  }, [search, itemType, paymentStatus, dateFrom, dateTo, selectedBranchId])

  const pageRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  )
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  const monthlyData = useMemo(() => {
    const byMonth = {}
    rows.forEach((r) => {
      const m = r.date?.slice(0, 7) || 'unknown'
      if (!byMonth[m]) byMonth[m] = { month: m, revenue: 0, collected: 0 }
      byMonth[m].revenue += r.total
      byMonth[m].collected += r.paidAmount
    })
    return Object.values(byMonth)
      .sort((a, b) => (a.month < b.month ? -1 : 1))
      .slice(-6)
  }, [rows])

  const bdt = (n) =>
    `৳${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    await deleteSale(confirm.row.id)
    setConfirm({ open: false, row: null, loading: false })
    refresh()
  }

  const exportCsv = () => {
    const header = [
      'Date', 'Invoice', 'Item', 'Enclosure', 'Quantity', 'Unit', 'Unit Price',
      'Total', 'Paid', 'Outstanding', 'Buyer', 'Payment Status',
    ]
    const lines = [header.join(',')]
    rows.forEach((r) => {
      lines.push(
        [
          r.date,
          r.invoiceNo,
          r.itemType,
          `"${(r.enclosureName || '').replace(/"/g, '""')}"`,
          r.quantity,
          r.unit,
          r.unitPrice,
          r.total,
          r.paidAmount,
          r.outstanding,
          `"${(r.buyer || '').replace(/"/g, '""')}"`,
          r.paymentStatus,
        ].join(',')
      )
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.sales')}</h1>
          <p className="mt-1 text-sm text-forest-700/70">{t('sales.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" /> {t('common.export')}
          </Button>
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> {t('sales.add')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('sales.revenue')} value={bdt(totals.revenue)} tone="fresh" icon={TrendingUp} />
        <KpiCard label={t('sales.collected')} value={bdt(totals.collected)} tone="default" icon={Wallet} />
        <KpiCard label={t('sales.outstanding')} value={bdt(totals.outstanding)} tone="earth" icon={Receipt} />
        <KpiCard label={t('sales.count')} value={totals.count} tone="default" icon={ShoppingCart} />
      </div>

      {monthlyData.length > 0 && (
        <div className="rounded-2xl border border-forest-50 bg-white p-4 shadow-card">
          <h3 className="text-sm font-semibold text-forest-900 mb-2">{t('sales.monthlyTrend')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5EDE6" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
              <Tooltip
                formatter={(v) => bdt(v)}
                contentStyle={{ borderRadius: 12, border: '1px solid #E5EDE6', fontSize: 12 }}
              />
              <Bar dataKey="revenue" name={t('sales.revenue')} fill="#65A765" radius={[6, 6, 0, 0]} />
              <Bar dataKey="collected" name={t('sales.collected')} fill="#245C3A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-700/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('sales.searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <select
          value={itemType}
          onChange={(e) => setItemType(e.target.value)}
          className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm"
        >
          <option value="all">{t('sales.allItems')}</option>
          {SALE_ITEM_TYPES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm"
        >
          <option value="all">{t('sales.allStatuses')}</option>
          {PAYMENT_STATUSES.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm"
        />
      </div>

      <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
        {loading ? (
          <SproutLoader label={t('common.loading')} />
        ) : error ? (
          <EmptyState icon={AlertTriangle} title={t('errors.generic')} description={error} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={t('sales.emptyTitle')}
            description={t('sales.emptyDesc')}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" /> {t('sales.add')}
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('sales.date')}</th>
                    <th className="px-4 py-3 font-semibold">{t('sales.invoice')}</th>
                    <th className="px-4 py-3 font-semibold">{t('sales.item')}</th>
                    <th className="px-4 py-3 font-semibold">{t('sales.buyer')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('sales.total')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('sales.outstanding')}</th>
                    <th className="px-4 py-3 font-semibold">{t('sales.status')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const item = SALE_ITEM_TYPES.find((s) => s.id === r.itemType)
                    const status = PAYMENT_STATUSES.find((p) => p.id === r.paymentStatus)
                    return (
                      <tr key={r.id} className="border-t border-forest-50 hover:bg-sage/20">
                        <td className="px-4 py-3 text-forest-700/80 whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-3 text-xs font-mono text-forest-700/70">{r.invoiceNo}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-forest-900">{item?.label || r.itemType}</div>
                          <div className="text-xs text-forest-700/60">
                            {r.quantity} {r.unit} × {bdt(r.unitPrice)}
                          </div>
                          {r.enclosureName && (
                            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                              Habitat: {r.enclosureName}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-forest-700/80">
                          {r.buyer}
                          {r.buyerContact && (
                            <div className="text-xs text-forest-700/60">{r.buyerContact}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{bdt(r.total)}</td>
                        <td
                          className={cn(
                            'px-4 py-3 text-right font-semibold tabular-nums',
                            r.outstanding > 0 ? 'text-red-600' : 'text-forest-700/60'
                          )}
                        >
                          {bdt(r.outstanding)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ color: status?.color, background: `${status?.color}1A` }}
                          >
                            {status?.label || r.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditing(r)
                                setDialogOpen(true)
                              }}
                              className="rounded-lg p-1.5 hover:bg-sage text-forest-700"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConfirm({ open: true, row: r, loading: false })}
                              className="rounded-lg p-1.5 hover:bg-red-50 text-red-600"
                              aria-label="Delete"
                            >
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
                <span className="text-forest-700/60">
                  {t('common.page')} {page} / {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    {t('common.prev')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SaleDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o)
          if (!o) setEditing(null)
        }}
        editing={editing}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
        title={t('sales.deleteTitle')}
        description={t('sales.deleteDesc')}
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