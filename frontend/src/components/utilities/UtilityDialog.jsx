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
import { UTILITY_TYPES, BILL_STATUSES } from '@/lib/utilityOptions'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import { createUtility, updateUtility } from '@/services/utilitiesService'

export default function UtilityDialog({ open, onOpenChange, editing, onSaved }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)
  const [branches, setBranches] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    type: z.string().min(1, t('errors.required')),
    provider: z.string().optional(),
    meterNo: z.string().optional(),
    billingPeriod: z.string().min(1, t('errors.required')),
    prevReading: z.coerce.number().nonnegative().optional(),
    currentReading: z.coerce.number().nonnegative().optional(),
    unit: z.string().optional(),
    amount: z.coerce.number().positive(t('errors.required')),
    dueDate: z.string().optional(),
    paidDate: z.string().optional(),
    status: z.string().min(1, t('errors.required')),
    invoiceNo: z.string().optional(),
    branchId: z.string().optional(),
    notes: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'electricity', provider: '', meterNo: '',
      billingPeriod: new Date().toISOString().slice(0, 7),
      prevReading: 0, currentReading: 0, unit: 'kWh',
      amount: '', dueDate: '', paidDate: '', status: 'pending',
      invoiceNo: '', branchId: '', notes: '',
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
        type: editing.type,
        provider: editing.provider || '',
        meterNo: editing.meterNo || '',
        billingPeriod: editing.billingPeriod,
        prevReading: editing.prevReading,
        currentReading: editing.currentReading,
        unit: editing.unit || '',
        amount: editing.amount,
        dueDate: editing.dueDate || '',
        paidDate: editing.paidDate || '',
        status: editing.status,
        invoiceNo: editing.invoiceNo || '',
        branchId: editing.branchId || '',
        notes: editing.notes || '',
      })
    } else {
      const cfg = UTILITY_TYPES.find((u) => u.id === 'electricity')
      reset({
        type: 'electricity', provider: '', meterNo: '',
        billingPeriod: new Date().toISOString().slice(0, 7),
        prevReading: 0, currentReading: 0, unit: cfg?.unit || '',
        amount: '', dueDate: '', paidDate: '', status: 'pending',
        invoiceNo: '',
        branchId: selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id || ''),
        notes: '',
      })
    }
  }, [open, editing, selectedBranchId, branches, reset])

  const prev = watch('prevReading')
  const cur = watch('currentReading')
  const consumption = Number(cur || 0) - Number(prev || 0)

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const payload = { ...values, farmId: farm.id }
    const { error } = editing
      ? await updateUtility(editing.id, payload)
      : await createUtility(payload)
    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t('utilities.edit') : t('utilities.add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('utilities.type')}</Label>
              <Select value={watch('type')} onValueChange={(v) => {
                setValue('type', v, { shouldValidate: true })
                const cfg = UTILITY_TYPES.find((u) => u.id === v)
                setValue('unit', cfg?.unit || '')
              }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UTILITY_TYPES.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('utilities.billingPeriod')}</Label>
              <Input type="month" {...register('billingPeriod')} className="mt-1.5" />
              {errors.billingPeriod && <p className="mt-1 text-xs text-red-600">{errors.billingPeriod.message}</p>}
            </div>
            <div>
              <Label>{t('utilities.provider')}</Label>
              <Input {...register('provider')} className="mt-1.5" placeholder={t('utilities.providerPlaceholder')} />
            </div>
            <div>
              <Label>{t('utilities.meterNo')}</Label>
              <Input {...register('meterNo')} className="mt-1.5" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>{t('utilities.prevReading')}</Label>
              <Input type="number" step="0.01" {...register('prevReading')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('utilities.currentReading')}</Label>
              <Input type="number" step="0.01" {...register('currentReading')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('utilities.consumption')}</Label>
              <div className="mt-1.5 h-10 rounded-xl border border-forest-100 bg-sage/40 px-3 flex items-center text-sm font-semibold text-forest-900">
                {consumption >= 0 ? consumption : 0} {watch('unit')}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('utilities.amount')} (৳)</Label>
              <Input type="number" step="0.01" {...register('amount')} className="mt-1.5" />
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
            </div>
            <div>
              <Label>{t('utilities.status')}</Label>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BILL_STATUSES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('utilities.dueDate')}</Label>
              <Input type="date" {...register('dueDate')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('utilities.paidDate')}</Label>
              <Input type="date" {...register('paidDate')} className="mt-1.5" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('utilities.invoiceNo')}</Label>
              <Input {...register('invoiceNo')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('utilities.branch')}</Label>
              <Select value={watch('branchId') || 'none'} onValueChange={(v) => setValue('branchId', v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('utilities.noBranch')}</SelectItem>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{t('utilities.notes')}</Label>
            <Textarea rows={2} {...register('notes')} className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.loading') : editing ? t('common.save') : t('utilities.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}