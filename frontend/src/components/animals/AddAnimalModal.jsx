import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { createAnimal } from '@/services/animalsService'
import { useAuthStore } from '@/store/authStore'

export default function AddAnimalModal({ open, onOpenChange, enclosure, onSaved }) {
  const farm = useAuthStore((s) => s.farm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tag: '', species: 'cow', breed: '', gender: 'female', health: 'healthy',
    dob: '', purchaseDate: '', purchasePrice: '', weight: '', source: '', notes: '', count: 1
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!Number.isInteger(Number(form.count)) || Number(form.count) < 1 || Number(form.count) > 100) {
      setError('Add between 1 and 100 animals at a time.')
      return
    }
    setSubmitting(true)
    setError('')

    // We loop to create multiple animals at once
    for (let i = 0; i < Number(form.count); i++) {
      const uniqueTag = `${form.tag}-${i + 1}`
      const { error } = await createAnimal({
        tag: uniqueTag,
        species: form.species,
        breed: form.breed,
        gender: form.gender,
        health: form.health,
        source: form.source,
        notes: form.notes,
        weight: form.weight === '' ? undefined : Number(form.weight),
        purchasePrice: form.purchasePrice === '' ? undefined : Number(form.purchasePrice),
        dob: form.dob || undefined,
        purchaseDate: form.purchaseDate || undefined,
        enclosureId: enclosure.id,
        branchId: enclosure.branchId,
        farmId: farm.id || farm._id,
      })
      if (error) {
        setError(error)
        setSubmitting(false)
        onSaved?.()
        return
      }
    }

    setSubmitting(false)
    onOpenChange(false)
    onSaved?.()
  }

  if (!enclosure) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Animals to {enclosure.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <div>
            <Label>Species</Label>
            <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cow">Cow</SelectItem>
                <SelectItem value="goat">Goat</SelectItem>
                <SelectItem value="sheep">Sheep</SelectItem>
                <SelectItem value="chicken">Chicken</SelectItem>
                <SelectItem value="duck">Duck</SelectItem>
                <SelectItem value="fish">Fish</SelectItem>
                <SelectItem value="shrimp">Shrimp</SelectItem>
                <SelectItem value="rabbit">Rabbit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>How many?</Label>
              <Input type="number" min="1" max="100" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>GENDER</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>ID Tag (e.g. C-100)</Label>
            <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} className="mt-1.5" required />
          </div>

          <div>
            <Label>Breed / Variety</Label>
            <Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} className="mt-1.5" />
          </div>

          <div>
            <Label>Average Weight (kg)</Label>
            <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="mt-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Purchase Date</Label>
              <Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className="mt-1.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Purchase Price (৳)</Label>
              <Input type="number" min="0" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Health</Label>
              <Select value={form.health} onValueChange={(v) => setForm({ ...form, health: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="watch">Needs observation</SelectItem>
                  <SelectItem value="treatment">Under treatment</SelectItem>
                  <SelectItem value="quarantine">Quarantine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Source / Notes</Label>
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Farm-bred, purchased, donated…" className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Animals'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}