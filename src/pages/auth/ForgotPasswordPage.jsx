import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  KeyRound, ShieldCheck, Phone, CheckCircle2, AlertTriangle,
  ArrowRight, Eye, EyeOff, RotateCcw, Sparkles, MessageSquare
} from 'lucide-react'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset, verifyResetOtp, resetPasswordWithOtp } from '@/services/authService'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Steps: 1: 'phone' | 2: 'otp' | 3: 'password' | 4: 'success'
  const [step, setStep] = useState(1)

  const [contact, setContact] = useState('')
  const [otp, setOtp] = useState('')
  const [simulatedOtp, setSimulatedOtp] = useState('')
  const [userName, setUserName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(30)

  // Countdown timer for resending OTP
  useEffect(() => {
    if (step !== 2 || resendCountdown <= 0) return
    const timer = setInterval(() => setResendCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [step, resendCountdown])

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')

    const cleanContact = contact.trim()
    if (!/^01[3-9]\d{8}$/.test(cleanContact)) {
      setError('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).')
      return
    }

    setLoading(true)
    const { data, error: reqError } = await requestPasswordReset(cleanContact)
    setLoading(false)

    if (reqError) {
      setError(reqError)
      return
    }

    setSimulatedOtp(data.simulatedOtp)
    setUserName(data.userName || '')
    setStep(2)
    setResendCountdown(30)
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    const { error: vError } = await verifyResetOtp({ contact: contact.trim(), otp: otp.trim() })
    setLoading(false)

    if (vError) {
      setError(vError)
      return
    }

    setStep(3)
  }

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    setLoading(true)
    const { error: rError } = await resetPasswordWithOtp({
      contact: contact.trim(),
      otp: otp.trim(),
      newPassword,
    })
    setLoading(false)

    if (rError) {
      setError(rError)
      return
    }

    setStep(4)
  }

  const fillDemoPhone = () => {
    setContact('01700000000')
    setError('')
  }

  const autoFillOtp = () => {
    if (simulatedOtp) {
      setOtp(simulatedOtp)
      setError('')
    }
  }

  return (
    <AuthLayout
      title={step === 4 ? 'Password Updated!' : 'Reset Password'}
      subtitle={
        step === 1
          ? 'Enter your registered mobile number to receive a verification code.'
          : step === 2
          ? `Enter the 6-digit verification code sent to ${contact}.`
          : step === 3
          ? 'Create a secure new password for your farm account.'
          : 'Your account is ready. You can now sign in.'
      }
      side="welcome"
    >
      {/* Error Banner */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Indicator */}
      {step < 4 && (
        <div className="mb-6 flex items-center justify-between text-xs font-semibold text-forest-700/60">
          <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-emerald-700 font-bold' : ''}`}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-800 text-[10px]">1</span>
            <span>Mobile</span>
          </span>
          <span className="h-0.5 flex-1 mx-2 bg-forest-100" />
          <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-emerald-700 font-bold' : ''}`}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-800 text-[10px]">2</span>
            <span>Verify OTP</span>
          </span>
          <span className="h-0.5 flex-1 mx-2 bg-forest-100" />
          <span className={`flex items-center gap-1.5 ${step >= 3 ? 'text-emerald-700 font-bold' : ''}`}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-800 text-[10px]">3</span>
            <span>New Password</span>
          </span>
        </div>
      )}

      {/* STEP 1: Phone Input */}
      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="resetContact" className="flex items-center justify-between">
              <span>{t('auth.login.contact', 'Mobile Number')}</span>
              <button
                type="button"
                onClick={fillDemoPhone}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Fill Demo (01700000000)</span>
              </button>
            </Label>
            <Input
              id="resetContact"
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="01712345678"
              className="mt-1.5 text-base"
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" size="lg" disabled={loading}>
            {loading ? t('common.loading', 'Checking...') : 'Send Verification Code'}
          </Button>

          <p className="text-xs text-center text-forest-700/80 pt-2">
            Remember your password?{' '}
            <Link to="/login" className="text-emerald-700 font-bold hover:underline">
              Back to Sign in
            </Link>
          </p>
        </form>
      )}

      {/* STEP 2: Enter OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
          {/* Simulated SMS Notification Banner for Demo / Vercel */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between font-bold text-amber-900">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-amber-700" />
                <span>Simulated SMS Gateway (Localhost / Vercel)</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 uppercase">Live Demo</span>
            </div>
            <p className="text-amber-900">
              KhamarBari OTP for <strong>{contact}</strong>: <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-amber-300">{simulatedOtp}</span>
            </p>
            <div className="pt-1 flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={autoFillOtp}
                className="h-7 text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
              >
                Auto-fill Code
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="otpInput">Enter 6-Digit Verification Code</Label>
            <Input
              id="otpInput"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="mt-1.5 text-center text-2xl tracking-[0.35em] font-mono font-bold"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs text-forest-700/80">
            <button
              type="button"
              onClick={() => { setStep(1); setOtp('') }}
              className="hover:underline text-forest-700"
            >
              Change phone number
            </button>

            {resendCountdown > 0 ? (
              <span className="text-forest-600 font-mono">Resend code in {resendCountdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleRequestOtp}
                className="text-emerald-700 font-bold hover:underline"
              >
                Resend Code
              </button>
            )}
          </div>

          <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" size="lg" disabled={loading}>
            {loading ? t('common.loading', 'Verifying...') : 'Verify & Continue'}
          </Button>
        </form>
      )}

      {/* STEP 3: Set New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="resetNewPassword">New Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="resetNewPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-forest-700/70"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="resetConfirmPassword">Confirm New Password</Label>
            <Input
              id="resetConfirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="mt-1.5"
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800" size="lg" disabled={loading}>
            {loading ? t('common.loading', 'Saving...') : 'Reset Password & Save'}
          </Button>
        </form>
      )}

      {/* STEP 4: Success */}
      {step === 4 && (
        <div className="text-center space-y-4 py-2">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-forest-950">Password Successfully Changed!</h3>
            <p className="mt-1 text-xs text-forest-700/75 leading-relaxed">
              Your password for <strong>{contact}</strong> has been updated securely. You can now log into your farm dashboard.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold"
            onClick={() => navigate('/login')}
          >
            <span>Proceed to Login</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </AuthLayout>
  )
}
