import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Archive, ArrowUpRight, Boxes, GitBranch, MapPin, Pencil, Plus, TrendingUp, Users, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CreateBranchDialog from '@/components/branch/CreateBranchDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { archiveBranch, listBranches, updateBranch } from '@/services/branchService'
import { listEnclosures } from '@/services/enclosuresService'
import { getOverview } from '@/services/reportsService'

export default function BranchesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const farm = useAuthStore((state) => state.farm)
  const user = useAuthStore((state) => state.user)
  const selectedBranchId = useAppStore((state) => state.selectedBranchId)
  const setBranch = useAppStore((state) => state.setBranch)
  const branchRevision = useAppStore((state) => state.branchRevision)
  const refreshBranches = useAppStore((state) => state.refreshBranches)
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, branch: null, loading: false })

  useEffect(() => {
    let cancelled = false
    if (!farm?.id) return undefined
    setLoading(true)
    setError('')
    listBranches(farm.id)
      .then(async ({ data, error: resultError }) => {
        if (resultError) throw new Error(resultError)
        const rows = await Promise.all((data || []).map(async (branch) => {
          const [enclosureResult, overviewResult] = await Promise.all([
            listEnclosures({ farmId: farm.id, branchId: branch.id }),
            getOverview({ farmId: farm.id, branchId: branch.id }),
          ])
          return { ...branch, enclosures: enclosureResult.data || [], summary: overviewResult.data || {} }
        }))
        if (cancelled) return
        setBranches(rows)
        setLoading(false)
      })
      .catch((cause) => {
        if (cancelled) return
        setError(cause?.message || 'Unable to load branches')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [farm?.id, branchRevision])

  const money = (value) => `৳${Number(value || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`
  const canManage = ['owner', 'admin'].includes(user?.role)

  const saveBranch = async (values) => {
    const result = await updateBranch(editing.id, values)
    if (result.error) {
      setError(result.error)
      return
    }
    setEditing(null)
    refreshBranches()
  }

  const handleArchive = async () => {
    setConfirm((current) => ({ ...current, loading: true }))
    const branch = confirm.branch
    const result = await archiveBranch(branch.id)
    if (result.error) setError(result.error)
    if (selectedBranchId === branch.id) setBranch('all')
    refreshBranches()
    setConfirm({ open: false, branch: null, loading: false })
  }

  if (!canManage) {
    return <div className="p-6 text-sm text-forest-700">{t('branch.ownerOnly')}</div>
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-forest-600"><GitBranch className="h-3.5 w-3.5" />{t('branch.directoryEyebrow')}</p>
          <h1 className="mt-1 text-2xl font-bold text-forest-900">{t('branch.directoryTitle')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-forest-700/70">{t('branch.directorySubtitle')}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />{t('branch.new')}</Button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric icon={GitBranch} label={t('branch.activeCount')} value={branches.length} />
        <SummaryMetric icon={Boxes} label={t('branch.enclosures')} value={branches.reduce((sum, branch) => sum + branch.enclosures.length, 0)} />
        <SummaryMetric icon={Users} label={t('branch.totalHeadcount')} value={branches.reduce((sum, branch) => sum + branch.enclosures.reduce((head, enclosure) => head + Number(enclosure.occupied || 0), 0), 0).toLocaleString()} />
      </section>

      {loading ? (
        <div className="rounded-2xl border border-forest-100 bg-white p-8 text-center text-sm text-forest-700">{t('common.loading')}</div>
      ) : branches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-14 text-center">
          <GitBranch className="mx-auto h-8 w-8 text-forest-400" />
          <h2 className="mt-3 text-base font-semibold text-forest-900">{t('branch.emptyTitle')}</h2>
          <p className="mt-1 text-sm text-forest-700/70">{t('branch.emptyDesc')}</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />{t('branch.new')}</Button>
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {branches.map((branch) => {
            const headcount = branch.enclosures.reduce((sum, enclosure) => sum + Number(enclosure.occupied || 0), 0)
            const capacity = branch.enclosures.reduce((sum, enclosure) => sum + Number(enclosure.capacity || 0), 0)
            const isSelected = selectedBranchId === branch.id
            return (
              <article key={branch.id} className={`overflow-hidden rounded-2xl border bg-white shadow-soft transition-shadow hover:shadow-card ${isSelected ? 'border-fresh-400 ring-2 ring-fresh-200/70' : 'border-forest-100'}`}>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-forest-50 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-lg font-bold text-forest-900">{branch.name}</h2>
                      {isSelected && <span className="rounded-full bg-fresh-100 px-2 py-0.5 text-[10px] font-semibold text-forest-800">{t('branch.current')}</span>}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-forest-700/70"><MapPin className="h-3.5 w-3.5 shrink-0" />{branch.location}</p>
                    <p className="mt-1 text-xs text-forest-700/55">{branch.managerName} · {branch.managerContact}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(branch)} aria-label={`${t('branch.edit')} ${branch.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-forest-700 transition hover:bg-sage"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setConfirm({ open: true, branch, loading: false })} disabled={branches.length <= 1} aria-label={`${t('branch.archive')} ${branch.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:opacity-30"><Archive className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-forest-50 sm:grid-cols-4">
                  <BranchMetric icon={Boxes} label={t('branch.enclosures')} value={branch.enclosures.length} />
                  <BranchMetric icon={Users} label={t('branch.occupancy')} value={`${headcount.toLocaleString()} / ${capacity.toLocaleString()}`} />
                  <BranchMetric icon={TrendingUp} label={t('branch.revenue')} value={money(branch.summary.revenue)} />
                  <BranchMetric icon={Wallet} label={t('branch.expenditure')} value={money(branch.summary.totalExpenditure)} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <p className="text-xs text-forest-700/60">{t('branch.recordsAcrossModules')}</p>
                  <Button size="sm" variant={isSelected ? 'outline' : 'default'} onClick={() => { setBranch(branch.id); navigate('/dashboard/animals') }}>
                    {t('branch.viewOperations')}<ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <CreateBranchDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={(branch) => { refreshBranches(); setBranch(branch.id) }} />
      <EditBranchDialog branch={editing} onOpenChange={(open) => { if (!open) setEditing(null) }} onSave={saveBranch} />
      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((current) => ({ ...current, open }))}
        title={t('branch.archiveTitle')}
        description={t('branch.archiveDescription', { name: confirm.branch?.name || '' })}
        confirmLabel={t('branch.archive')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={confirm.loading}
        onConfirm={handleArchive}
      />
    </div>
  )
}

function SummaryMetric({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-forest-100 bg-white p-4 shadow-soft"><span className="grid h-9 w-9 place-items-center rounded-lg bg-sage text-forest-700"><Icon className="h-4 w-4" /></span><p className="mt-3 text-[11px] uppercase tracking-wide text-forest-700/60">{label}</p><p className="mt-1 text-xl font-bold tabular-nums text-forest-900">{value}</p></div>
}

function BranchMetric({ icon: Icon, label, value }) {
  return <div className="bg-[#fbfdf9] px-4 py-3"><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-forest-700/60"><Icon className="h-3.5 w-3.5" />{label}</p><p className="mt-1 text-sm font-bold tabular-nums text-forest-900">{value}</p></div>
}

function EditBranchDialog({ branch, onOpenChange, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', location: '', managerName: '', managerContact: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (branch) setForm({ name: branch.name, location: branch.location, managerName: branch.managerName, managerContact: branch.managerContact })
  }, [branch])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <Dialog open={Boolean(branch)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('branch.editTitle')}</DialogTitle><DialogDescription>{t('branch.editDescription')}</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label={t('branch.name')} value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} />
          <Field label={t('branch.location')} value={form.location} onChange={(location) => setForm((current) => ({ ...current, location }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('branch.managerName')} value={form.managerName} onChange={(managerName) => setForm((current) => ({ ...current, managerName }))} />
            <Field label={t('branch.managerContact')} value={form.managerContact} onChange={(managerContact) => setForm((current) => ({ ...current, managerContact }))} />
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button><Button type="submit" disabled={saving}>{saving ? t('common.loading') : t('branch.save')}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value, onChange }) {
  return <label className="block"><Label>{label}</Label><Input className="mt-1.5" value={value} onChange={(event) => onChange(event.target.value)} required /></label>
}