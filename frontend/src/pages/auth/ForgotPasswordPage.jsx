import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/services/authService'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const schema = z.object({
    contact: z.string().regex(/^01[3-9]\d{8}$/, t('errors.mobile')),
  })
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ contact }) => {
    setSubmitting(true)
    setServerError('')
    const { error } = await requestPasswordReset(contact)
    setSubmitting(false)
    if (error) {
      setServerError(error)
      return
    }
    setSent(true)
  }

  return (
    <AuthLayout title={t('authExtra.forgot.title')} subtitle={t('authExtra.forgot.subtitle')} side="welcome">
      {sent ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-sage border border-fresh/40 text-forest-800 text-sm px-3 py-3">
            {t('authExtra.forgot.sent')}
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">{t('authExtra.forgot.back')}</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {serverError && (
            <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {serverError}
            </div>
          )}
          <div>
            <Label>{t('auth.login.contact')}</Label>
            <Input {...register('contact')} className="mt-1.5" inputMode="tel" placeholder="01712345678" />
            {errors.contact && <p className="mt-1 text-xs text-red-600">{errors.contact.message}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? t('common.loading') : t('authExtra.forgot.submit')}
          </Button>
          <p className="text-sm text-center text-forest-700/80">
            <Link to="/login" className="text-fresh-600 underline">{t('authExtra.forgot.back')}</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}