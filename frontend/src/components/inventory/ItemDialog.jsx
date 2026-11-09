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
import { INVENTORY_CATEGORIES, UNITS } from '@/lib/inventoryOptions'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import { createItem, updateItem } from '@/services/inventoryService'

export default function ItemDialog({ open, onOpenChange, editing, onSaved }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)
  const [branches, setBranches] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    name: z.string().min(2, t('errors.required')),
    sku: z.string().optional(),
    category: z.string().min(1, t('errors.required')),
    unit: z.string().min(1, t('errors.required')),
    quantity: z.coerce.number().nonnegative(t('errors.required')),
    minimumThreshold: z.coerce.number().nonnegative(t('errors.required')),
    unitPrice: z.coerce.number().nonnegative(t('errors.required')),
    supplier: z.string().optional(),
    expiryDate: z.string().optional(),
    branchId: z.string().optional(),
    notes: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', sku: '', category: 'feed', unit: 'kg',
      quantity: 0, minimumThreshold: 0, unitPrice: 0,
      supplier: '', expiryDate: '', branchId: '', notes: '',
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
        sku: editing.sku || '',
        category: editing.category,
        unit: editing.unit,
        quantity: editing.quantity,
        minimumThreshold: editing.minimumThreshold,
        unitPrice: editing.unitPrice,
        supplier: editing.supplier || '',
        expiryDate: editing.expiryDate || '',
        branchId: editing.branchId || '',
        notes: editing.notes || '',
      })
    } else {
      reset({
        name: '', sku: '', category: 'feed', unit: 'kg',
        quantity: 0, minimumThreshold: 0, unitPrice: 0,
        supplier: '', expiryDate: '',
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
      ? await updateItem(editing.id, payload)
      : await createItem(payload)
    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t('inventory.editItem') : t('inventory.addItem')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('inventory.name')}</Label>
              <Input {...register('name')} className="mt-1.5" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <Label>{t('inventory.sku')}</Label>
              <Input {...register('sku')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('inventory.category')}</Label>
              <Select value={watch('category')} onValueChange={(v) => setValue('category', v, { shouldValidate: true })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVENTORY_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('inventory.unit')}</Label>
              <Select value={watch('unit')} onValueChange={(v) => setValue('unit', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>{t('inventory.quantity')}</Label>
              <Input type="number" step="0.01" {...register('quantity')} className="mt-1.5" />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>}
            </div>
            <div>
              <Label>{t('inventory.minThreshold')}</Label>
              <Input type="number" step="0.01" {...register('minimumThreshold')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('inventory.unitPrice')} (৳)</Label>
              <Input type="number" step="0.01" {...register('unitPrice')} className="mt-1.5" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('inventory.supplier')}</Label>
              <Input {...register('supplier')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('inventory.expiryDate')}</Label>
              <Input type="date" {...register('expiryDate')} className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label>{t('inventory.branch')}</Label>
            <Select value={watch('branchId') || 'none'} onValueChange={(v) => setValue('branchId', v === 'none' ? '' : v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('inventory.noBranch')}</SelectItem>
                {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
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
              {submitting ? t('common.loading') : editing ? t('common.save') : t('inventory.addItem')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}