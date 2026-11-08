import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Search, Pencil, Trash2, Users, AlertTriangle, Download,
  Wallet, UserCheck, Clock, Calendar, Banknote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SproutLoader from '@/components/common/SproutLoader'
import EmptyState from '@/components/common/EmptyState'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import WorkerDialog from '@/components/workers/WorkerDialog'
import AttendanceDialog from '@/components/workers/AttendanceDialog'
import PaymentDialog from '@/components/workers/PaymentDialog'
import WorkerDetailsDialog from '@/components/workers/WorkerDetailsDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listWorkers, deleteWorker, getWorkersTotals } from '@/services/workersService'
import { WORKER_ROLES, WORKER_STATUSES } from '@/lib/workerOptions'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

export default function WorkersPage() {
  const { t, i18n } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({
    total: 0, active: 0, onLeave: 0, totalSalary: 0, paidThisMonth: 0, salaryDue: 0, advances: 0,
  })

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)

  const [workerDialog, setWorkerDialog] = useState({ open: false, editing: null })
  const [attendanceDialog, setAttendanceDialog] = useState({ open: false, worker: null })
  const [paymentDialog, setPaymentDialog] = useState({ open: false, worker: null })
  const [detailsDialog, setDetailsDialog] = useState({ open: false, worker: null })
  const [confirm, setConfirm] = useState({ open: false, row: null, loading: false })

  const refresh = async () => {
    setLoading(true); setError('')
    const { data, error } = await listWorkers({
      farmId: farm.id, branchId: selectedBranchId, search, role, status,
    })
    if (error) { setError(error); setLoading(false); return }
    setRows(data)
    const tot = await getWorkersTotals({ farmId: farm.id, branchId: selectedBranchId })
    setTotals(tot.data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm.id, selectedBranchId, search, role, status])

  useEffect(() => { setPage(1) }, [search, role, status, selectedBranchId])

  const pageRows = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page])
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  const bdt = (n) => `৳${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`

  const onDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    await deleteWorker(confirm.row.id)
    setConfirm({ open: false, row: null, loading: false })
    refresh()
  }

  const exportCsv = () => {
    const header = ['Name', 'Contact', 'NID', 'Role', 'Joining Date', 'Salary', 'Status', 'Address']
    const lines = [header.join(',')]
    rows.forEach((r) => {
      lines.push([
        `"${r.name}"`, r.contact, r.nid, r.role, r.joiningDate, r.salary, r.status,
        `"${(r.address || '').replace(/"/g, '""')}"`,
      ].join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `workers-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">{t('sidebar.workers')}</h1>
          <p className="mt-1 text-sm text-forest-700/70">{t('workers.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" /> {t('common.export')}
          </Button>
          <Button onClick={() => setWorkerDialog({ open: true, editing: null })}>
            <Plus className="h-4 w-4" /> {t('workers.addWorker')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('workers.totalWorkers')} value={totals.total} tone="default" icon={Users} />
        <KpiCard label={t('workers.active')} value={`${totals.active} / ${totals.onLeave}`} sub={t('workers.activeOnLeave')} tone="fresh" icon={UserCheck} />
        <KpiCard label={t('workers.salaryDue')} value={bdt(totals.salaryDue)} tone="earth" icon={Banknote} />
        <KpiCard label={t('workers.advances')} value={bdt(totals.advances)} tone="warning" icon={Wallet} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-700/50" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('workers.searchPlaceholder')} className="pl-9" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm">
          <option value="all">{t('workers.allRoles')}</option>
          {WORKER_ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-forest-100 bg-white px-3 text-sm">
          <option value="all">{t('workers.allStatuses')}</option>
          {WORKER_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-forest-50 bg-white shadow-card overflow-hidden">
        {loading ? (
          <SproutLoader label={t('common.loading')} />
        ) : error ? (
          <EmptyState icon={AlertTriangle} title={t('errors.generic')} description={error} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('workers.emptyTitle')}
            description={t('workers.emptyDesc')}
            action={<Button onClick={() => setWorkerDialog({ open: true, editing: null })}><Plus className="h-4 w-4" /> {t('workers.addWorker')}</Button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('workers.name')}</th>
                    <th className="px-4 py-3 font-semibold">{t('workers.role')}</th>
                    <th className="px-4 py-3 font-semibold">{t('workers.contact')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('workers.salary')}</th>
                    <th className="px-4 py-3 font-semibold">{t('workers.status')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const roleCfg = WORKER_ROLES.find((rr) => rr.id === r.role)
                    const statusCfg = WORKER_STATUSES.find((s) => s.id === r.status)
                    return (
                      <tr key={r.id} className="border-t border-forest-50 hover:bg-sage/20">
                        <td className="px-4 py-3">
                          <button onClick={() => setDetailsDialog({ open: true, worker: r })} className="text-left">
                            <div className="font-medium text-forest-900 hover:underline">{r.name}</div>
                            {r.joiningDate && <div className="text-xs text-forest-700/60">{t('workers.joined')}: {r.joiningDate}</div>}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <span className="h-2 w-2 rounded-full" style={{ background: roleCfg?.color }} />
                            {roleCfg?.label || r.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-forest-700/80">{r.contact}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{bdt(r.salary)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ color: statusCfg?.color, background: `${statusCfg?.color}1A` }}
                          >
                            {statusCfg?.label || r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setAttendanceDialog({ open: true, worker: r })} className="rounded-lg p-1.5 hover:bg-sage text-forest-700" title={t('workers.markAttendance')}>
                              <Calendar className="h-4 w-4" />
                            </button>
                            <button onClick={() => setPaymentDialog({ open: true, worker: r })} className="rounded-lg p-1.5 hover:bg-sage text-forest-700" title={t('workers.recordPayment')}>
                              <Banknote className="h-4 w-4" />
                            </button>
                            <button onClick={() => setWorkerDialog({ open: true, editing: r })} className="rounded-lg p-1.5 hover:bg-sage text-forest-700" title={t('common.edit')}>
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
                  <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>{t('common.prev')}</Button>
                  <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>{t('common.next')}</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <WorkerDialog
        open={workerDialog.open}
        onOpenChange={(o) => setWorkerDialog({ open: o, editing: o ? workerDialog.editing : null })}
        editing={workerDialog.editing}
        onSaved={refresh}
      />

      <AttendanceDialog
        open={attendanceDialog.open}
        onOpenChange={(o) => setAttendanceDialog({ open: o, worker: o ? attendanceDialog.worker : null })}
        worker={attendanceDialog.worker}
        onSaved={refresh}
      />

      <PaymentDialog
        open={paymentDialog.open}
        onOpenChange={(o) => setPaymentDialog({ open: o, worker: o ? paymentDialog.worker : null })}
        worker={paymentDialog.worker}
        onSaved={refresh}
      />

      <WorkerDetailsDialog
        open={detailsDialog.open}
        onOpenChange={(o) => setDetailsDialog({ open: o, worker: o ? detailsDialog.worker : null })}
        worker={detailsDialog.worker}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
        title={t('workers.deleteTitle')}
        description={t('workers.deleteDesc')}
        confirmLabel={t('common.delete')}
        destructive
        loading={confirm.loading}
        onConfirm={onDelete}
      />
    </div>
  )
}

function KpiCard({ label, value, sub, tone = 'default', icon: Icon }) {
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
      {sub && <p className="text-[10px] text-forest-700/50">{sub}</p>}
    </div>
  )
}