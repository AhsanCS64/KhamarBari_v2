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
import { PRODUCTION_TYPES, SESSIONS, QUALITY_GRADES } from '@/lib/productionTypes'
import { MEAT_CATEGORIES } from '@/lib/saleOptions'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import { listAnimals } from '@/services/animalsService'
import { listEnclosures } from '@/services/enclosuresService'
import { createProduction, updateProduction } from '@/services/productionService'
import { AlertTriangle, CheckCircle2, Warehouse, Beef, Info, Scissors, ShieldAlert } from 'lucide-react'

/* Types that reduce enclosure headcount */
const REDUCES_HEAD = new Set(['death', 'slaughter'])
/* Types that increase enclosure headcount */
const INCREASES_HEAD = new Set(['birth', 'breeding'])

const inferMeatType = (speciesId, enclosureType) => {
  if (speciesId === 'cow') return 'beef'
  if (speciesId === 'goat' || speciesId === 'sheep') return 'mutton'
  if (['chicken', 'duck', 'rabbit'].includes(speciesId)) return 'chicken_meat'
  if (['fish', 'shrimp'].includes(speciesId) || enclosureType === 'pond') return 'fish'
  return 'chicken_meat'
}

export default function ProductionDialog({ open, onOpenChange, editing, onSaved, defaultType = 'milk' }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const selectedBranchId = useAppStore((s) => s.selectedBranchId)
  const [branches, setBranches] = useState([])
  const [animals, setAnimals] = useState([])
  const [enclosures, setEnclosures] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    type: z.string().min(1, t('errors.required')),
    enclosureId: z.string().optional(),
    enclosureName: z.string().optional(),
    animalId: z.string().optional(),
    animalName: z.string().optional(),
    date: z.string().min(1, t('errors.required')),
    session: z.string().optional(),
    quantity: z.coerce.number().positive(t('errors.required')),
    unit: z.string().min(1, t('errors.required')),
    quality: z.string().optional(),
    recorder: z.string().optional(),
    branchId: z.string().optional(),
    notes: z.string().optional(),
    meatYieldKg: z.coerce.number().min(0).optional().or(z.literal('')),
    meatType: z.string().optional(),
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: defaultType,
      enclosureId: '',
      enclosureName: '',
      animalId: '',
      animalName: '',
      date: new Date().toISOString().slice(0, 10),
      session: 'morning',
      quantity: '',
      unit: 'L',
      quality: '',
      recorder: '',
      branchId: '',
      notes: '',
      meatYieldKg: '',
      meatType: 'chicken_meat',
    },
  })

  // Load branches, enclosures, and animals
  useEffect(() => {
    if (!farm) return
    listBranches(farm.id).then(({ data }) => setBranches(data || []))
    listEnclosures({ farmId: farm.id }).then(({ data }) => setEnclosures(data || []))
    listAnimals({ farmId: farm.id }).then(({ data }) => {
      setAnimals((data || []).filter((a) => a.status !== 'sold' && a.status !== 'dead' && a.status !== 'slaughtered'))
    })
  }, [farm])

  useEffect(() => {
    if (!open) return
    if (editing) {
      reset({
        type: editing.type,
        enclosureId: editing.enclosureId || '',
        enclosureName: editing.enclosureName || '',
        animalId: editing.animalId || '',
        animalName: editing.animalName || '',
        date: editing.date,
        session: editing.session || 'morning',
        quantity: editing.quantity,
        unit: editing.unit,
        quality: editing.quality || '',
        recorder: editing.recorder || '',
        branchId: editing.branchId || '',
        notes: editing.notes || '',
        meatYieldKg: editing.meatYieldKg || '',
        meatType: editing.meatType || (editing.type === 'slaughter' ? inferMeatType(editing.speciesId) : ''),
      })
    } else {
      const tCfg = PRODUCTION_TYPES.find((p) => p.id === defaultType)
      const initialBranch = selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id || '')
      reset({
        type: defaultType,
        enclosureId: '',
        enclosureName: '',
        animalId: '',
        animalName: '',
        date: new Date().toISOString().slice(0, 10),
        session: 'morning',
        quantity: '',
        unit: tCfg?.unit || 'L',
        quality: '',
        recorder: '',
        branchId: initialBranch,
        notes: '',
        meatYieldKg: '',
        meatType: 'chicken_meat',
      })
    }
  }, [open, editing, selectedBranchId, branches, reset, defaultType])

  const type = watch('type')
  const typeCfg = PRODUCTION_TYPES.find((p) => p.id === type)
  const currentBranchId = watch('branchId')
  const selectedEnclosureId = watch('enclosureId')
  const quantityVal = Number(watch('quantity') || 0)
  const currentMeatType = watch('meatType')

  // Strict enclosure compatibility filtering based on production type:
  // - Milk: only enclosures having Lines or dairy species (cow, goat, sheep)
  // - Egg: only poultry / layer / duck enclosures
  // - Harvest: only ponds / aquaculture or field plots
  // - Slaughter: meat-yielding animals (cattle, goat, sheep, poultry, fish)
  const filteredEnclosures = enclosures.filter((e) => {
    if (currentBranchId && currentBranchId !== 'none' && e.branchId && e.branchId !== currentBranchId) {
      return false
    }

    if (type === 'milk') {
      return e.type === 'line' || ['cow', 'goat', 'sheep'].includes(e.speciesId)
    }

    if (type === 'egg') {
      return ['chicken', 'duck'].includes(e.speciesId) || (e.type === 'room' && e.speciesId !== 'rabbit')
    }

    if (type === 'harvest') {
      return e.type === 'pond' || ['fish', 'shrimp'].includes(e.speciesId)
    }

    if (type === 'slaughter') {
      return ['cow', 'goat', 'sheep', 'chicken', 'duck', 'rabbit', 'fish', 'shrimp'].includes(e.speciesId) || ['room', 'line', 'pond'].includes(e.type)
    }

    if (type === 'birth' || type === 'breeding') {
      return ['cow', 'goat', 'sheep', 'chicken', 'duck', 'rabbit'].includes(e.speciesId) || ['room', 'line'].includes(e.type)
    }

    return true
  })

  // Selected enclosure object
  const selectedEnclosure = enclosures.find((e) => e.id === selectedEnclosureId)

  // Auto-clear enclosure if type switch made previously selected enclosure incompatible
  useEffect(() => {
    if (selectedEnclosureId && filteredEnclosures.length > 0) {
      const isStillValid = filteredEnclosures.some((e) => e.id === selectedEnclosureId)
      if (!isStillValid) {
        setValue('enclosureId', '')
        setValue('enclosureName', '')
      }
    }
  }, [type, filteredEnclosures, selectedEnclosureId, setValue])

  // Filter animals based on branch and compatible species
  const filteredAnimals = animals.filter((a) => {
    if (currentBranchId && currentBranchId !== 'none' && a.branchId && a.branchId !== currentBranchId) {
      return false
    }
    if (selectedEnclosure?.speciesId && a.species) {
      if (a.species !== selectedEnclosure.speciesId) return false
    }
    if (type === 'milk') {
      return ['cow', 'goat', 'sheep'].includes(a.species)
    }
    if (type === 'egg') {
      return ['chicken', 'duck'].includes(a.species)
    }
    return true
  })

  const onSubmit = async (values) => {
    // If death or slaughter, validate against enclosure occupancy
    if (REDUCES_HEAD.has(values.type) && selectedEnclosure) {
      if (Number(values.quantity) > Number(selectedEnclosure.occupied || 0)) {
        setServerError(
          values.type === 'slaughter'
            ? `Processing quantity (${values.quantity}) cannot exceed current enclosure headcount (${selectedEnclosure.occupied}).`
            : `Mortality quantity (${values.quantity}) cannot exceed current enclosure headcount (${selectedEnclosure.occupied}).`
        )
        return
      }
    }

    setSubmitting(true)
    setServerError('')

    // Infer meatType for slaughter or pond harvest
    let resolvedMeatType = values.meatType
    if (values.type === 'slaughter') {
      resolvedMeatType = values.meatType || inferMeatType(selectedEnclosure?.speciesId, selectedEnclosure?.type)
    } else if (values.type === 'harvest' && (selectedEnclosure?.type === 'pond' || selectedEnclosure?.speciesId === 'fish')) {
      resolvedMeatType = 'fish'
    } else {
      resolvedMeatType = null
    }

    const payload = {
      ...values,
      farmId: farm.id,
      branchId: values.branchId === 'none' ? null : values.branchId,
      enclosureId: values.enclosureId === 'none' ? null : values.enclosureId,
      animalId: values.animalId === 'none' ? null : values.animalId,
      meatYieldKg: values.type === 'slaughter' && values.meatYieldKg ? Number(values.meatYieldKg) : null,
      meatType: resolvedMeatType,
      speciesId: selectedEnclosure?.speciesId || null,
    }

    const { error } = editing
      ? await updateProduction(editing.id, payload)
      : await createProduction(payload)

    setSubmitting(false)
    if (error) { setServerError(error); return }
    onOpenChange(false)
    onSaved?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? t('production.edit') : t('production.add')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Type & Date */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('production.type')}</Label>
              <Select value={type} onValueChange={(v) => {
                setValue('type', v, { shouldValidate: true })
                const cfg = PRODUCTION_TYPES.find((p) => p.id === v)
                setValue('unit', cfg?.unit || 'unit')
                if (v !== 'slaughter') {
                  setValue('meatYieldKg', '')
                }
              }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCTION_TYPES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('production.date')}</Label>
              <Input type="date" {...register('date')} className="mt-1.5" />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
            </div>
          </div>

          {/* Branch Picker */}
          <div>
            <Label>{t('production.branch')}</Label>
            <Select value={currentBranchId || 'none'} onValueChange={(v) => setValue('branchId', v === 'none' ? '' : v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('production.noBranch')}</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Enclosure / Habitat Picker (Filtered strictly by production type) */}
          <div className="p-3.5 rounded-xl border border-emerald-100 bg-forest-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-xs font-bold text-forest-900">
                <Warehouse className="h-3.5 w-3.5 text-emerald-700" />
                <span>
                  {type === 'milk'
                    ? 'Dairy Line / Habitat (Cattle, Goats, Sheep)'
                    : type === 'egg'
                    ? 'Poultry Shed / Coop (Layers, Broilers, Ducks)'
                    : type === 'harvest'
                    ? 'Pond / Aquaculture Basin / Crop Field'
                    : 'Enclosure / Habitat'}
                </span>
              </Label>
              {selectedEnclosure && (
                <span className="text-[11px] font-mono font-bold text-emerald-800">
                  Headcount: {selectedEnclosure.occupied.toLocaleString()} / {selectedEnclosure.capacity.toLocaleString()}
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
                if (found && found.branchId) {
                  setValue('branchId', found.branchId)
                }
                if (found && type === 'slaughter') {
                  setValue('meatType', inferMeatType(found.speciesId, found.type))
                }
              }}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={filteredEnclosures.length === 0 ? "No compatible enclosures found" : "Select Enclosure / Habitat"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific enclosure</SelectItem>
                {filteredEnclosures.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} ({e.speciesNote || e.speciesId} · {e.occupied} occupied · {e.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filteredEnclosures.length === 0 && (
              <p className="text-[11px] text-amber-700 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                No enclosures matching this activity ({type === 'milk' ? 'Milking Lines' : type === 'egg' ? 'Poultry Sheds' : 'compatible habitats'}).
              </p>
            )}

            {/* Dynamic Contextual Guidance — Death */}
            {type === 'death' && selectedEnclosure && (
              <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/70 flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong>Headcount Mapping:</strong> Recording this death will deduct{' '}
                  <span className="font-mono font-bold">{quantityVal || 0}</span> from{' '}
                  <strong>{selectedEnclosure.name}</strong>.
                  <div className="mt-0.5 text-amber-900">
                    Remaining after recording:{' '}
                    <span className="font-mono font-bold">
                      {Math.max(0, Number(selectedEnclosure.occupied || 0) - quantityVal).toLocaleString()}
                    </span>{' '}
                    animals.
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Contextual Guidance — Slaughter / Meat Processing */}
            {type === 'slaughter' && selectedEnclosure && (
              <div className="mt-2 text-[11px] text-red-800 bg-red-50/80 p-2.5 rounded-lg border border-red-200/70 flex items-start gap-2">
                <Scissors className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <strong>Meat Processing:</strong> Processing{' '}
                  <span className="font-mono font-bold">{quantityVal || 0}</span> animal{quantityVal !== 1 ? 's' : ''} from{' '}
                  <strong>{selectedEnclosure.name}</strong> will remove them from the enclosure and credit the harvested meat into sold items stock.
                  <div className="mt-0.5 text-red-900">
                    Remaining in enclosure:{' '}
                    <span className="font-mono font-bold">
                      {Math.max(0, Number(selectedEnclosure.occupied || 0) - quantityVal).toLocaleString()}
                    </span>{' '}
                    heads.
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Contextual Guidance — Birth */}
            {type === 'birth' && selectedEnclosure && (
              <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/70 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <strong>Headcount Mapping:</strong> Recording this birth will add{' '}
                  <span className="font-mono font-bold">{quantityVal || 0}</span> to{' '}
                  <strong>{selectedEnclosure.name}</strong>.
                  <div className="mt-0.5 text-emerald-900">
                    New total occupancy:{' '}
                    <span className="font-mono font-bold">
                      {(Number(selectedEnclosure.occupied || 0) + quantityVal).toLocaleString()}
                    </span>{' '}
                    animals.
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Contextual Guidance — Breeding */}
            {type === 'breeding' && selectedEnclosure && (
              <div className="mt-2 text-[11px] text-violet-800 bg-violet-50/80 p-2.5 rounded-lg border border-violet-200/70 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-600 mt-0.5" />
                <div>
                  <strong>Headcount Mapping:</strong> Recording this breeding will add{' '}
                  <span className="font-mono font-bold">{quantityVal || 0}</span> to{' '}
                  <strong>{selectedEnclosure.name}</strong>.
                  <div className="mt-0.5 text-violet-900">
                    New total occupancy:{' '}
                    <span className="font-mono font-bold">
                      {(Number(selectedEnclosure.occupied || 0) + quantityVal).toLocaleString()}
                    </span>{' '}
                    animals.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Specific Animal Tag Picker (Optional) */}
          <div>
            <Label className="flex items-center gap-1.5 text-xs text-forest-700">
              <Beef className="h-3.5 w-3.5 text-forest-500" />
              <span>Specific Animal Tag (Optional)</span>
            </Label>
            <Select value={watch('animalId') || 'none'} onValueChange={(v) => {
              const id = v === 'none' ? '' : v
              setValue('animalId', id)
              const found = animals.find((a) => a.id === id)
              setValue('animalName', found ? (found.name || found.tag) : '')
              if (found && type === 'slaughter') {
                setValue('meatType', inferMeatType(found.species))
              }
            }}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('production.noAnimal')}</SelectItem>
                {filteredAnimals.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name || a.tag} ({a.species || 'animal'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity, Unit, Session */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>{t('production.quantity')}</Label>
              <Input type="number" step="any" min="0.01" {...register('quantity')} className="mt-1.5" />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>}
            </div>
            <div>
              <Label>{t('production.unit')}</Label>
              <Input {...register('unit')} className="mt-1.5" />
            </div>
            {typeCfg?.hasSession && (
              <div>
                <Label>{t('production.session')}</Label>
                <Select value={watch('session') || 'morning'} onValueChange={(v) => setValue('session', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SESSIONS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Slaughter / Meat Processing: Specific Meat Category & Meat Yield (kg) */}
          {type === 'slaughter' && (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/40 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1.5 text-xs font-bold text-red-950">
                    <Scissors className="h-3.5 w-3.5 text-red-600" />
                    <span>Meat Category</span>
                  </Label>
                  <Select
                    value={currentMeatType || 'chicken_meat'}
                    onValueChange={(v) => setValue('meatType', v)}
                  >
                    <SelectTrigger className="mt-1.5 bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEAT_CATEGORIES.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-1.5 text-xs font-bold text-red-950">
                    <span>Meat Yield (kg)</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    {...register('meatYieldKg')}
                    placeholder="Total kg harvested"
                    className="mt-1.5 bg-white"
                  />
                </div>
              </div>
              <p className="text-[11px] text-red-800/80">
                This harvested yield will be tracked under <strong>{MEAT_CATEGORIES.find(m => m.id === currentMeatType)?.label || 'Meat'}</strong> in Sold Items stock.
              </p>
            </div>
          )}

          {type === 'milk' || type === 'egg' ? (
            <div>
              <Label>{t('production.quality')}</Label>
              <Select value={watch('quality') || 'none'} onValueChange={(v) => setValue('quality', v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('production.noQuality')}</SelectItem>
                  {QUALITY_GRADES.map((q) => (
                    <SelectItem key={q} value={q}>{q.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div>
            <Label>{t('production.recorder')}</Label>
            <Input {...register('recorder')} className="mt-1.5" placeholder={t('production.recorderPlaceholder')} />
          </div>

          <div>
            <Label>{t('production.notes')}</Label>
            <Textarea rows={2} {...register('notes')} className="mt-1.5" placeholder="Cause of death / session notes / feed details / processing remarks" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
              {submitting ? t('common.loading') : editing ? t('common.save') : t('production.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
