import { useState } from 'react'
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
import { PAYMENT_TYPES } from '@/lib/workerOptions'
import { useAuthStore } from '@/store/authStore'
import { recordPayment } from '@/services/workersService'

export default function PaymentDialog({ open, onOpenChange, worker, onSaved }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    type: z.string().min(1, t('errors.required')),
    amount: z.coerce.number().positive(t('errors.required')),
    date: z.string().min(1, t('errors.required')),
    month: z.string().optional(),
    method: z.string().min(1, t('errors.required')),
    notes: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'salary', amount: '',
      date: new Date().toISOString().slice(0, 10),
      month: new Date().toISOString().slice(0, 7),
      method: 'cash', notes: '',
    },
  })

  if (!worker) return null

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const { error } = await recordPayment({
      ...values, farmId: farm.id, workerId: worker.id,
    })
    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('workers.recordPayment')} — {worker.name}</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-sage/40 px-3 py-2 text-sm mb-4">
          {t('workers.monthlySalary')}: <b>৳{worker.salary?.toLocaleString()}</b>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <div>
            <Label>{t('workers.paymentType')}</Label>
            <Select value={watch('type')} onValueChange={(v) => setValue('type', v, { shouldValidate: true })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('workers.amount')} (৳)</Label>
              <Input type="number" step="0.01" {...register('amount')} className="mt-1.5" />
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
            </div>
            <div>
              <Label>{t('workers.date')}</Label>
              <Input type="date" {...register('date')} className="mt-1.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('workers.month')}</Label>
              <Input type="month" {...register('month')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('workers.method')}</Label>
              <Select value={watch('method')} onValueChange={(v) => setValue('method', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['cash', 'bkash', 'nagad', 'rocket', 'bank'].map((m) => (
                    <SelectItem key={m} value={m}>{m.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              {submitting ? t('common.loading') : t('workers.savePayment')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}