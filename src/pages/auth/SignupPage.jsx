import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Upload, X } from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { buildSignupSchema } from '@/lib/validators/authSchemas'
import { DIVISIONS, getDistricts, getUpazilas } from '@/lib/bd-geo'
import { useAuthStore } from '@/store/authStore'

export default function SignupPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const register_ = useAuthStore((s) => s.register)
  const schema = useMemo(() => buildSignupSchema(t), [i18n.language])

  const [logoDataUrl, setLogoDataUrl] = useState(null)
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      farmName: '', license: '', division: '', district: '', zilla: '', upazila: '',
      address: '', ownerName: '', nid: '', email: '', contact: '', password: '', confirm: '',
      terms: false,
    },
    mode: 'onBlur',
  })

  const division = watch('division')
  const district = watch('district')

  // reset dependents when parent changes
  useEffect(() => { setValue('district', ''); setValue('zilla', ''); setValue('upazila', '') }, [division])
  useEffect(() => { setValue('zilla', district); setValue('upazila', '') }, [district])

  const districts = getDistricts(division)
  const upazilas = getUpazilas(division, district)

  const onLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) {
      setServerError('Logo must be under 1 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setLogoDataUrl(reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (values) => {
    setSubmitting(true)
    setServerError('')
    const { error } = await register_({ ...values, logo: logoDataUrl })
    setSubmitting(false)
    if (error) {
      setServerError(error)
      return
    }
    navigate('/login?registered=1')
  }

  return (
    <AuthLayout title={t('auth.signup.title')} subtitle={t('auth.signup.subtitle')} side="illustration">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {serverError}
          </div>
        )}

        {/* Logo */}
        <div>
          <Label>{t('authExtra.logoUpload')}</Label>
          <p className="text-xs text-forest-700/60 mt-1">{t('authExtra.logoHint')}</p>
          <div className="mt-2 flex items-center gap-3">
            {logoDataUrl ? (
              <div className="relative h-16 w-16 rounded-xl border border-forest-100 overflow-hidden bg-sage">
                <img src={logoDataUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setLogoDataUrl(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-forest-100 shadow flex items-center justify-center text-forest-700"
                  aria-label={t('authExtra.removeLogo')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-16 w-16 rounded-xl border-2 border-dashed border-forest-100 bg-sage/40 flex items-center justify-center text-forest-700 hover:bg-sage"
              >
                <Upload className="h-5 w-5" />
              </button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              {t('authExtra.chooseFile')}
            </Button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onLogoChange} />
          </div>
        </div>

        <Field label={t('auth.signup.farmName')} error={errors.farmName?.message}>
          <Input {...register('farmName')} placeholder="Green Valley Farm" />
        </Field>

        <Field label={t('auth.signup.license')} error={errors.license?.message}>
          <Input {...register('license')} placeholder="BD-FARM-2024-00123" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t('auth.signup.division')} error={errors.division?.message}>
            <Select value={division} onValueChange={(v) => setValue('division', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {DIVISIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('auth.signup.district')} error={errors.district?.message}>
            <Select value={district} onValueChange={(v) => setValue('district', v, { shouldValidate: true })} disabled={!division}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t('auth.signup.zilla')} error={errors.zilla?.message}>
            <Input {...register('zilla')} placeholder={district || ''} />
          </Field>

          <Field label={t('auth.signup.upazila')} error={errors.upazila?.message}>
            <Select value={watch('upazila')} onValueChange={(v) => setValue('upazila', v, { shouldValidate: true })} disabled={!district}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {upazilas.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label={t('auth.signup.address')} error={errors.address?.message}>
          <Textarea rows={2} {...register('address')} placeholder="House 12, Road 5, Dhanmondi, Dhaka" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t('auth.signup.ownerName')} error={errors.ownerName?.message}>
            <Input {...register('ownerName')} />
          </Field>
          <Field label={t('auth.signup.nid')} error={errors.nid?.message}>
            <Input {...register('nid')} inputMode="numeric" placeholder="1234567890123" />
          </Field>
          <Field label={t('auth.signup.email')} error={errors.email?.message}>
            <Input type="email" {...register('email')} placeholder="you@example.com" />
          </Field>
          <Field label={t('auth.signup.contact')} error={errors.contact?.message}>
            <Input {...register('contact')} inputMode="tel" placeholder="01712345678" />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t('auth.signup.password')} error={errors.password?.message}>
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} {...register('password')} />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-forest-700/70" aria-label="toggle">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label={t('auth.signup.confirm')} error={errors.confirm?.message}>
            <div className="relative">
              <Input type={showConfirm ? 'text' : 'password'} {...register('confirm')} />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-forest-700/70" aria-label="toggle">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-forest-800 cursor-pointer">
            <Checkbox onCheckedChange={(v) => setValue('terms', v === true, { shouldValidate: true })} />
            <span>{t('auth.signup.terms')}</span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-red-600">{errors.terms.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? t('common.loading') : t('auth.signup.submit')}
        </Button>

        <p className="text-sm text-center text-forest-700/80">
          {t('auth.signup.haveAccount')}{' '}
          <Link to="/login" className="text-fresh-600 underline">{t('auth.signup.loginLink')}</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}