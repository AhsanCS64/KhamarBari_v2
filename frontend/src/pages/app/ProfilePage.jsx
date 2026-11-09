import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  User, Camera, Upload, Trash2, Check, AlertTriangle, ShieldCheck,
  Building2, KeyRound, Sparkles, MapPin, Phone, Mail, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/authStore'
import { changePassword } from '@/services/profileService'

const PRESET_AVATARS = [
  { id: 'farmer-1', label: 'Farmer Pro', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80' },
  { id: 'farmer-2', label: 'Agro Pioneer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80' },
  { id: 'farmer-3', label: 'Green Steward', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80' },
  { id: 'farmer-4', label: 'Modern Grower', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80' },
  { id: 'sprout-mascot', label: 'Sprout Mascot', url: '/sprout.svg' },
]

export default function ProfilePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const farm = useAuthStore((s) => s.farm)
  const updateProfile = useAuthStore((s) => s.updateProfile)

  // Profile Form state
  const [name, setName] = useState(user?.name || '')
  const [contact, setContact] = useState(user?.contact || '')
  const [email, setEmail] = useState(user?.email || '')
  const [roleTitle, setRoleTitle] = useState(user?.roleTitle || 'Founder & Farm Operator')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  // UI state
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const fileInputRef = useRef(null)

  // Handle local image file upload & conversion to base64
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileError('Please upload a valid image file (PNG, JPG, WebP).')
      return
    }

    if (file.size > 1024 * 1024) {
      setProfileError('Image size is too large. Please choose an image under 1 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(reader.result)
      setProfileError('')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSuccess('')
    setProfileError('')

    const patch = {
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim() || null,
      roleTitle: roleTitle.trim() || null,
      bio: bio.trim() || null,
      avatar: avatar || null,
    }

    const { error } = await updateProfile(patch)
    setSavingProfile(false)

    if (error) {
      setProfileError(error)
    } else {
      setProfileSuccess('Profile details and photo updated successfully!')
      setTimeout(() => setProfileSuccess(''), 4000)
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    setPasswordSuccess('')
    setPasswordError('')

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.')
      return
    }

    setSavingPassword(true)
    const { error } = await changePassword(user?.id, { currentPassword, newPassword })
    setSavingPassword(false)

    if (error) {
      setPasswordError(error)
    } else {
      setPasswordSuccess('Password changed securely!')
      setNewPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
      setTimeout(() => setPasswordSuccess(''), 4000)
    }
  }

  const initials = (name || user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">Account & Identity</p>
          <h1 className="mt-1 text-2xl font-bold text-forest-900">{t('profile.title', 'Farmer Profile')}</h1>
          <p className="mt-1 text-sm text-forest-700/70">
            Manage your personal profile photo, farmer identity, login credentials, and farm affiliations.
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link to="/dashboard/settings" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Farm Settings</span>
          </Link>
        </Button>
      </header>

      {/* Grid: Profile Photo & Form */}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Column: Photo & Farm Card */}
        <div className="space-y-5">
          {/* Avatar Studio Card */}
          <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft text-center">
            <h2 className="text-sm font-bold text-forest-900 mb-4 text-left flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-700" />
              <span>Profile Photo</span>
            </h2>

            {/* Profile Avatar Canvas */}
            <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-emerald-50 shadow-md overflow-hidden bg-forest-900 group">
              {avatar ? (
                <img src={avatar} alt={name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest-700 to-forest-950 text-white text-3xl font-black">
                  {initials}
                </div>
              )}

              {/* Hover overlay button to trigger file picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs text-xs font-semibold"
                aria-label="Upload photo"
              >
                <Camera className="h-6 w-6 mb-1" />
                <span>Change</span>
              </button>
            </div>

            {/* User display beneath avatar */}
            <p className="mt-3 text-base font-bold text-forest-900">{name || 'Your Name'}</p>
            <p className="text-xs text-forest-700/70 font-medium capitalize">{roleTitle || user?.role}</p>

            {/* Upload & Remove Controls */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="mt-4 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Custom Image</span>
              </Button>

              {avatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-red-600 hover:bg-red-50 hover:text-red-700 text-xs"
                  onClick={() => setAvatar('')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Photo</span>
                </Button>
              )}
            </div>

            {/* Preset Avatars for 1-click selection */}
            <div className="mt-5 pt-4 border-t border-forest-50 text-left">
              <p className="text-[11px] font-semibold text-forest-700/75 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Quick Preset Avatars</span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAvatar(p.url)}
                    title={p.label}
                    className={`h-10 w-10 rounded-full border-2 p-0.5 overflow-hidden transition-all hover:scale-110 cursor-pointer ${
                      avatar === p.url ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-forest-100 hover:border-emerald-400'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover rounded-full" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Farm Affiliation Card */}
          <section className="rounded-2xl border border-forest-100 bg-forest-50/40 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-700 text-white font-bold">
                {farm?.logo ? (
                  <img src={farm.logo} alt="" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-bold text-forest-700/60">Registered Farm</p>
                <p className="text-sm font-bold text-forest-950 truncate">{farm?.name || 'KhamarBari Farm'}</p>
                <p className="text-xs text-forest-700/70 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{farm?.district || farm?.division || 'Bangladesh'}</span>
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-forest-100/60 flex items-center justify-between text-xs text-forest-700/70">
              <span>Trade Lic: {farm?.license || 'AGR-2024'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Active</span>
            </div>
          </section>
        </div>

        {/* Right Column: Personal Details & Password Forms */}
        <div className="space-y-6">
          {/* Personal Information Form */}
          <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft">
            <div className="border-b border-forest-50 pb-4 mb-4">
              <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-700" />
                <span>Personal Information</span>
              </h2>
              <p className="mt-0.5 text-xs text-forest-700/70">
                Your name, professional title, login phone number, and background story.
              </p>
            </div>

            {profileSuccess && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmerName">Full Name</Label>
                  <Input
                    id="farmerName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Md. Ahsan Habib"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="roleTitle">Professional Role / Title</Label>
                  <Input
                    id="roleTitle"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Managing Director & Dairy Specialist"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactNumber" className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-forest-600" />
                    <span>Contact / Login Phone</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    placeholder="e.g. 01700000000"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="emailAddress" className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-forest-600" />
                    <span>Email Address (Optional)</span>
                  </Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. farmer@khamarbari.com"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="farmerBio">Farmer Bio / Background</Label>
                <Textarea
                  id="farmerBio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share details about your farming journey, vision, breed expertise, or agricultural credentials..."
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingProfile ? t('common.loading', 'Saving...') : 'Save Profile Changes'}</span>
                </Button>
              </div>
            </form>
          </section>

          {/* Change Password Card */}
          <section id="password" className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft">
            <div className="border-b border-forest-50 pb-4 mb-4">
              <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-emerald-700" />
                <span>Change Password</span>
              </h2>
              <p className="mt-0.5 text-xs text-forest-700/70">
                Update your account password to protect access to farm financials and livestock records.
              </p>
            </div>

            {passwordSuccess && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="mt-1.5"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={savingPassword || !currentPassword || !newPassword}
                  variant="outline"
                  className="font-semibold"
                >
                  {savingPassword ? t('common.loading', 'Updating...') : 'Update Password'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
