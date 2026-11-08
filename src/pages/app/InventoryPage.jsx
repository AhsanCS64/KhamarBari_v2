import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Search, Pencil, Trash2, Package, AlertTriangle, Download,
  TrendingUp, Clock, ArrowRightLeft, History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ItemDialog from '@/components/inventory/ItemDialog'
import MovementDialog from '@/components/inventory/MovementDialog'
import MovementHistoryDialog from '@/components/inventory/MovementHistoryDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listItems, deleteItem, getInventoryTotals } from '@/services/inventoryService'
import { INVENTORY_CATEGORIES, STOCK_FILTERS } from '@/lib/inventoryOptions'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

export default function InventoryPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ totalItems: 0, totalValue: 0, lowStock: 0, expiring: 0, expired: 0 })

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [itemDialog, setItemDialog] = useState({ open: false, editing: null })
  const [movementDialog, setMovementDialog] = useState({ open: false, item: null })
  const [historyDialog, setHistoryDialog] = useState({ open: false, item: null })
  const [confirm, setConfirm] = useState({ open: false, row: null, loading: false })

  const refresh = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await listItems({
      farmId: farm.id, branchId: selectedBranchId, search, category, stockStatus: stockFilter,
    })
    if (error) { setError(error); setLoading(false); return }
    setRows(data)
    const tot = await getInventoryTotals({ farmId: farm.id, branchId: selectedBranchId })
    setTotals(tot.data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm.id, selectedBranchId, search, category, stockFilter])

  useEffect(() => { setPage(1) }, [search, category, stockFilter, selectedBranchId])

  const pageRows = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page])
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  const bdt = (n) => `৳${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`

  const daysToExpiry = (date) => {
    if (!date) return null
    return Math.floor((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    await deleteItem(confirm.row.id)
    setConfirm({ open: false, row: null, loading: false })
    refresh()
  }

  const exportCsv = () => {
    const header = ['Name', 'SKU', 'Category', 'Unit', 'Quantity', 'Min', 'Unit Price', 'Value', 'Supplier', 'Expiry']
    const lines = [header.join(',')]
    rows.forEach((r) => {
      lines.push([
        `"${r.name}"`, r.sku, r.category, r.unit, r.quantity, r.minimumThreshold, r.unitPrice,
        r.quantity * r.unitPrice, `"${r.supplier || ''}"`, r.expiryDate || '',
      ].join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.inventory')}</h1>
          <p className="mt-1 text-sm text-forest-700/70">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" /> {t('common.export')}
          </Button>
          <Button onClick={() => setItemDialog({ open: true, editing: null })}>
            <Plus className="h-4 w-4" /> {t('inventory.addItem')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('inventory.totalItems')} value={totals.totalItems} tone="default" icon={Package} />
        <KpiCard label={t('inventory.totalValue')} value={bdt(totals.totalValue)} tone="fresh" icon={TrendingUp} />
        <KpiCard label={t('inventory.lowStock')} value={totals.lowStock} tone="earth" icon={AlertTriangle} />
        <KpiCard label={t('inventory.expiring')} value={totals.expiring + totals.expired} tone="warning" icon={Clock} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-700/50" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('inventory.searchPlaceholder')} className="pl-9" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm">
          <option value="all">{t('inventory.allCategories')}</option>
          {INVENTORY_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm">
          {STOCK_FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
        {loading ? (
          <SproutLoader label={t('common.loading')} />
        ) : error ? (
          <EmptyState icon={AlertTriangle} title={t('errors.generic')} description={error} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t('inventory.emptyTitle')}
            description={t('inventory.emptyDesc')}
            action={
              <Button onClick={() => setItemDialog({ open: true, editing: null })}>
                <Plus className="h-4 w-4" /> {t('inventory.addItem')}
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('inventory.name')}</th>
                    <th className="px-4 py-3 font-semibold">{t('inventory.category')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('inventory.quantity')}</th>
                    <th className="px-4 py-3 font-semibold">{t('inventory.expiry')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('inventory.value')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const cat = INVENTORY_CATEGORIES.find((c) => c.id === r.category)
                    const days = daysToExpiry(r.expiryDate)
                    const isLow = Number(r.quantity) <= Number(r.minimumThreshold) && Number(r.quantity) > 0
                    return (
                      <tr key={r.id} className="border-t border-forest-50 hover:bg-sage/20">
                        <td className="px-4 py-3">
                          <div className="font-medium text-forest-900">{r.name}</div>
                          {r.sku && <div className="text-xs text-forest-700/60">SKU: {r.sku}</div>}
                          {r.supplier && <div className="text-xs text-forest-700/60">{r.supplier}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <span className="h-2 w-2 rounded-full" style={{ background: cat?.color }} />
                            {cat?.label || r.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className={cn('font-semibold tabular-nums', isLow ? 'text-red-600' : 'text-forest-900')}>
                            {r.quantity} {r.unit}
                          </div>
                          {isLow && (
                            <div className="text-[10px] text-red-600 uppercase font-semibold">
                              {t('inventory.lowBadge')}
                            </div>
                          )}
                          <div className="text-[10px] text-forest-700/60">
                            {t('inventory.min')}: {r.minimumThreshold}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {r.expiryDate ? (
                            <div>
                              <div className="text-xs text-forest-700/80">{r.expiryDate}</div>
                              {days !== null && (
                                <div className={cn(
                                  'text-[10px] font-semibold',
                                  days < 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-forest-700/60'
                                )}>
                                  {days < 0
                                    ? t('inventory.expired')
                                    : t('inventory.daysLeft', { days })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-forest-700/40">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          {bdt(r.quantity * r.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setMovementDialog({ open: true, item: r })}
                              className="rounded-lg p-1.5 hover:bg-sage text-forest-700"
                              title={t('inventory.recordMovement')}
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setHistoryDialog({ open: true, item: r })}
                              className="rounded-lg p-1.5 hover:bg-sage text-forest-700"
                              title={t('inventory.movementHistory')}
                            >
                              <History className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setItemDialog({ open: true, editing: r })}
                              className="rounded-lg p-1.5 hover:bg-sage text-forest-700"
                              title={t('common.edit')}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConfirm({ open: true, row: r, loading: false })}
                              className="rounded-lg p-1.5 hover:bg-red-50 text-red-600"
                              title={t('common.delete')}
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

      <ItemDialog
        open={itemDialog.open}
        onOpenChange={(o) => setItemDialog({ open: o, editing: o ? itemDialog.editing : null })}
        editing={itemDialog.editing}
        onSaved={refresh}
      />

      <MovementDialog
        open={movementDialog.open}
        onOpenChange={(o) => setMovementDialog({ open: o, item: o ? movementDialog.item : null })}
        item={movementDialog.item}
        onSaved={refresh}
      />

      <MovementHistoryDialog
        open={historyDialog.open}
        onOpenChange={(o) => setHistoryDialog({ open: o, item: o ? historyDialog.item : null })}
        item={historyDialog.item}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
        title={t('inventory.deleteTitle')}
        description={t('inventory.deleteDesc')}
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