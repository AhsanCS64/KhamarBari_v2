import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildLoginSchema } from '@/lib/validators/authSchemas'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const schema = useMemo(() => buildLoginSchema(t), [i18n.language])

  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { contact: '', password: '' },
  })

  useEffect(() => {
    if (params.get('registered')) setJustRegistered(true)
  }, [params])

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const { error } = await login(values)
    setSubmitting(false)
    if (error) {
      setServerError(error)
      return
    }
    const next = params.get('next') || '/dashboard'
    navigate(next, { replace: true })
  }

  const fillDemo = () => {
    setValue('contact', '01700000000', { shouldValidate: true })
    setValue('password', 'demo1234', { shouldValidate: true })
  }

  const copyDemo = async () => {
    try {
      await navigator.clipboard.writeText('01700000000 / demo1234')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} side="welcome">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {justRegistered && (
          <div className="rounded-xl bg-sage border border-fresh/40 text-forest-800 text-sm px-3 py-2">
            {t('authExtra.signupSuccess')}
          </div>
        )}

        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {serverError}
          </div>
        )}

        <div>
          <Label>{t('auth.login.contact')}</Label>
          <Input {...register('contact')} className="mt-1.5" inputMode="tel" placeholder="01712345678" autoComplete="username" />
          {errors.contact && <p className="mt-1 text-xs text-red-600">{errors.contact.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>{t('auth.login.password')}</Label>
            <Link to="/forgot-password" className="text-xs text-fresh-600 underline">
              {t('auth.login.forgot')}
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Input
              type={showPw ? 'text' : 'password'}
              {...register('password')}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-forest-700/70"
              aria-label={showPw ? t('authExtra.hidePassword') : t('authExtra.showPassword')}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="login-submit w-full" size="lg" disabled={submitting}>
          {submitting ? t('common.loading') : t('auth.login.submit')}
        </Button>

        {/* Demo credentials card */}
        <div className="login-demo-panel rounded-2xl border p-4 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-forest-800">{t('authExtra.demoCredentials')}</span>
            <button
              type="button"
              onClick={copyDemo}
              className="inline-flex items-center gap-1 text-forest-700 hover:text-forest-900"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? t('authExtra.copied') : t('authExtra.copy')}
            </button>
          </div>
          <p className="text-forest-700/80 font-mono">01700000000 / demo1234</p>
          <p className="mt-1 text-forest-700/60">{t('authExtra.demoNote')}</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={fillDemo}>
            Auto-fill demo
          </Button>
        </div>

        <p className="text-sm text-center text-forest-700/80">
          {t('auth.login.noAccount')}{' '}
          <Link to="/signup" className="text-fresh-600 underline">{t('auth.login.signupLink')}</Link>
        </p>
      </form>
    </AuthLayout>
  )
}