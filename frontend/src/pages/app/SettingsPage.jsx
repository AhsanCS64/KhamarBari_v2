import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import {
  BellRing, Download, Globe, Languages, RotateCcw, Sun,
  Building2, Camera, Upload, Trash2, Check, AlertTriangle,
  User, ShieldCheck, MapPin, Sparkles, Phone, Mail, Award,
  Save, Sliders, ExternalLink, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'
import { storage } from '@/services/storage'

const PRESET_USER_AVATARS = [
  { id: 'u1', label: 'Farmer Pro', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80' },
  { id: 'u2', label: 'Agro Pioneer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80' },
  { id: 'u3', label: 'Green Steward', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80' },
  { id: 'u4', label: 'Modern Grower', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80' },
  { id: 'u5', label: 'Sprout Mascot', url: '/sprout.svg' },
]

const PRESET_FARM_LOGOS = [
  { id: 'fl1', label: 'Fresh Sprout', url: '/sprout.svg' },
  { id: 'fl2', label: 'Dairy Crest', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=240&auto=format&fit=crop&q=80' },
  { id: 'fl3', label: 'Golden Harvest', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=240&auto=format&fit=crop&q=80' },
  { id: 'fl4', label: 'Pasture Barn', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=240&auto=format&fit=crop&q=80' },
]

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  const user = useAuthStore((state) => state.user)
  const farm = useAuthStore((state) => state.farm)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const updateFarm = useAuthStore((state) => state.updateFarm)

  const dateRange = useAppStore((state) => state.dateRange)
  const setDateRange = useAppStore((state) => state.setDateRange)
  const setLang = useUIStore((state) => state.setLang)

  const [activeTab, setActiveTab] = useState('farm') // 'farm' | 'profile' | 'preferences'

  // Sync hash if passed
  useEffect(() => {
    if (location.hash === '#profile') setActiveTab('profile')
    if (location.hash === '#preferences') setActiveTab('preferences')
  }, [location.hash])

  // --- Farm Form State ---
  const [farmName, setFarmName] = useState(farm?.name || '')
  const [farmTagline, setFarmTagline] = useState(farm?.tagline || 'Modern Livestock & Sustainable Agro')
  const [farmLogo, setFarmLogo] = useState(farm?.logo || '')
  const [farmLicense, setFarmLicense] = useState(farm?.license || '')
  const [farmAddress, setFarmAddress] = useState(farm?.address || '')
  const [farmDistrict, setFarmDistrict] = useState(farm?.district || '')
  const [farmDivision, setFarmDivision] = useState(farm?.division || '')
  const [farmUpazila, setFarmUpazila] = useState(farm?.upazila || '')
  const [farmType, setFarmType] = useState(farm?.farmType || 'Integrated Mixed Farm')
  const [farmContact, setFarmContact] = useState(farm?.contact || '')
  const [farmEmail, setFarmEmail] = useState(farm?.email || '')
  const [savingFarm, setSavingFarm] = useState(false)
  const [farmSuccess, setFarmSuccess] = useState('')
  const [farmError, setFarmError] = useState('')

  // --- Profile Form State ---
  const [userName, setUserName] = useState(user?.name || '')
  const [userContact, setUserContact] = useState(user?.contact || '')
  const [userEmail, setUserEmail] = useState(user?.email || '')
  const [userAvatar, setUserAvatar] = useState(user?.avatar || '')
  const [userRoleTitle, setUserRoleTitle] = useState(user?.roleTitle || 'Founder & Farm Owner')
  const [userBio, setUserBio] = useState(user?.bio || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // --- Preferences State ---
  const preferences = storage.get('preferences', {}) || {}
  const [showAlerts, setShowAlerts] = useState(preferences.showDashboardAlerts !== false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  const farmLogoInputRef = useRef(null)
  const userAvatarInputRef = useRef(null)

  // File upload handlers (convert to base64)
  const handleFarmLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFarmError('Please upload a valid image file.')
      return
    }
    if (file.size > 1024 * 1024) {
      setFarmError('Please choose an image smaller than 1 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setFarmLogo(reader.result)
      setFarmError('')
    }
    reader.readAsDataURL(file)
  }

  const handleUserAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setProfileError('Please upload a valid image file.')
      return
    }
    if (file.size > 1024 * 1024) {
      setProfileError('Please choose an image smaller than 1 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setUserAvatar(reader.result)
      setProfileError('')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveFarm = async (e) => {
    e.preventDefault()
    setSavingFarm(true)
    setFarmSuccess('')
    setFarmError('')

    const patch = {
      name: farmName.trim(),
      tagline: farmTagline.trim(),
      logo: farmLogo || null,
      license: farmLicense.trim(),
      address: farmAddress.trim(),
      district: farmDistrict.trim(),
      division: farmDivision.trim(),
      upazila: farmUpazila.trim(),
      farmType: farmType.trim(),
      contact: farmContact.trim(),
      email: farmEmail.trim() || null,
    }

    const { error } = await updateFarm(patch)
    setSavingFarm(false)

    if (error) {
      setFarmError(error)
    } else {
      setFarmSuccess('Farm Name and Branding updated successfully! Topbar and headers updated.')
      setTimeout(() => setFarmSuccess(''), 4500)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSuccess('')
    setProfileError('')

    const patch = {
      name: userName.trim(),
      contact: userContact.trim(),
      email: userEmail.trim() || null,
      roleTitle: userRoleTitle.trim(),
      bio: userBio.trim(),
      avatar: userAvatar || null,
    }

    const { error } = await updateProfile(patch)
    setSavingProfile(false)

    if (error) {
      setProfileError(error)
    } else {
      setProfileSuccess('Profile photo and details saved successfully! Topbar avatar updated.')
      setTimeout(() => setProfileSuccess(''), 4500)
    }
  }

  const setAlertPreference = (enabled) => {
    setShowAlerts(enabled)
    const current = storage.get('preferences', {}) || {}
    storage.set('preferences', { ...current, showDashboardAlerts: enabled })
  }

  const exportBackup = () => {
    const backup = Object.keys(localStorage)
      .filter((key) => key.startsWith('khamar.') && key !== 'khamar.session' && key !== 'khamar.lang')
      .reduce((data, key) => {
        try { data[key.slice('khamar.'.length)] = JSON.parse(localStorage.getItem(key)) } catch {}
        return data
      }, {})
    const blob = new Blob([JSON.stringify({ product: 'KhamarBari', exportedAt: new Date().toISOString(), data: backup }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `khamarbari-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const resetData = async () => {
    setResetting(true)
    storage.set('preferences', {})
    setShowAlerts(true)
    setDateRange('7d')
    setLang('en')
    setResetting(false)
    setResetOpen(false)
  }

  const periods = [
    { value: '7d', label: t('range.7d') },
    { value: '30d', label: t('range.30d') },
    { value: '90d', label: t('range.90d') },
    { value: 'ytd', label: t('range.ytd') },
  ]

  const userInitials = (userName || user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">{t('settings.eyebrow', 'Administration')}</p>
          <h1 className="mt-1 text-2xl font-bold text-forest-900">{t('sidebar.settings', 'Settings')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-forest-700/70">
            Configure your farm identity &amp; name, manage profile photo, regional preferences, and data backups.
          </p>
        </div>
      </header>

      {/* Modern Tabs Navigation */}
      <div className="flex border-b border-forest-100 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('farm')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'farm'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-forest-700/60 hover:text-forest-900'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Farm Name &amp; Branding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-forest-700/60 hover:text-forest-900'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile Photo &amp; Account</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'preferences'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-forest-700/60 hover:text-forest-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>System &amp; Regional</span>
        </button>
      </div>

      {/* ================= TAB 1: FARM NAME & BRANDING ================= */}
      {activeTab === 'farm' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left: Farm Logo Studio */}
          <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft text-center h-fit">
            <h2 className="text-sm font-bold text-forest-900 mb-3 text-left flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-700" />
              <span>Farm Logo &amp; Emblem</span>
            </h2>

            {/* Farm Logo Canvas */}
            <div className="relative mx-auto w-28 h-28 rounded-2xl border-2 border-forest-100 shadow-sm overflow-hidden bg-forest-50 p-2 flex items-center justify-center group">
              {farmLogo ? (
                <img src={farmLogo} alt={farmName} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="flex flex-col items-center justify-center text-forest-700/60">
                  <Building2 className="h-10 w-10 mb-1" />
                  <span className="text-[10px] font-bold">No Logo</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => farmLogoInputRef.current?.click()}
                className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold"
              >
                <Upload className="h-5 w-5 mb-0.5" />
                <span>Upload</span>
              </button>
            </div>

            <p className="mt-3 text-sm font-bold text-forest-950">{farmName || 'Your Farm Name'}</p>
            <p className="text-[11px] text-forest-700/70">{farmType}</p>

            <input
              ref={farmLogoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFarmLogoUpload}
            />

            <div className="mt-4 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center gap-1.5"
                onClick={() => farmLogoInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Logo Image</span>
              </Button>

              {farmLogo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => setFarmLogo('')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Logo</span>
                </Button>
              )}
            </div>

            {/* Preset Farm Emblems */}
            <div className="mt-5 pt-4 border-t border-forest-50 text-left">
              <p className="text-[11px] font-semibold text-forest-700/75 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Preset Emblems</span>
              </p>
              <div className="flex gap-2 justify-center">
                {PRESET_FARM_LOGOS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFarmLogo(p.url)}
                    title={p.label}
                    className={`h-10 w-10 rounded-xl border p-1 overflow-hidden transition-all hover:scale-110 cursor-pointer ${
                      farmLogo === p.url ? 'border-emerald-600 ring-2 ring-emerald-400 bg-emerald-50' : 'border-forest-100 hover:border-emerald-400 bg-white'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-contain rounded-lg" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right: Farm Details Form */}
          <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft">
            <div className="border-b border-forest-50 pb-4 mb-4">
              <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-700" />
                <span>Farm Organization Profile</span>
              </h2>
              <p className="mt-0.5 text-xs text-forest-700/70">
                Update official farm name, registration details, geographic location, and operational focus.
              </p>
            </div>

            {farmSuccess && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{farmSuccess}</span>
              </div>
            )}

            {farmError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{farmError}</span>
              </div>
            )}

            <form onSubmit={handleSaveFarm} className="space-y-4">
              <div>
                <Label htmlFor="farmNameInput" className="text-xs font-bold text-forest-950">Farm Name *</Label>
                <Input
                  id="farmNameInput"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  required
                  placeholder="e.g. Green Valley Agro Complex"
                  className="mt-1.5 font-semibold text-base"
                />
                <p className="text-[11px] text-forest-700/60 mt-1">
                  This name appears in your topbar, sales invoices, reports, and team notifications.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmTaglineInput">Farm Slogan / Tagline</Label>
                  <Input
                    id="farmTaglineInput"
                    value={farmTagline}
                    onChange={(e) => setFarmTagline(e.target.value)}
                    placeholder="e.g. Pure Dairy & Organic Poultry"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="farmTypeInput">Primary Farm Type</Label>
                  <Input
                    id="farmTypeInput"
                    value={farmType}
                    onChange={(e) => setFarmType(e.target.value)}
                    placeholder="e.g. Dairy, Poultry & Fisheries"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmLicenseInput" className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-forest-600" />
                    <span>Trade License / Registration No.</span>
                  </Label>
                  <Input
                    id="farmLicenseInput"
                    value={farmLicense}
                    onChange={(e) => setFarmLicense(e.target.value)}
                    placeholder="e.g. TRAD/DNCC/2024/0981"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="farmContactInput" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-forest-600" />
                    <span>Farm Official Contact</span>
                  </Label>
                  <Input
                    id="farmContactInput"
                    value={farmContact}
                    onChange={(e) => setFarmContact(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Location details */}
              <div className="p-3.5 rounded-xl border border-forest-100 bg-cream-50/50 space-y-3">
                <Label className="flex items-center gap-1.5 text-xs font-bold text-forest-900">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Headquarters &amp; Field Location</span>
                </Label>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="farmDivisionInput" className="text-[11px]">Division</Label>
                    <Input
                      id="farmDivisionInput"
                      value={farmDivision}
                      onChange={(e) => setFarmDivision(e.target.value)}
                      placeholder="e.g. Rangpur"
                      className="mt-1 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="farmDistrictInput" className="text-[11px]">District / Zilla</Label>
                    <Input
                      id="farmDistrictInput"
                      value={farmDistrict}
                      onChange={(e) => setFarmDistrict(e.target.value)}
                      placeholder="e.g. Rangpur"
                      className="mt-1 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="farmUpazilaInput" className="text-[11px]">Upazila / Thana</Label>
                    <Input
                      id="farmUpazilaInput"
                      value={farmUpazila}
                      onChange={(e) => setFarmUpazila(e.target.value)}
                      placeholder="e.g. Mithapukur"
                      className="mt-1 bg-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="farmAddressInput" className="text-[11px]">Village / Mouza / Road Address</Label>
                  <Input
                    id="farmAddressInput"
                    value={farmAddress}
                    onChange={(e) => setFarmAddress(e.target.value)}
                    placeholder="e.g. Holdibari Road, Sector 4, Mithapukur"
                    className="mt-1 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={savingFarm}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingFarm ? t('common.loading', 'Saving...') : 'Save Farm Information'}</span>
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ================= TAB 2: PROFILE PHOTO & ACCOUNT ================= */}
      {activeTab === 'profile' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left: User Avatar Studio */}
          <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft text-center h-fit">
            <h2 className="text-sm font-bold text-forest-900 mb-3 text-left flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-700" />
              <span>Profile Photo</span>
            </h2>

            {/* Profile Avatar Canvas */}
            <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-emerald-50 shadow-md overflow-hidden bg-forest-900 group">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest-700 to-forest-950 text-white text-3xl font-black">
                  {userInitials}
                </div>
              )}

              <button
                type="button"
                onClick={() => userAvatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold"
              >
                <Camera className="h-6 w-6 mb-1" />
                <span>Change Photo</span>
              </button>
            </div>

            <p className="mt-3 text-base font-bold text-forest-900">{userName || 'Your Name'}</p>
            <p className="text-xs text-forest-700/70 font-medium capitalize">{userRoleTitle || user?.role}</p>

            <input
              ref={userAvatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUserAvatarUpload}
            />

            <div className="mt-4 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center gap-1.5"
                onClick={() => userAvatarInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Custom Photo</span>
              </Button>

              {userAvatar && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => setUserAvatar('')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Photo</span>
                </Button>
              )}
            </div>

            {/* Preset User Avatars */}
            <div className="mt-5 pt-4 border-t border-forest-50 text-left">
              <p className="text-[11px] font-semibold text-forest-700/75 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>1-Click Preset Avatars</span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {PRESET_USER_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setUserAvatar(p.url)}
                    title={p.label}
                    className={`h-10 w-10 rounded-full border-2 p-0.5 overflow-hidden transition-all hover:scale-110 cursor-pointer ${
                      userAvatar === p.url ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-forest-100 hover:border-emerald-400'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover rounded-full" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-forest-50 text-center">
              <Button variant="ghost" size="sm" asChild className="text-xs text-emerald-800 gap-1">
                <Link to="/dashboard/profile">
                  <span>Open Full Profile Page</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Right: Personal Information Quick Editor */}
          <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft">
            <div className="border-b border-forest-50 pb-4 mb-4">
              <h2 className="text-base font-bold text-forest-900 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-700" />
                <span>Account &amp; Personal Info</span>
              </h2>
              <p className="mt-0.5 text-xs text-forest-700/70">
                Update your display name, contact phone, role title, and bio.
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
                  <Label htmlFor="setUserName">Full Name *</Label>
                  <Input
                    id="setUserName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    placeholder="e.g. Md. Ahsan Habib"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="setUserRoleTitle">Role / Professional Title</Label>
                  <Input
                    id="setUserRoleTitle"
                    value={userRoleTitle}
                    onChange={(e) => setUserRoleTitle(e.target.value)}
                    placeholder="e.g. Managing Director & Dairy Specialist"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="setUserContact" className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-forest-600" />
                    <span>Contact / Login Phone *</span>
                  </Label>
                  <Input
                    id="setUserContact"
                    value={userContact}
                    onChange={(e) => setUserContact(e.target.value)}
                    required
                    placeholder="e.g. 01700000000"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="setUserEmail" className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-forest-600" />
                    <span>Email Address</span>
                  </Label>
                  <Input
                    id="setUserEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. owner@khamarbari.com"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="setUserBio">About Me / Farmer Bio</Label>
                <Textarea
                  id="setUserBio"
                  rows={3}
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  placeholder="Share details about your farming credentials, livestock focus..."
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
        </div>
      )}

      {/* ================= TAB 3: SYSTEM PREFERENCES & DATA ================= */}
      {activeTab === 'preferences' && (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-soft">
            <div className="border-b border-forest-50 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-forest-900">
                <Sun className="h-4 w-4 text-sunshine-deep" />
                {t('settings.preferences', 'User Interface Preferences')}
              </h2>
              <p className="mt-1 text-xs text-forest-700/65">
                {t('settings.preferencesDesc', 'Control language, default periods, and operational telemetry alerts.')}
              </p>
            </div>

            <div className="divide-y divide-forest-50">
              {/* Language */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sunshine-soft text-forest-700">
                    <Languages className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest-900">{t('settings.language', 'Language / ভাষা')}</p>
                    <p className="mt-1 text-xs text-forest-700/65">{t('settings.languageDesc', 'Switch interface between English and Bangla')}</p>
                  </div>
                </div>
                <div className="flex rounded-xl border border-forest-100 bg-cream-50 p-1">
                  {[{ value: 'en', label: 'English' }, { value: 'bn', label: 'বাংলা' }].map((language) => (
                    <button
                      key={language.value}
                      type="button"
                      onClick={() => setLang(language.value)}
                      aria-pressed={i18n.resolvedLanguage === language.value}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                        i18n.resolvedLanguage === language.value ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-700/65 hover:text-forest-900'
                      }`}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage text-forest-700">
                    <Globe className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest-900">{t('settings.dashboardPeriod', 'Default Dashboard Timeframe')}</p>
                    <p className="mt-1 text-xs text-forest-700/65">{t('settings.dashboardPeriodDesc', 'Preferred overview period across charts and graphs')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 rounded-xl border border-forest-100 bg-cream-50 p-1">
                  {periods.map((period) => (
                    <button
                      key={period.value}
                      type="button"
                      onClick={() => setDateRange(period.value)}
                      aria-pressed={dateRange === period.value}
                      className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                        dateRange === period.value ? 'bg-forest-700 text-white shadow-sm' : 'text-forest-700/65 hover:bg-white'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dashboard Alerts */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff4d7] text-[#906e20]">
                    <BellRing className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest-900">{t('settings.dashboardAlerts', 'Real-Time Health & Inventory Alerts')}</p>
                    <p className="mt-1 text-xs text-forest-700/65">{t('settings.dashboardAlertsDesc', 'Show badges for sick animals and low feed stocks')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showAlerts}
                  onClick={() => setAlertPreference(!showAlerts)}
                  className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${showAlerts ? 'bg-forest-600' : 'bg-forest-200'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${showAlerts ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Right: Regional & Backup */}
          <div className="space-y-5">
            <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft">
              <h2 className="text-sm font-bold text-forest-900">{t('settings.regional', 'Regional Standards')}</h2>
              <p className="mt-1 text-xs text-forest-700/65">{t('settings.regionalDesc', 'Bangladesh agricultural units & fiscal currency')}</p>
              <dl className="mt-4 divide-y divide-forest-50 text-sm">
                <SettingValue label={t('settings.currency', 'Currency')} value="Bangladeshi Taka · BDT (৳)" />
                <SettingValue label={t('settings.timezone', 'Timezone')} value="Asia/Dhaka · UTC+06:00" />
                <SettingValue label={t('settings.dateFormat', 'Date Format')} value={i18n.resolvedLanguage === 'bn' ? 'DD/MM/YYYY' : 'DD MMM YYYY'} />
              </dl>
            </section>

            <section className="rounded-2xl border border-forest-100 bg-white p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage text-forest-700">
                  <Download className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-forest-900">Export browser preferences</h2>
                  <p className="mt-1 text-xs leading-5 text-forest-700/65">Download language and app preferences. Farm records remain securely stored on the server and are not included.</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full" onClick={exportBackup}>
                <Download className="h-4 w-4" />
                {t('settings.exportBackup', 'Export JSON Backup')}
              </Button>
            </section>
          </div>
        </div>
      )}

      {/* Danger Zone: Reset Data */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-red-200/80 bg-red-50/70 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-red-600">
            <RotateCcw className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-red-900">Reset browser preferences</h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-red-800/75">Restore local language and dashboard preferences to their defaults. This does not delete farm records.</p>
          </div>
        </div>
        <Button variant="destructive" className="shrink-0" onClick={() => setResetOpen(true)}>
          <RotateCcw className="h-4 w-4" />
          Reset preferences
        </Button>
      </section>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset browser preferences?"
        description="Language, dashboard date range and alert preferences will return to their defaults. Server-side farm records will not be changed."
        confirmLabel="Reset preferences"
        cancelLabel={t('common.cancel', 'Cancel')}
        destructive
        loading={resetting}
        onConfirm={resetData}
      />
    </div>
  )
}

function SettingValue({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <dt className="text-xs text-forest-700/65">{label}</dt>
      <dd className="text-right text-xs font-semibold text-forest-900">{value}</dd>
    </div>
  )
}
