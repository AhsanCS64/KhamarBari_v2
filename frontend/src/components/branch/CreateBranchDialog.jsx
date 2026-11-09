import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { createBranch } from '@/services/branchService'
import { useState } from 'react'

export default function CreateBranchDialog({ open, onOpenChange, onCreated }) {
  const { t } = useTranslation()
  const farm = useAuthStore((s) => s.farm)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    name: z.string().min(2, t('errors.required')),
    location: z.string().min(2, t('errors.required')),
    managerName: z.string().min(2, t('errors.required')),
    managerContact: z.string().regex(/^01[3-9]\d{8}$/, t('errors.mobile')),
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const { data, error } = await createBranch(farm.id, values)
    setSubmitting(false)
    if (error) { setServerError(error); return }
    reset()
    onOpenChange(false)
    onCreated?.(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('branch.new')}</DialogTitle>
          <DialogDescription>{t('branch.newDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {serverError}
            </div>
          )}

          <div>
            <Label>{t('branch.name')}</Label>
            <Input {...register('name')} className="mt-1.5" placeholder="North Branch" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label>{t('branch.location')}</Label>
            <Input {...register('location')} className="mt-1.5" placeholder="Rangpur Sadar, Rangpur" />
            {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('branch.managerName')}</Label>
              <Input {...register('managerName')} className="mt-1.5" />
              {errors.managerName && <p className="mt-1 text-xs text-red-600">{errors.managerName.message}</p>}
            </div>
            <div>
              <Label>{t('branch.managerContact')}</Label>
              <Input {...register('managerContact')} className="mt-1.5" inputMode="tel" placeholder="01812345678" />
              {errors.managerContact && <p className="mt-1 text-xs text-red-600">{errors.managerContact.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('common.loading') : t('branch.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}