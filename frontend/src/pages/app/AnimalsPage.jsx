import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Beef, Warehouse, Waves, Rows3, Plus, Search, LayoutGrid, List,
  ChevronRight, MoreVertical, X, Bird, Fish, Rabbit, HeartPulse,
  CalendarDays, Users, MapPin, Trash2, AlertTriangle, TrendingUp, GitBranch,
  Ruler, Boxes, Check, Minus,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { listBranches } from '@/services/branchService'
import { createEnclosure, deleteEnclosure, listEnclosures, updateEnclosure } from '@/services/enclosuresService'
import SproutLoader from '@/components/common/SproutLoader'
import AddAnimalModal from '@/components/animals/AddAnimalModal'

/* ────────────────────────────────────────────────────────────
   Domain model / constants
──────────────────────────────────────────────────────────── */
const ENCLOSURE_TYPES = [
  {
    id: 'room',
    icon: Warehouse,
    label: 'Room',
    hint: 'Housing for poultry, rabbits, etc.',
    sizeLabel: 'Floor area',
    sizeUnit: 'm²',
    capacityLabel: 'Max headcount',
    accent: 'var(--color-forest-500)',
  },
  {
    id: 'line',
    icon: Rows3,
    label: 'Line',
    hint: 'Tether/stanchion line for cattle, goats, sheep',
    sizeLabel: 'Line length',
    sizeUnit: 'm',
    capacityLabel: 'Seats on line',
    accent: 'var(--color-warn-500)',
  },
  {
    id: 'pond',
    icon: Waves,
    label: 'Pond',
    hint: 'Water body for fish, shrimp, ducks',
    sizeLabel: 'Surface area',
    sizeUnit: 'm²',
    capacityLabel: 'Stocking density (max)',
    accent: 'var(--color-info-500)',
  },
]

const SPECIES = [
  { id: 'chicken',  label: 'Chicken',      icon: Bird,    enclosure: 'room', defaultBreed: 'Broiler / Layer' },
  { id: 'duck',     label: 'Duck',         icon: Bird,    enclosure: 'pond', defaultBreed: 'Khaki Campbell' },
  { id: 'cow',      label: 'Cow',          icon: Beef,    enclosure: 'line', defaultBreed: 'Holstein Friesian' },
  { id: 'goat',     label: 'Goat',         icon: Beef,    enclosure: 'line', defaultBreed: 'Black Bengal' },
  { id: 'sheep',    label: 'Sheep',        icon: Beef,    enclosure: 'line', defaultBreed: 'Garole' },
  { id: 'fish',     label: 'Fish',         icon: Fish,    enclosure: 'pond', defaultBreed: 'Tilapia / Rohu' },
  { id: 'shrimp',   label: 'Shrimp',       icon: Fish,    enclosure: 'pond', defaultBreed: 'Bagda' },
  { id: 'rabbit',   label: 'Rabbit',       icon: Rabbit,  enclosure: 'room', defaultBreed: 'New Zealand' },
]

const HEALTH_STATES = [
  { id: 'healthy',   label: 'Healthy',   color: 'var(--color-forest-500)' },
  { id: 'watch',     label: 'Watch',     color: 'var(--color-warn-500)' },
  { id: 'treatment', label: 'Treatment', color: 'var(--color-alert-500)' },
  { id: 'quarantine',label: 'Quarantine',color: 'var(--color-info-500)' },
]

/* ────────────────────────────────────────────────────────────
   Small UI atoms
──────────────────────────────────────────────────────────── */
const Chip = ({ children, color, soft, icon: Icon, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
    style={{
      color: soft ? color : '#fff',
      background: soft ? `${color}1A` : color,
    }}
  >
    {Icon && <Icon size={11} />}
    {children}
  </span>
)

const Stat = ({ icon: Icon, label, value, sub, color }) => (
  <div className="flex items-center gap-2.5 rounded-lg border border-cream-200 bg-white px-3 py-2">
    <div
      className="flex h-8 w-8 items-center justify-center rounded-md"
      style={{ background: `${color ?? 'var(--color-forest-500)'}15` }}
    >
      <Icon size={15} style={{ color: color ?? 'var(--color-forest-500)' }} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-soft">{label}</p>
      <p className="text-[13px] font-bold tabular-nums text-slate-ink leading-tight">
        {value}
        {sub && <span className="ml-1 text-[10px] font-medium text-slate-soft">{sub}</span>}
      </p>
    </div>
  </div>
)

const OccupancyBar = ({ occupied, capacity }) => {
  const pct = Math.min(100, Math.round((occupied / Math.max(capacity, 1)) * 100))
  const color =
    pct >= 95 ? 'var(--color-alert-500)'
    : pct >= 80 ? 'var(--color-warn-500)'
    : 'var(--color-forest-500)'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-10 text-right text-[11px] font-semibold tabular-nums text-slate-soft">
        {pct}%
      </span>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Enclosure card
──────────────────────────────────────────────────────────── */
const EnclosureCard = ({ enc, branchName, onOpen }) => {
  const { t } = useTranslation()
  const type = ENCLOSURE_TYPES.find((t) => t.id === enc.type)
  const species = SPECIES.find((s) => s.id === enc.speciesId)
  const health = HEALTH_STATES.find((h) => h.id === enc.health)
  const TypeIcon = type.icon
  const SpeciesIcon = species?.icon ?? Beef

  return (
    <button
      onClick={() => onOpen(enc)}
      className="group relative overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(6,28,21,0.10)]"
      style={{ borderColor: 'var(--color-cream-200)' }}
    >
      {/* Type ribbon */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: type.accent }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${type.accent}15` }}
          >
            <TypeIcon size={18} style={{ color: type.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: type.accent }}>
              {type.label}
            </p>
            <h3 className="text-[15px] font-bold leading-tight text-slate-ink">{enc.name}</h3>
          </div>
        </div>
        <MoreVertical size={16} className="text-slate-soft opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Species row */}
      <div className="mt-3 flex items-center gap-2">
        <SpeciesIcon size={14} className="text-slate-soft" />
        <span className="text-[12px] font-medium text-slate-ink">{species?.label}</span>
        <span className="text-[11px] text-slate-soft">· {enc.speciesNote}</span>
      </div>

      {/* Occupancy */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium text-slate-soft">Occupancy</span>
          <span className="text-[12px] font-semibold tabular-nums text-slate-ink">
            {enc.occupied.toLocaleString()}
            <span className="text-slate-soft"> / {enc.capacity.toLocaleString()}</span>
          </span>
        </div>
        <OccupancyBar occupied={enc.occupied} capacity={enc.capacity} />
      </div>

      {/* Meta chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Chip color={health.color} soft icon={HeartPulse}>{health.label}</Chip>
        {Number(enc.sickCount) > 0 && <Chip color="var(--color-alert-500)" soft icon={AlertTriangle}>{t(enc.type === 'pond' ? 'animalsPage.affectedBadge' : 'animalsPage.sickBadge', { count: Number(enc.sickCount).toLocaleString() })}</Chip>}
        <Chip color="var(--color-slate-soft)" soft icon={Ruler}>
          {enc.size} {type.sizeUnit}
        </Chip>
        <Chip color="var(--color-slate-soft)" soft icon={CalendarDays}>
          {enc.ageDays}d
        </Chip>
        <Chip color="var(--color-slate-soft)" soft icon={MapPin}>
          {enc.barnId}
        </Chip>
        {branchName && <Chip color="var(--color-forest-600)" soft icon={GitBranch}>{branchName}</Chip>}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-cream-200 pt-3">
        <span className="text-[10px] text-slate-soft">Checked {enc.lastCheck}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: type.accent }}>
          Manage <ChevronRight size={12} />
        </span>
      </div>
    </button>
  )
}

/* ────────────────────────────────────────────────────────────
   Create enclosure modal
──────────────────────────────────────────────────────────── */
function CreateEnclosureModal({ open, onClose, onCreate, branches, selectedBranchId }) {
  const [type, setType] = useState('room')
  const [speciesId, setSpeciesId] = useState('chicken')
  const [branchId, setBranchId] = useState('')
  const [name, setName] = useState('')
  const [barnId, setBarnId] = useState('')
  const [speciesNote, setSpeciesNote] = useState('')
  const [size, setSize] = useState('')
  const [capacity, setCapacity] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    setBranchId(selectedBranchId !== 'all' ? selectedBranchId : (branches[0]?.id || ''))
  }, [open, selectedBranchId, branches])

  if (!open) return null
  const cfg = ENCLOSURE_TYPES.find((t) => t.id === type)
  const allowedSpecies = SPECIES.filter((s) => s.enclosure === type)

  const valid = branchId && name.trim() && Number(size) > 0 && Number(capacity) > 0 && speciesId

  const submit = () => {
    if (!valid) return
    onCreate({
      id: `e${Date.now()}`,
      branchId,
      type,
      name,
      barnId: barnId || '—',
      speciesId,
      speciesNote: speciesNote || SPECIES.find((s) => s.id === speciesId)?.defaultBreed || '',
      size: Number(size),
      capacity: Number(capacity),
      occupied: 0,
      sickCount: 0,
      health: 'healthy',
      lastCheck: 'just now',
      notes,
      ageDays: 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-ink/40 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ border: '1px solid var(--color-cream-200)' }}
      >
        <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-slate-ink">New Enclosure</h2>
            <p className="text-[11px] text-slate-soft">Define a space, its size, and its species.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-soft hover:bg-cream-100">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {/* Type */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
              Enclosure type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ENCLOSURE_TYPES.map((t) => {
                const Icon = t.icon
                const active = type === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setType(t.id)
                      const first = SPECIES.find((s) => s.enclosure === t.id)
                      setSpeciesId(first?.id)
                    }}
                    className="flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all"
                    style={{
                      borderColor: active ? t.accent : 'var(--color-cream-200)',
                      background: active ? `${t.accent}10` : '#fff',
                    }}
                  >
                    <Icon size={18} style={{ color: active ? t.accent : 'var(--color-slate-soft)' }} />
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: active ? t.accent : 'var(--color-slate-ink)' }}
                    >
                      {t.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-soft">{cfg.hint}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">Branch</label>
            <select value={branchId} onChange={(event) => setBranchId(event.target.value)} className="w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20" required>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </div>

          {/* Name + Barn */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. ${type === 'room' ? 'Broiler House A' : type === 'line' ? 'Dairy Line 1' : 'North Pond'}`}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
                Location / Barn
              </label>
              <input
                value={barnId}
                onChange={(e) => setBarnId(e.target.value)}
                placeholder="Barn 1 / Field 2"
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

          {/* Species */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
              Species
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allowedSpecies.map((s) => {
                const Icon = s.icon
                const active = speciesId === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setSpeciesId(s.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
                    style={{
                      borderColor: active ? 'var(--color-forest-500)' : 'var(--color-cream-200)',
                      background: active ? 'var(--color-forest-50)' : '#fff',
                      color: active ? 'var(--color-forest-700)' : 'var(--color-slate-mid)',
                    }}
                  >
                    <Icon size={13} />
                    {s.label}
                  </button>
                )
              })}
            </div>
            <input
              value={speciesNote}
              onChange={(e) => setSpeciesNote(e.target.value)}
              placeholder={SPECIES.find((s) => s.id === speciesId)?.defaultBreed || 'Breed / strain note'}
              className="mt-2 w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
            />
          </div>

          {/* Size + Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
                {cfg.sizeLabel} ({cfg.sizeUnit})
              </label>
              <input
                type="number"
                min="0.01"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder={type === 'line' ? '60' : type === 'pond' ? '900' : '240'}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] tabular-nums outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
                {cfg.capacityLabel}
              </label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder={type === 'line' ? '40' : '5000'}
                className="w-full rounded-lg border border-cream-200 px-3 py-2 text-[13px] tabular-nums outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-soft">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ventilation, water source, feed schedule…"
              className="w-full resize-none rounded-lg border border-cream-200 px-3 py-2 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-cream-200 bg-cream-50 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[13px] font-semibold text-slate-soft hover:bg-cream-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!valid}
            className="rounded-lg bg-forest-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-forest-700 disabled:opacity-40"
          >
            Create enclosure
          </button>
        </div>
      </div>
    </div>
  )
}

function ManageEnclosureModal({ enclosure, branches, onClose, onSave, onDelete, onAddAnimal }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(() => ({ ...enclosure }))
  const type = ENCLOSURE_TYPES.find((item) => item.id === enclosure.type)
  const speciesOptions = SPECIES.filter((item) => item.enclosure === enclosure.type)
  const occupied = Number(form.occupied)
  const capacity = Number(form.capacity)
  const sickCount = Number(form.sickCount || 0)
  const valid = form.name?.trim() && Number(form.size) > 0 && capacity > 0
    && Number.isInteger(occupied) && occupied >= 0 && occupied <= capacity
    && Number.isInteger(sickCount) && sickCount >= 0 && sickCount <= occupied

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const save = (event) => {
    event.preventDefault()
    if (!valid) return
    onSave({
      ...form,
      name: form.name.trim(),
      size: Number(form.size),
      capacity,
      occupied,
      sickCount,
      lastCheck: 'just now',
    })
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-ink/50 p-3 backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.form
        onSubmit={save}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-enclosure-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-2xl"
      >
        <div className="relative overflow-hidden border-b border-cream-200 bg-gradient-to-br from-forest-900 via-forest-800 to-forest-600 px-5 py-5 text-white sm:px-6">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-fresh-200">
                <type.icon size={13} /> {type.label} management
              </span>
              <h2 id="manage-enclosure-title" className="mt-1 text-xl font-bold text-white">{enclosure.name}</h2>
              <p className="mt-1 text-xs text-white/65">Update capacity, stock, health and habitat details.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={onAddAnimal} className="rounded-lg bg-fresh-300 px-3 py-2 text-xs font-bold text-forest-950 transition hover:bg-fresh-200">
                Add animals
              </button>
              <button type="button" onClick={onClose} aria-label="Close enclosure management" className="rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white">
                <X size={17} />
              </button>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-[1fr_auto] items-end gap-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/70">
                <span>Current occupancy</span>
                <span className="font-semibold text-white">{Number.isFinite(occupied) && capacity > 0 ? Math.round((occupied / capacity) * 100) : 0}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <motion.div className="h-full rounded-full bg-fresh-300" animate={{ width: `${Math.min(capacity > 0 ? (occupied / capacity) * 100 : 0, 100)}%` }} transition={{ duration: 0.35 }} />
              </div>
            </div>
            <span className="text-right text-xs text-white/70">{Number.isFinite(occupied) ? occupied.toLocaleString() : 0} / {capacity > 0 ? capacity.toLocaleString() : 0}</span>
          </div>
        </div>

        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Enclosure name">
              <input value={form.name} onChange={(event) => update('name', event.target.value)} className={fieldClass} required />
            </Field>
            <Field label="Location / barn">
              <input value={form.barnId || ''} onChange={(event) => update('barnId', event.target.value)} placeholder="Barn 1 / Field 2" className={fieldClass} />
            </Field>
            <Field label="Species">
              <select value={form.speciesId} onChange={(event) => update('speciesId', event.target.value)} className={fieldClass}>
                {speciesOptions.map((species) => <option key={species.id} value={species.id}>{species.label}</option>)}
              </select>
            </Field>
            <Field label="Branch">
              <select value={form.branchId || ''} onChange={(event) => update('branchId', event.target.value)} className={fieldClass} required>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </Field>
            <Field label="Breed / strain">
              <input value={form.speciesNote || ''} onChange={(event) => update('speciesNote', event.target.value)} placeholder="Breed or strain" className={fieldClass} />
            </Field>
            <Field label={`Size (${type.sizeUnit})`}>
              <input type="number" min="0.01" step="any" value={form.size} onChange={(event) => update('size', event.target.value)} className={fieldClass} required />
            </Field>
            <Field label={type.capacityLabel}>
              <input type="number" min="1" step="1" value={form.capacity} onChange={(event) => update('capacity', event.target.value)} className={fieldClass} required />
            </Field>
          </div>

          <section className="rounded-xl border border-cream-200 bg-cream-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-ink">Manage occupancy</h3>
                <p className="mt-0.5 text-[11px] text-slate-soft">Headcount cannot exceed enclosure capacity.</p>
              </div>
              <Users size={17} className="text-forest-600" />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Remove one animal" onClick={() => update('occupied', Math.max(0, occupied - 1))} disabled={!Number.isFinite(occupied) || occupied <= 0} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cream-200 bg-white text-slate-mid transition hover:border-forest-300 hover:text-forest-700 disabled:opacity-40">
                <Minus size={16} />
              </button>
              <input type="number" min="0" max={capacity || undefined} step="1" value={form.occupied} onChange={(event) => update('occupied', event.target.value)} aria-label="Current animal count" className={`${fieldClass} h-10 text-center text-base font-bold tabular-nums`} required />
              <button type="button" aria-label="Add one animal" onClick={() => update('occupied', Math.min(capacity, occupied + 1))} disabled={!Number.isFinite(occupied) || occupied >= capacity} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cream-200 bg-white text-slate-mid transition hover:border-forest-300 hover:text-forest-700 disabled:opacity-40">
                <Plus size={16} />
              </button>
              <span className="ml-1 shrink-0 text-xs text-slate-soft">head</span>
            </div>
            {occupied > capacity && <p className="mt-2 text-xs font-medium text-alert-600">Headcount is above capacity. Lower it or increase capacity to save.</p>}
          </section>

          <section className="rounded-xl border border-amber-200/80 bg-[#fffaf0] p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-ink">{t(type.id === 'pond' ? 'animalsPage.affectedEstimate' : 'animalsPage.sickCount')}</h3>
                <p className="mt-0.5 text-[11px] text-slate-soft">{t(type.id === 'pond' ? 'animalsPage.affectedEstimateHint' : 'animalsPage.sickCountHint')}</p>
              </div>
              <HeartPulse size={17} className="text-amber-700" />
            </div>
            <input type="number" min="0" max={occupied} step="1" value={form.sickCount ?? 0} onChange={(event) => update('sickCount', event.target.value)} aria-label={t(type.id === 'pond' ? 'animalsPage.affectedEstimate' : 'animalsPage.sickCount')} className={`${fieldClass} h-11 text-center text-lg font-bold tabular-nums`} required />
            {sickCount > occupied && <p className="mt-2 text-xs font-medium text-alert-600">{t('animalsPage.affectedWithinOccupancy')}</p>}
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Health status">
              <select value={form.health} onChange={(event) => update('health', event.target.value)} className={fieldClass}>
                {HEALTH_STATES.map((state) => <option key={state.id} value={state.id}>{state.label}</option>)}
              </select>
            </Field>
            <Field label="Notes">
              <input value={form.notes || ''} onChange={(event) => update('notes', event.target.value)} placeholder="Care, feed or environment notes" className={fieldClass} />
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cream-200 bg-cream-50 px-5 py-3 sm:px-6">
          <button type="button" onClick={() => {
            if (window.confirm(`Delete ${enclosure.name}? This cannot be undone.`)) onDelete(enclosure.id)
          }} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-alert-600 transition hover:bg-alert-50">
            <Trash2 size={14} /> Delete enclosure
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-soft transition hover:bg-cream-100">Cancel</button>
            <button type="submit" disabled={!valid} className="inline-flex items-center gap-1.5 rounded-lg bg-forest-700 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40">
              <Check size={14} /> Save changes
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  )
}

const fieldClass = 'w-full rounded-lg border border-cream-200 bg-white px-3 py-2 text-[13px] text-slate-ink outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-500/15'

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-soft">{label}</span>
      {children}
    </label>
  )
}

/* ────────────────────────────────────────────────────────────
   Main page
──────────────────────────────────────────────────────────── */
export default function AnimalsPage() {
  const { t } = useTranslation()
  const farm = useAuthStore((state) => state.farm)
  const selectedBranchId = useAppStore((state) => state.selectedBranchId)
  const branchRevision = useAppStore((state) => state.branchRevision)
  const [enclosures, setEnclosures] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('grid')
  const [query, setQuery] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedEnclosure, setSelectedEnclosure] = useState(null)
  const [animalEnclosure, setAnimalEnclosure] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!farm?.id) return undefined
    setLoading(true)
    setError('')
    Promise.all([listBranches(farm.id), listEnclosures({ farmId: farm.id })])
      .then(([branchResult, enclosureResult]) => {
        if (cancelled) return
        setBranches(branchResult.data || [])
        setEnclosures(enclosureResult.data || [])
        setLoading(false)
      })
      .catch((cause) => {
        if (cancelled) return
        setError(cause?.message || 'Unable to load enclosures')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [farm?.id, branchRevision])

  // Re-fetch enclosures when production changes headcounts (death, birth, breeding, slaughter)
  useEffect(() => {
    const refreshEnclosures = () => {
      if (!farm?.id) return
      listEnclosures({ farmId: farm.id }).then(({ data }) => {
        if (data) setEnclosures(data)
      })
    }
    window.addEventListener('khamar:enclosures-changed', refreshEnclosures)
    return () => window.removeEventListener('khamar:enclosures-changed', refreshEnclosures)
  }, [farm?.id])

  const branchEnclosures = useMemo(
    () => enclosures.filter((enclosure) => selectedBranchId === 'all' || enclosure.branchId === selectedBranchId),
    [enclosures, selectedBranchId]
  )

  const filtered = useMemo(() => {
    return branchEnclosures.filter((e) => {
      if (filter !== 'all' && e.type !== filter) return false
      if (query && !`${e.name} ${e.speciesNote}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [branchEnclosures, filter, query])

  const totals = useMemo(() => {
    const head = branchEnclosures.reduce((sum, enclosure) => sum + enclosure.occupied, 0)
    const cap = branchEnclosures.reduce((sum, enclosure) => sum + enclosure.capacity, 0)
    const atRisk = branchEnclosures.filter((enclosure) => enclosure.health !== 'healthy').length
    return { head, cap, atRisk }
  }, [branchEnclosures])

  const saveEnclosure = async (updated) => {
    const result = await updateEnclosure(updated.id, updated, farm.id)
    if (result.error) {
      setError(result.error)
      return
    }
    setEnclosures((current) => current.map((item) => item.id === updated.id ? result.data : item))
    setSelectedEnclosure(null)
  }

  const removeEnclosure = async (id) => {
    const result = await deleteEnclosure(id, farm.id)
    if (result.error) {
      setError(result.error)
      return
    }
    setEnclosures((current) => current.filter((item) => item.id !== id))
    setSelectedEnclosure(null)
  }

  return (
    <motion.div className="space-y-5 p-4 sm:p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900">Animals & Habitats</h1>
          <p className="mt-1 text-[13px] text-slate-soft">
            Enclosures, occupancy, and per-species management across the farm.
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-forest-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-forest-700 hover:shadow-md"
        >
          <Plus size={16} /> New enclosure
        </button>
      </div>

      {/* ── Aggregate stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Boxes} label="Enclosures" value={branchEnclosures.length} sub="active" color="var(--color-forest-500)" />
        <Stat icon={Users} label="Head count" value={totals.head.toLocaleString()} sub={`/ ${totals.cap.toLocaleString()}`} color="var(--color-info-500)" />
        <Stat icon={TrendingUp} label="Utilization" value={`${Math.round((totals.head / Math.max(totals.cap,1)) * 100)}%`} color="var(--color-forest-500)" />
        <Stat icon={AlertTriangle} label="Needs attention" value={totals.atRisk} sub={totals.atRisk ? 'enclosures' : 'all clear'} color={totals.atRisk ? 'var(--color-alert-500)' : 'var(--color-forest-500)'} />
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-cream-200 bg-white p-1">
          {[{ id: 'all', label: 'All', icon: LayoutGrid },
            ...ENCLOSURE_TYPES.map((t) => ({ id: t.id, label: `${t.label}s`, icon: t.icon }))].map((f) => {
            const Icon = f.icon
            const active = filter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all"
                style={{
                  background: active ? 'var(--color-forest-600)' : 'transparent',
                  color: active ? '#fff' : 'var(--color-slate-mid)',
                }}
              >
                <Icon size={13} /> {f.label}
              </button>
            )
          })}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search enclosures, species, breeds…"
            className="w-full rounded-xl border border-cream-200 bg-white py-2 pl-9 pr-3 text-[13px] outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
          />
        </div>

        <div className="flex rounded-xl border border-cream-200 bg-white p-1">
          <button
            onClick={() => setView('grid')}
            className={`rounded-lg p-1.5 ${view === 'grid' ? 'bg-forest-50 text-forest-700' : 'text-slate-soft'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded-lg p-1.5 ${view === 'list' ? 'bg-forest-50 text-forest-700' : 'text-slate-soft'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────── */}
      {loading ? (
        <div className="rounded-2xl border border-cream-200 bg-white"><SproutLoader label={t('common.loading')} /></div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-200 bg-white p-12 text-center">
          <Warehouse size={28} className="mx-auto text-slate-soft" />
          <p className="mt-3 text-[14px] font-semibold text-slate-ink">No enclosures match</p>
          <p className="mt-1 text-[12px] text-slate-soft">Adjust filters or create a new enclosure.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((enc, index) => (
            <motion.div key={enc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: Math.min(index * 0.045, 0.2) }}>
              <EnclosureCard enc={enc} branchName={branches.find((branch) => branch.id === enc.branchId)?.name} onOpen={setSelectedEnclosure} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EnclosureTable rows={filtered} branches={branches} onOpen={setSelectedEnclosure} />
      )}

      <CreateEnclosureModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        branches={branches}
        selectedBranchId={selectedBranchId}
        onCreate={async (enclosure) => {
          const result = await createEnclosure({ ...enclosure, farmId: farm.id })
          if (result.error) {
            setError(result.error)
            return
          }
          setEnclosures((current) => [result.data, ...current])
          setOpenCreate(false)
        }}
      />
      <AnimatePresence>
        {selectedEnclosure && (
          <ManageEnclosureModal
            key={selectedEnclosure.id}
            enclosure={selectedEnclosure}
            branches={branches}
            onClose={() => setSelectedEnclosure(null)}
            onSave={saveEnclosure}
            onDelete={removeEnclosure}
            onAddAnimal={() => {
              setAnimalEnclosure(selectedEnclosure)
              setSelectedEnclosure(null)
            }}
          />
        )}
      </AnimatePresence>
      <AddAnimalModal
        open={Boolean(animalEnclosure)}
        onOpenChange={(open) => {
          if (!open) setAnimalEnclosure(null)
        }}
        enclosure={animalEnclosure}
        onSaved={() => {
          listEnclosures({ farmId: farm.id }).then(({ data }) => {
            if (data) setEnclosures(data)
          })
        }}
      />
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────
   List/table view
──────────────────────────────────────────────────────────── */
function EnclosureTable({ rows, branches, onOpen }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-white">
      <table className="w-full min-w-[940px] text-left text-[13px]">
        <thead className="bg-cream-50 text-[10px] uppercase tracking-wider text-slate-soft">
          <tr>
            <th className="px-4 py-3 font-semibold">Enclosure</th>
            <th className="px-4 py-3 font-semibold">Branch</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Species</th>
            <th className="px-4 py-3 font-semibold">Occupancy</th>
            <th className="px-4 py-3 font-semibold">Health</th>
            <th className="px-4 py-3 font-semibold">Size</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const type = ENCLOSURE_TYPES.find((t) => t.id === e.type)
            const species = SPECIES.find((s) => s.id === e.speciesId)
            const health = HEALTH_STATES.find((h) => h.id === e.health)
            const TypeIcon = type.icon
            return (
              <tr key={e.id} className="border-t border-cream-200 transition-colors hover:bg-cream-50">
                <td className="px-4 py-3 font-semibold text-slate-ink">{e.name}</td>
                <td className="px-4 py-3 text-slate-mid">{branches.find((branch) => branch.id === e.branchId)?.name || '—'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: type.accent }}>
                    <TypeIcon size={13} /> {type.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-mid">
                  {species?.label} <span className="text-slate-soft">· {e.speciesNote}</span>
                </td>
                <td className="w-48 px-4 py-3">
                  <OccupancyBar occupied={e.occupied} capacity={e.capacity} />
                </td>
                <td className="px-4 py-3">
                  <Chip color={health.color} soft>{health.label}</Chip>
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-mid">
                  {e.size} {type.sizeUnit}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onOpen(e)} aria-label={`Manage ${e.name}`} className="rounded-md p-1.5 text-slate-soft transition hover:bg-cream-100 hover:text-forest-700">
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}