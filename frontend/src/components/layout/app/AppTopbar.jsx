import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, Menu, Plus, User, Settings as Cog, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import LanguageToggle from '@/components/common/LanguageToggle'
import BranchSelector from './BranchSelector'
import CreateBranchDialog from '@/components/branch/CreateBranchDialog'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'

export default function AppTopbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const farm = useAuthStore((s) => s.farm)
  const logout = useAuthStore((s) => s.logout)
  const setBranch = useAppStore((s) => s.setBranch)
  const refreshBranches = useAppStore((s) => s.refreshBranches)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed)
  const [branchOpen, setBranchOpen] = useState(false)

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = (user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-30 h-[4.5rem] border-b border-forest-100/70 bg-cream/85 shadow-[0_3px_18px_rgba(17,45,28,0.04)] backdrop-blur-xl">
      <div className="h-full px-4 flex items-center gap-3">
        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-forest-100 bg-white text-forest-800 shadow-sm transition-all hover:bg-forest-50 active:scale-95"
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              toggleSidebar()
            } else {
              toggleSidebarCollapsed()
            }
          }}
          aria-label={t('sidebar.toggle', 'Toggle navigation')}
          aria-expanded={sidebarOpen}
          title={t('sidebar.toggle', 'Toggle navigation')}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          {farm?.logo ? (
            <img src={farm.logo} alt="" className="h-14 w-14 rounded-xl border border-forest-200 object-cover shadow-xs" />
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#dcf88f] to-[#bce86f] ring-1 ring-forest-200/50 shadow-[0_2px_10px_rgba(181,230,97,0.35)]">
              <img src="/sprout.svg" alt="KhamarBari" className="h-12 w-12 drop-shadow-xs" />
            </div>
          )}
          <div className="hidden sm:block min-w-0">
            <p className="max-w-[180px] truncate text-sm font-bold text-forest-900">{farm?.name}</p>
            <p className="text-[11px] font-medium capitalize text-forest-700/70">{user?.role}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block"><BranchSelector /></div>

          {['owner', 'admin'].includes(user?.role) && (
            <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => setBranchOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">{t('branch.new')}</span>
            </Button>
          )}

          <LanguageToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-forest text-xs font-semibold text-white shadow-[0_0_0_1px_rgba(156,201,180,0.7),0_4px_12px_rgba(15,61,46,0.16)] transition-transform hover:scale-105">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm text-forest-900 font-semibold normal-case">{user?.name}</span>
                  <span className="text-[11px] text-forest-700/60 normal-case">{user?.contact}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" /> {t('profile.title')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile#password" className="flex items-center gap-2 cursor-pointer">
                  <KeyRound className="h-4 w-4" /> {t('profile.changePassword')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                  <Cog className="h-4 w-4" /> {t('sidebar.settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onLogout} className="text-red-600 focus:bg-red-50">
                <LogOut className="h-4 w-4" /> {t('dashboard.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CreateBranchDialog
        open={branchOpen}
        onOpenChange={setBranchOpen}
        onCreated={(branch) => {
          refreshBranches()
          if (branch?.id) setBranch(branch.id)
        }}
      />
    </header>
  )
}