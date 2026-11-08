import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Download, Filter, Pencil, Plus, Search, Trash2, Wallet } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import EmptyState from '@/components/common/EmptyState'
import SproutLoader from '@/components/common/SproutLoader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ExpenseDialog from '@/components/expenses/ExpenseDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { deleteExpense, getExpenseTotals, listExpenses } from '@/services/expensesService'
import { EXPENSE_CATEGORIES } from '@/lib/expenseCategories'

const PAGE_SIZE = 10

export default function ExpensesPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((state) => state.farm)
  const selectedBranchId = useAppStore((state) => state.selectedBranchId)
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ total: 0, count: 0, byCategory: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null, loading: false })

  const refresh = async () => {
    setLoading(true)
    setError('')
    const filters = { farmId: farm?.id, branchId: selectedBranchId, search, category, dateFrom, dateTo }
    const result = await listExpenses(filters)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    setRows(result.data || [])
    const summary = await getExpenseTotals({ farmId: farm?.id, branchId: selectedBranchId, dateFrom, dateTo })
    setTotals(summary.data || { total: 0, count: 0, byCategory: {} })
    setLoading(false)
  }

  useEffect(() => { refresh() }, [farm?.id, selectedBranchId, search, category, dateFrom, dateTo])
  useEffect(() => { setPage(1) }, [search, category, dateFrom, dateTo, selectedBranchId])

  const chartData = useMemo(() => Object.entries(totals.byCategory)
    .map(([id, value]) => {
      const item = EXPENSE_CATEGORIES.find((entry) => entry.id === id)
      return { name: item?.label || id, value, color: item?.color || '#6b8371' }
    })
    .sort((a, b) => b.value - a.value), [totals.byCategory])
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const money = (value) => `৳${Number(value || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`

  const exportCsv = () => {
    const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const csvRows = [
      ['Date', 'Title', 'Category', 'Amount', 'Payment method', 'Paid by', 'Supplier'].join(','),
      ...rows.map((row) => [row.date, quote(row.title), row.category, row.amount, row.paymentMethod, quote(row.paidBy), quote(row.supplier)].join(',')),
    ]
    const url = URL.createObjectURL(new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    setConfirm((current) => ({ ...current, loading: true }))
    const result = await deleteExpense(confirm.row.id)
    if (result.error) setError(result.error)
    setConfirm({ open: false, row: null, loading: false })
    await refresh()
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">Farm finances</p>
          <h1 className="mt-1 text-2xl font-bold text-forest-900">{t('sidebar.expenses')}</h1>
          <p className="mt-1 text-sm text-forest-700/70">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={!rows.length}><Download className="h-4 w-4" />{t('common.export')}</Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }}><Plus className="h-4 w-4" />{t('expenses.add')}</Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric icon={Wallet} label={t('expenses.total')} value={money(totals.total)} tone="earth" />
        <Metric icon={Filter} label={t('expenses.count')} value={totals.count} />
        <Metric icon={AlertTriangle} label={t('expenses.topCategory')} value={chartData[0]?.name || '—'} tone="fresh" />
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-700/50" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('expenses.searchPlaceholder')} className="pl-9" />
        </div>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm">
          <option value="all">{t('expenses.allCategories')}</option>
          {EXPENSE_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <label className="sr-only" htmlFor="expense-date-from">Date from</label>
        <Input id="expense-date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-auto" />
        <label className="sr-only" htmlFor="expense-date-to">Date to</label>
        <Input id="expense-date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="w-auto" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.8fr)]">
        <div className="rounded-2xl border border-forest-100 bg-white p-4 shadow-soft">
          <h2 className="mb-2 text-sm font-semibold text-forest-900">{t('expenses.byCategory')}</h2>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3} stroke="#fff" strokeWidth={2}>
                  {chartData.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 12, border: '1px solid #dce8df', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex h-[240px] items-center justify-center text-sm text-forest-700/60">{t('empty.noExpenses')}</div>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-soft">
          {loading ? <SproutLoader label={t('common.loading')} /> : error ? <EmptyState icon={AlertTriangle} title={t('errors.generic')} description={error} /> : !rows.length ? (
            <EmptyState icon={Wallet} title={t('expenses.emptyTitle')} description={t('expenses.emptyDesc')} action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />{t('expenses.add')}</Button>} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70"><tr>
                    <th className="px-4 py-3">{t('expenses.date')}</th><th className="px-4 py-3">{t('expenses.title')}</th><th className="px-4 py-3">{t('expenses.category')}</th><th className="px-4 py-3 text-right">{t('expenses.amount')}</th><th className="px-4 py-3">{t('expenses.paymentMethod')}</th><th className="px-4 py-3" />
                  </tr></thead>
                  <tbody>{pageRows.map((row) => {
                    const item = EXPENSE_CATEGORIES.find((entry) => entry.id === row.category)
                    return <tr key={row.id} className="border-t border-forest-50 hover:bg-sage/20">
                      <td className="whitespace-nowrap px-4 py-3 text-forest-700/80">{row.date}</td>
                      <td className="px-4 py-3 font-medium text-forest-900">{row.title}{row.supplier && <span className="mt-0.5 block text-xs font-normal text-forest-700/60">{row.supplier}</span>}</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-xs"><span className="h-2 w-2 rounded-full" style={{ background: item?.color }} />{item?.label || row.category}</span></td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{money(row.amount)}</td>
                      <td className="px-4 py-3 text-xs uppercase text-forest-700/70">{row.paymentMethod}</td>
                      <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(row); setDialogOpen(true) }} className="rounded-lg p-1.5 text-forest-700 hover:bg-sage" aria-label="Edit expense"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setConfirm({ open: true, row, loading: false })} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" aria-label="Delete expense"><Trash2 className="h-4 w-4" /></button>
                      </div></td>
                    </tr>
                  })}</tbody>
                  <tfoot className="bg-sage/40"><tr><td colSpan={3} className="px-4 py-3 text-xs font-semibold uppercase text-forest-700/70">{t('expenses.pageTotal')}</td><td className="px-4 py-3 text-right font-bold tabular-nums text-forest-900">{money(pageRows.reduce((sum, row) => sum + row.amount, 0))}</td><td colSpan={2} /></tr></tfoot>
                </table>
              </div>
              {totalPages > 1 && <div className="flex items-center justify-between border-t border-forest-50 px-4 py-3 text-sm"><span className="text-forest-700/60">{t('common.page')} {page} / {totalPages}</span><div className="flex gap-1"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>{t('common.prev')}</Button><Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>{t('common.next')}</Button></div></div>}
            </>
          )}
        </div>
      </section>

      <ExpenseDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }} editing={editing} onSaved={refresh} />
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((current) => ({ ...current, open }))} title={t('expenses.deleteTitle')} description={t('expenses.deleteDesc')} confirmLabel={t('common.delete')} destructive loading={confirm.loading} onConfirm={handleDelete} />
    </div>
  )
}

function Metric({ icon: Icon, label, value, tone = 'default' }) {
  const styles = { default: 'bg-sage text-forest-700', fresh: 'bg-fresh-100 text-fresh-700', earth: 'bg-earth/10 text-earth-700' }
  return <div className="rounded-2xl border border-forest-100 bg-white p-4 shadow-soft"><span className={`grid h-9 w-9 place-items-center rounded-xl ${styles[tone]}`}><Icon className="h-4 w-4" /></span><p className="mt-3 text-[11px] uppercase tracking-wide text-forest-700/60">{label}</p><p className="mt-1 truncate text-lg font-bold text-forest-900">{value}</p></div>
}