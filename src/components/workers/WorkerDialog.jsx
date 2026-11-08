import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { WORKER_ROLES, WORKER_STATUSES } from '@/lib/workerOptions'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import { createWorker, updateWorker } from '@/services/workersService'

export default function WorkerDialog({ open, onOpenChange, editing, onSaved }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)
  const [branches, setBranches] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    name: z.string().min(2, t('errors.required')),
    contact: z.string().regex(/^01[3-9]\d{8}$/, t('errors.mobile')),
    nid: z.string().optional(),
    address: z.string().optional(),
    role: z.string().min(1, t('errors.required')),
    joiningDate: z.string().min(1, t('errors.required')),
    salary: z.coerce.number().nonnegative(t('errors.required')),
    status: z.string().min(1, t('errors.required')),
    branchId: z.string().optional(),
    notes: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', contact: '', nid: '', address: '',
      role: 'caretaker', joiningDate: new Date().toISOString().slice(0, 10),
      salary: 0, status: 'active', branchId: '', notes: '',
    },
  })

  useEffect(() => {
    if (!farm) return
    listBranches(farm.id).then(({ data }) => setBranches(data || []))
  }, [farm])

  useEffect(() => {
    if (!open) return
    if (editing) {
      reset({
        name: editing.name,
        contact: editing.contact,
        nid: editing.nid || '',
        address: editing.address || '',
        role: editing.role,
        joiningDate: editing.joiningDate,
        salary: editing.salary,
        status: editing.status,
        branchId: editing.branchId || '',
        notes: editing.notes || '',
      })
    } else {
      reset({
        name: '', contact: '', nid: '', address: '',
        role: 'caretaker',
        joiningDate: new Date().toISOString().slice(0, 10),
        salary: 0, status: 'active',
        branchId: selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id || ''),
        notes: '',
      })
    }
  }, [open, editing, selectedBranchId, branches, reset])

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const payload = { ...values, farmId: farm.id }
    const { error } = editing
      ? await updateWorker(editing.id, payload)
      : await createWorker(payload)
    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t('workers.editWorker') : t('workers.addWorker')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('workers.name')}</Label>
              <Input {...register('name')} className="mt-1.5" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <Label>{t('workers.contact')}</Label>
              <Input {...register('contact')} className="mt-1.5" inputMode="tel" placeholder="01712345678" />
              {errors.contact && <p className="mt-1 text-xs text-red-600">{errors.contact.message}</p>}
            </div>
            <div>
              <Label>{t('workers.nid')}</Label>
              <Input {...register('nid')} className="mt-1.5" inputMode="numeric" />
            </div>
            <div>
              <Label>{t('workers.role')}</Label>
              <Select value={watch('role')} onValueChange={(v) => setValue('role', v, { shouldValidate: true })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WORKER_ROLES.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('workers.joiningDate')}</Label>
              <Input type="date" {...register('joiningDate')} className="mt-1.5" />
              {errors.joiningDate && <p className="mt-1 text-xs text-red-600">{errors.joiningDate.message}</p>}
            </div>
            <div>
              <Label>{t('workers.salary')} (৳)</Label>
              <Input type="number" step="0.01" {...register('salary')} className="mt-1.5" />
              {errors.salary && <p className="mt-1 text-xs text-red-600">{errors.salary.message}</p>}
            </div>
            <div>
              <Label>{t('workers.status')}</Label>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WORKER_STATUSES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('workers.branch')}</Label>
              <Select value={watch('branchId') || 'none'} onValueChange={(v) => setValue('branchId', v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('workers.noBranch')}</SelectItem>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{t('workers.address')}</Label>
            <Textarea rows={2} {...register('address')} className="mt-1.5" />
          </div>

          <div>
            <Label>{t('workers.notes')}</Label>
            <Textarea rows={2} {...register('notes')} className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.loading') : editing ? t('common.save') : t('workers.addWorker')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}