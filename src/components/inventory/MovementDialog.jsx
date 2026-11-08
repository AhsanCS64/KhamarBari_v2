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
import { MOVEMENT_TYPES } from '@/lib/inventoryOptions'
import { recordMovement } from '@/services/inventoryService'

export default function MovementDialog({ open, onOpenChange, item, onSaved }) {
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    type: z.string().min(1, t('errors.required')),
    quantity: z.coerce.number().positive(t('errors.required')),
    date: z.string().min(1, t('errors.required')),
    reference: z.string().optional(),
    recordedBy: z.string().optional(),
    notes: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'purchase', quantity: '', date: new Date().toISOString().slice(0, 10),
      reference: '', recordedBy: '', notes: '',
    },
  })

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const { error } = await recordMovement({ ...values, itemId: item.id })
    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('inventory.recordMovement')}</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl bg-sage/40 px-3 py-2 text-sm mb-4">
          <b>{item.name}</b> — {t('inventory.current')}: {item.quantity} {item.unit}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <div>
            <Label>{t('inventory.movementType')}</Label>
            <Select value={watch('type')} onValueChange={(v) => setValue('type', v, { shouldValidate: true })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('inventory.quantity')}</Label>
              <Input type="number" step="0.01" {...register('quantity')} className="mt-1.5" />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>}
            </div>
            <div>
              <Label>{t('inventory.date')}</Label>
              <Input type="date" {...register('date')} className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label>{t('inventory.reference')}</Label>
            <Input {...register('reference')} className="mt-1.5" placeholder={t('inventory.referencePlaceholder')} />
          </div>

          <div>
            <Label>{t('inventory.recordedBy')}</Label>
            <Input {...register('recordedBy')} className="mt-1.5" />
          </div>

          <div>
            <Label>{t('inventory.notes')}</Label>
            <Textarea rows={2} {...register('notes')} className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.loading') : t('inventory.saveMovement')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}