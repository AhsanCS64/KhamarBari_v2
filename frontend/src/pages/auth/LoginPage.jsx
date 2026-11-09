import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, ShieldCheck, Mail, Lock, Phone } from 'lucide-react'
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

  const { register, handleSubmit, formState: { errors } } = useForm({
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

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your farm operations." side="welcome">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {justRegistered && (
          <div className="flex items-center gap-2 rounded-xl bg-fresh-50 border border-fresh-200 text-fresh-800 text-sm px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-fresh-600 shrink-0" />
            <p>Account created successfully. Please log in.</p>
          </div>
        )}

        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {serverError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label className="text-forest-900 font-semibold">Contact Number</Label>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-forest-400" />
              </div>
              <Input 
                {...register('contact')} 
                className="pl-10 h-11 bg-forest-50/30 focus:bg-white transition-colors" 
                inputMode="tel" 
                placeholder="01712345678" 
                autoComplete="username" 
              />
            </div>
            {errors.contact && <p className="mt-1.5 text-xs text-red-600">{errors.contact.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-forest-900 font-semibold">Password</Label>
              <Link to="/forgot-password" className="text-xs font-medium text-forest-600 hover:text-forest-800 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-forest-400" />
              </div>
              <Input
                type={showPw ? 'text' : 'password'}
                {...register('password')}
                className="pl-10 pr-10 h-11 bg-forest-50/30 focus:bg-white transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-forest-400 hover:text-forest-700 transition-colors rounded-lg hover:bg-forest-50"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-forest-600/20" disabled={submitting}>
          {submitting ? 'Authenticating...' : 'Log in'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-forest-100" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-forest-500">New to Khamar?</span></div>
        </div>

        <Button type="button" variant="outline" className="w-full h-11 bg-transparent border-forest-200 text-forest-800 hover:bg-forest-50" asChild>
          <Link to="/signup">Create a farm account</Link>
        </Button>
      </form>
    </AuthLayout>
  )
}