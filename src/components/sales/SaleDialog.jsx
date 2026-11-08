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
import { SALE_ITEM_TYPES, PAYMENT_STATUSES, PAYMENT_METHODS_SALE } from '@/lib/saleOptions'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import { listAnimals } from '@/services/animalsService'
import { listEnclosures } from '@/services/enclosuresService'
import { createSale, updateSale, getProductionStock } from '@/services/salesService'
import { AlertTriangle, Info, PackageCheck, TrendingDown, Warehouse, Beef, Fish, Bird } from 'lucide-react'

export default function SaleDialog({ open, onOpenChange, editing, onSaved }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)
  const [branches, setBranches] = useState([])
  const [animals, setAnimals] = useState([])
  const [enclosures, setEnclosures] = useState([])
  const [stock, setStock] = useState({})
  const [stockLoading, setStockLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    itemType: z.string().min(1, t('errors.required')),
    enclosureId: z.string().optional(),
    enclosureName: z.string().optional(),
    animalId: z.string().optional(),
    description: z.string().optional(),
    date: z.string().min(1, t('errors.required')),
    quantity: z.coerce.number().positive(t('errors.required')),
    unit: z.string().min(1, t('errors.required')),
    unitPrice: z.coerce.number().nonnegative(t('errors.required')),
    paidAmount: z.coerce.number().nonnegative().optional(),
    buyer: z.string().min(2, t('errors.required')),
    buyerContact: z.string().optional(),
    paymentStatus: z.string().min(1, t('errors.required')),
    paymentMethod: z.string().min(1, t('errors.required')),
    branchId: z.string().optional(),
    notes: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      itemType: 'beef',
      enclosureId: '',
      enclosureName: '',
      animalId: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      quantity: '',
      unit: 'kg',
      unitPrice: '',
      paidAmount: '',
      buyer: '',
      buyerContact: '',
      paymentStatus: 'unpaid',
      paymentMethod: 'cash',
      branchId: '',
      notes: '',
    },
  })

  // Load branches, enclosures, animals and stock
  useEffect(() => {
    if (!farm) return
    listBranches(farm.id).then(({ data }) => setBranches(data || []))
    listEnclosures({ farmId: farm.id }).then(({ data }) => setEnclosures(data || []))
    listAnimals({ farmId: farm.id }).then(({ data }) => {
      setAnimals((data || []).filter((a) => a.status !== 'sold' && a.status !== 'dead' && a.status !== 'slaughtered'))
    })
  }, [farm])

  // Reload stock whenever dialog opens or branch changes
  useEffect(() => {
    if (!open || !farm) return
    setStockLoading(true)
    getProductionStock({ farmId: farm.id, branchId: selectedBranchId })
      .then(({ data, enclosures: encList }) => {
        setStock(data || {})
        if (encList && encList.length > 0) setEnclosures(encList)
      })
      .finally(() => setStockLoading(false))
  }, [open, farm, selectedBranchId])

  useEffect(() => {
    if (!open) return
    if (editing) {
      reset({
        itemType: editing.itemType,
        enclosureId: editing.enclosureId || '',
        enclosureName: editing.enclosureName || '',
        animalId: editing.animalId || '',
        description: editing.description || '',
        date: editing.date,
        quantity: editing.quantity,
        unit: editing.unit,
        unitPrice: editing.unitPrice,
        paidAmount: editing.paidAmount,
        buyer: editing.buyer || '',
        buyerContact: editing.buyerContact || '',
        paymentStatus: editing.paymentStatus,
        paymentMethod: editing.paymentMethod,
        branchId: editing.branchId || '',
        notes: editing.notes || '',
      })
    } else {
      // Find first item type that has stock, default to beef or milk or animal
      const firstAvailable = SALE_ITEM_TYPES.find((t) => {
        if (t.id === 'animal') return true
        const s = stock[t.id]
        return s && s.available > 0
      })
      const defaultType = firstAvailable?.id || 'beef'
      const typeDef = SALE_ITEM_TYPES.find((t) => t.id === defaultType)
      reset({
        itemType: defaultType,
        enclosureId: '',
        enclosureName: '',
        animalId: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        quantity: '',
        unit: typeDef?.unit || 'kg',
        unitPrice: '',
        paidAmount: '',
        buyer: '',
        buyerContact: '',
        paymentStatus: 'unpaid',
        paymentMethod: 'cash',
        branchId: selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id || ''),
        notes: '',
      })
    }
  }, [open, editing, selectedBranchId, branches, reset, stock])

  const itemType = watch('itemType')
  const currentBranchId = watch('branchId')
  const selectedEnclosureId = watch('enclosureId')
  const quantity = watch('quantity')
  const unitPrice = watch('unitPrice')
  const paidAmount = watch('paidAmount')
  const computedTotal = Number(quantity || 0) * Number(unitPrice || 0)
  const quantityVal = Number(quantity || 0)

  // Current stock entry for selected type
  const currentStock = stock[itemType]
  // For editing: add back what this record originally sold so we don't block self
  const editingBack = editing && editing.itemType === itemType ? Number(editing.quantity || 0) : 0
  const effectiveAvailable = currentStock ? (currentStock.available + editingBack) : null

  // Filter enclosures by branch
  const filteredEnclosures = enclosures.filter((e) => {
    if (!currentBranchId || currentBranchId === 'none') return true
    return e.branchId === currentBranchId
  })

  // Selected enclosure object
  const selectedEnclosure = enclosures.find((e) => e.id === selectedEnclosureId)

  // Filter animals by branch and selected enclosure/species
  const filteredAnimals = animals.filter((a) => {
    if (currentBranchId && currentBranchId !== 'none' && a.branchId && a.branchId !== currentBranchId) return false
    if (selectedEnclosure?.speciesId && a.species) {
      if (a.species !== selectedEnclosure.speciesId) return false
    }
    return true
  })

  // Available item types to show in select: show types with stock plus animal & other
  const availableItemTypes = SALE_ITEM_TYPES.filter((t) => {
    if (!t.fromProduction) return true // Live Animal, Other always visible
    const s = stock[t.id]
    return s && s.produced > 0 // Show if production was recorded
  })

  const onSubmit = async (values) => {
    setServerError('')

    // 1. Validation for Live Animals from Enclosure: cannot exceed occupied headcount!
    if (values.itemType === 'animal' && selectedEnclosure) {
      const availableHeadcount = Number(selectedEnclosure.occupied || 0) +
        (editing && editing.enclosureId === selectedEnclosure.id ? Number(editing.quantity || 0) : 0)

      if (Number(values.quantity) > availableHeadcount) {
        setServerError(
          `Cannot sell ${values.quantity} animals. ${selectedEnclosure.name} currently only has ${availableHeadcount} occupied animals available.`
        )
        return
      }
    }

    // 2. Validation for Production-backed Stock items (Beef, Mutton, Chicken, Fish, Milk, Eggs)
    const typeDef = SALE_ITEM_TYPES.find((t) => t.id === values.itemType)
    if (typeDef?.fromProduction && effectiveAvailable !== null) {
      if (Number(values.quantity) > effectiveAvailable) {
        setServerError(
          `Only ${effectiveAvailable.toLocaleString()} ${currentStock?.unit || 'units'} of ${typeDef.label} available from production. Record more production or reduce quantity.`
        )
        return
      }
    }

    setSubmitting(true)
    const payload = {
      ...values,
      farmId: farm.id,
      branchId: values.branchId === 'none' ? null : values.branchId,
      enclosureId: values.enclosureId === 'none' ? null : values.enclosureId,
      animalId: values.animalId === 'none' ? null : values.animalId,
    }

    if (payload.paymentStatus === 'paid') payload.paidAmount = computedTotal
    if (payload.paymentStatus === 'unpaid') payload.paidAmount = 0

    const { error } = editing
      ? await updateSale(editing.id, payload)
      : await createSale(payload)

    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? t('sales.edit') : t('sales.add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Type & Date */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('sales.itemType')}</Label>
              <Select
                value={itemType}
                onValueChange={(v) => {
                  setValue('itemType', v, { shouldValidate: true })
                  const found = SALE_ITEM_TYPES.find((s) => s.id === v)
                  setValue('unit', found?.unit || 'unit')
                }}
              >
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableItemTypes.map((s) => {
                    const st = stock[s.id]
                    return (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2 w-full">
                          <span>{s.label}</span>
                          {st && st.produced > 0 && s.fromProduction && (
                            <span className={`ml-auto text-[10px] font-mono rounded px-1.5 py-0.5 ${st.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                              {st.available > 0 ? `${st.available.toLocaleString()} ${st.unit}` : 'sold out'}
                            </span>
                          )}
                          {s.id === 'animal' && (
                            <span className="ml-auto text-[10px] font-mono rounded px-1.5 py-0.5 bg-emerald-100 text-emerald-800">
                              {enclosures.reduce((sum, e) => sum + Number(e.occupied || 0), 0)} live heads
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('sales.date')}</Label>
              <Input type="date" {...register('date')} className="mt-1.5" />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
            </div>
          </div>

          {/* Branch Picker */}
          <div>
            <Label>{t('sales.branch')}</Label>
            <Select value={watch('branchId') || 'none'} onValueChange={(v) => setValue('branchId', v === 'none' ? '' : v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('sales.noBranch')}</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 1. LIVE ANIMAL ENCLOSURE SELECTION & POPULATION REDUCTION */}
          {itemType === 'animal' && (
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-bold text-forest-900">
                  <Warehouse className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Enclosure / Habitat to Sell From</span>
                </Label>
                {selectedEnclosure && (
                  <span className="text-[11px] font-mono font-bold text-emerald-800">
                    Occupied: {selectedEnclosure.occupied} / {selectedEnclosure.capacity} heads
                  </span>
                )}
              </div>

              <Select
                value={selectedEnclosureId || 'none'}
                onValueChange={(v) => {
                  const id = v === 'none' ? '' : v
                  setValue('enclosureId', id)
                  const found = enclosures.find((e) => e.id === id)
                  setValue('enclosureName', found ? found.name : '')
                  if (found?.branchId) setValue('branchId', found.branchId)
                }}
              >
                <SelectTrigger className="bg-white"><SelectValue placeholder="Select Enclosure to Sell Animals From" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific enclosure</SelectItem>
                  {filteredEnclosures.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} ({e.speciesNote || e.speciesId} · {e.occupied} occupied)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dynamic Enclosure Population Change Preview */}
              {selectedEnclosure && (
                <div className="mt-2 text-[11px] text-emerald-900 bg-white p-2.5 rounded-lg border border-emerald-200 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                  <div>
                    <strong>Enclosure Headcount Mapping:</strong> Selling{' '}
                    <span className="font-mono font-bold">{quantityVal || 0}</span> live head{quantityVal !== 1 ? 's' : ''} will deduct from{' '}
                    <strong>{selectedEnclosure.name}</strong>.
                    <div className="mt-0.5 text-emerald-800">
                      Remaining in enclosure after sale:{' '}
                      <span className="font-mono font-bold">
                        {Math.max(0, Number(selectedEnclosure.occupied || 0) - quantityVal).toLocaleString()}
                      </span>{' '}
                      heads.
                    </div>
                  </div>
                </div>
              )}

              {/* Specific Animal Tag Picker (Optional within selected enclosure) */}
              <div>
                <Label className="flex items-center gap-1 text-xs text-forest-700">
                  <Beef className="h-3 w-3 text-forest-500" />
                  <span>Specific Individual Animal Tag (Optional)</span>
                </Label>
                <Select value={watch('animalId') || 'none'} onValueChange={(v) => setValue('animalId', v === 'none' ? '' : v)}>
                  <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('sales.noAnimal')}</SelectItem>
                    {filteredAnimals.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name || a.tag} ({a.species || 'animal'})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* 2. Stock availability banner for production-backed types (Beef, Mutton, Chicken, Fish, Milk, Eggs) */}
          {(() => {
            const typeDef = SALE_ITEM_TYPES.find((t) => t.id === itemType)
            if (!typeDef?.fromProduction || !currentStock) return null
            const qtyVal = Number(quantity || 0)
            const isOver = effectiveAvailable !== null && qtyVal > effectiveAvailable
            return (
              <div className={`rounded-xl px-3.5 py-2.5 text-[11px] flex items-start gap-2 border ${
                isOver
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : effectiveAvailable === 0
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                {isOver
                  ? <TrendingDown className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  : effectiveAvailable === 0
                  ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  : <PackageCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                }
                <div>
                  <strong>Stock from production:</strong>{' '}
                  <span className="font-mono font-bold">{(effectiveAvailable ?? 0).toLocaleString()} {currentStock.unit}</span> available
                  {stockLoading && <span className="ml-1 opacity-60">(loading…)</span>}
                  <div className="mt-0.5 opacity-80">
                    Total produced: {currentStock.produced.toLocaleString()} · Already sold: {currentStock.sold.toLocaleString()}
                    {qtyVal > 0 && !isOver && (
                      <span> · Remaining after this sale: <strong>{Math.max(0, effectiveAvailable - qtyVal).toLocaleString()}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Quantity, Unit, Unit Price */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>{t('sales.quantity')}</Label>
              <Input type="number" step="any" min="0.01" {...register('quantity')} className="mt-1.5" />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>}
            </div>
            <div>
              <Label>{t('sales.unit')}</Label>
              <Input {...register('unit')} className="mt-1.5" />
            </div>
            <div>
              <Label>{t('sales.unitPrice')} (৳)</Label>
              <Input type="number" step="0.01" {...register('unitPrice')} className="mt-1.5" />
              {errors.unitPrice && <p className="mt-1 text-xs text-red-600">{errors.unitPrice.message}</p>}
            </div>
          </div>

          <div className="rounded-xl bg-sage/40 px-3 py-2 text-sm">
            {t('sales.total')}: <b>৳{computedTotal.toLocaleString()}</b>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('sales.paymentStatus')}</Label>
              <Select value={watch('paymentStatus')} onValueChange={(v) => setValue('paymentStatus', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('sales.paymentMethod')}</Label>
              <Select value={watch('paymentMethod')} onValueChange={(v) => setValue('paymentMethod', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS_SALE.map((p) => (
                    <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {watch('paymentStatus') === 'partial' && (
            <div>
              <Label>{t('sales.paidAmount')} (৳)</Label>
              <Input type="number" step="0.01" {...register('paidAmount')} className="mt-1.5" />
              {paidAmount && (
                <p className="mt-1 text-xs text-forest-700/70">
                  {t('sales.outstanding')}: ৳{Math.max(0, computedTotal - Number(paidAmount)).toLocaleString()}
                </p>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('sales.buyer')}</Label>
              <Input {...register('buyer')} className="mt-1.5" />
              {errors.buyer && <p className="mt-1 text-xs text-red-600">{errors.buyer.message}</p>}
            </div>
            <div>
              <Label>{t('sales.buyerContact')}</Label>
              <Input {...register('buyerContact')} className="mt-1.5" inputMode="tel" />
            </div>
          </div>

          <div>
            <Label>{t('sales.notes')}</Label>
            <Textarea rows={2} {...register('notes')} className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
              {submitting ? t('common.loading') : editing ? t('common.save') : t('sales.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
