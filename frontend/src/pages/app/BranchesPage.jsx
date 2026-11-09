import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, GitBranch, MapPin, Pencil, Plus, Users, Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CreateBranchDialog from '@/components/branch/CreateBranchDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { archiveBranch, listBranches, updateBranch } from '@/services/branchService'
import { listEnclosures } from '@/services/enclosuresService'
import { listWorkers } from '@/services/workersService'

export default function BranchesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const selectedBranchId = useAppStore((state) => state.selectedBranchId)
  const setBranch = useAppStore((state) => state.setBranch)
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, branch: null, loading: false })

  const loadBranches = useCallback(async () => {
    setLoading(true)
    setError('')
    const result = await listBranches()
    if (result.error) {
      setError(result.error)
      setBranches([])
      setLoading(false)
      return
    }
    const rows = await Promise.all(result.data.map(async (branch) => {
      const [enclosures, workers] = await Promise.all([
        listEnclosures({ branchId: branch.id }),
        listWorkers({ branchId: branch.id }),
      ])
      return {
        ...branch,
        enclosures: enclosures.data,
        workers: workers.data,
        detailError: enclosures.error || workers.error,
      }
    }))
    setBranches(rows)
    setLoading(false)
  }, [])

  useEffect(() => { loadBranches() }, [loadBranches, revision])

  const saveBranch = async (event) => {
    event.preventDefault()
    if (!editing) return
    setSaving(true)
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    const result = await updateBranch(editing.id, values)
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setEditing(null)
    setRevision((value) => value + 1)
  }

  const handleArchive = async () => {
    const branch = confirm.branch
    setConfirm((current) => ({ ...current, loading: true }))
    const result = await archiveBranch(branch.id)
    if (result.error) setError(result.error)
    if (selectedBranchId === branch.id) setBranch('all')
    setConfirm({ open: false, branch: null, loading: false })
    if (!result.error) setRevision((value) => value + 1)
  }

  if (!['owner', 'admin'].includes(user?.role)) {
    return <div className="p-6 text-sm text-forest-700">Branch management is available to farm owners and administrators.</div>
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">
            <GitBranch className="h-3.5 w-3.5" /> Farm structure
          </p>
          <h1 className="mt-1 text-2xl font-bold text-forest-900">Branches</h1>
          <p className="mt-1 max-w-2xl text-sm text-forest-700/70">
            Manage farm locations and review their server-backed enclosure and staff records.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New branch</Button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="rounded-2xl border border-forest-100 bg-white p-8 text-center text-sm text-forest-700">Loading branches…</div>
      ) : branches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-14 text-center">
          <GitBranch className="mx-auto h-8 w-8 text-forest-400" />
          <h2 className="mt-3 font-semibold text-forest-900">No active branches</h2>
          <p className="mt-1 text-sm text-forest-700/70">Create a branch to organize work by farm location.</p>
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {branches.map((branch) => {
            const selected = selectedBranchId === branch.id
            const headcount = branch.enclosures.reduce((sum, enclosure) => sum + Number(enclosure.occupied || 0), 0)
            return (
              <article key={branch.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${selected ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-forest-100'}`}>
                <div className="flex items-start justify-between gap-3 border-b border-forest-50 px-5 py-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-forest-900">{branch.name}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-forest-700/70">
                      <MapPin className="h-3.5 w-3.5" />{branch.location}
                    </p>
                    <p className="mt-1 text-xs text-forest-700/60">{branch.managerName} · {branch.managerContact}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(branch)} aria-label={`Edit ${branch.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-forest-700 hover:bg-sage"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setConfirm({ open: true, branch, loading: false })} disabled={branches.length < 2} aria-label={`Archive ${branch.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30"><Archive className="h-4 w-4" /></button>
                  </div>
                </div>
                {branch.detailError && <p role="alert" className="px-5 pt-3 text-xs text-amber-700">{branch.detailError}</p>}
                <div className="grid grid-cols-3 divide-x divide-forest-50 px-2 py-4">
                  <Metric icon={Warehouse} label="Enclosures" value={branch.enclosures.length} />
                  <Metric icon={Users} label="Staff" value={branch.workers.length} />
                  <Metric icon={Users} label="Occupied capacity" value={headcount.toLocaleString()} />
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-t border-forest-50 px-5 py-3">
                  <Button variant="outline" size="sm" onClick={() => { setBranch(branch.id); navigate('/dashboard') }}>
                    {selected ? 'Current branch' : 'View branch'}
                  </Button>
                  {selected && <span className="self-center text-xs font-semibold text-emerald-700">Selected</span>}
                </div>
              </article>
            )
          })}
        </section>
      )}

      <CreateBranchDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => setRevision((value) => value + 1)} />
      <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit branch</DialogTitle></DialogHeader>
          {editing && (
            <form key={editing.id} onSubmit={saveBranch} className="space-y-4">
              <Field name="name" label="Branch name" value={editing.name} />
              <Field name="location" label="Location" value={editing.location} />
              <Field name="managerName" label="Manager name" value={editing.managerName} />
              <Field name="managerContact" label="Manager contact" value={editing.managerContact} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((current) => ({ ...current, open }))}
        title="Archive this branch?"
        description={`${confirm.branch?.name || 'This branch'} will be removed from active branch selection. Existing records remain stored.`}
        confirmLabel="Archive"
        destructive
        loading={confirm.loading}
        onConfirm={handleArchive}
      />
    </main>
  )
}

function Field({ name, label, value }) {
  return (
    <div>
      <Label htmlFor={`branch-${name}`}>{label}</Label>
      <Input id={`branch-${name}`} name={name} defaultValue={value || ''} required className="mt-1.5" />
    </div>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 text-center">
      <Icon className="h-4 w-4 text-emerald-700" />
      <span className="text-xl font-bold text-forest-900">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-forest-700/60">{label}</span>
    </div>
  )
}
