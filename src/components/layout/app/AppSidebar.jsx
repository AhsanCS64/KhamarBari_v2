import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  LayoutDashboard, Beef, Wallet, ShoppingCart, Milk, Package, GitBranch, Sun,
  Zap, Users, BarChart3, Settings, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'

const NAV = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/animals', key: 'animals', icon: Beef },
  { to: '/dashboard/branches', key: 'branches', icon: GitBranch },
  { to: '/dashboard/expenses', key: 'expenses', icon: Wallet },
  { to: '/dashboard/sales', key: 'sales', icon: ShoppingCart },
  { to: '/dashboard/production', key: 'production', icon: Milk },
  { to: '/dashboard/inventory', key: 'inventory', icon: Package },
  { to: '/dashboard/utilities', key: 'utilities', icon: Zap },
  { to: '/dashboard/workers', key: 'workers', icon: Users },
  { to: '/dashboard/reports', key: 'reports', icon: BarChart3 },
  { to: '/dashboard/settings', key: 'settings', icon: Settings },
]

function SidebarContent({
  t,
  closeSidebar,
  navItems,
  mobile = false,
  collapsed = false,
  toggleCollapse,
}) {
  const reducedMotion = useReducedMotion()
  const activeTransition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 420, damping: 34 }

  return (
    <div className="sidebar-shell relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#133e2b] via-[#174c34] to-[#0f3422] text-white select-none">
      {/* 1. Refined Ambient Lighting & Background Textures */}
      <div aria-hidden="true" className="sidebar-sunbeams pointer-events-none" />
      <div aria-hidden="true" className="sidebar-fieldlines pointer-events-none" />

      {/* Subtle Ethereal Sun Watermark */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-28px] top-[80px] z-0 text-[#f5d477]/[0.07]"
        animate={reducedMotion ? undefined : { rotate: 360, y: [0, -6, 0] }}
        transition={{
          rotate: { duration: 84, repeat: Infinity, ease: 'linear' },
          y: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <Sun className="h-44 w-44" strokeWidth={0.65} />
      </motion.div>

      {/* Micro-grid Texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(228,245,219,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(228,245,219,0.3)_1px,transparent_1px)] [background-size:28px_28px]"
      />

      {/* 2. Brand Header */}
      <div
        className={cn(
          'relative z-10 flex h-[4.75rem] shrink-0 items-center border-b border-white/[0.08] backdrop-blur-xs transition-all',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        <NavLink
          to="/dashboard"
          onClick={closeSidebar}
          className="group flex items-center gap-3 min-w-0"
          title={t('brand.name')}
        >
          {/* Brand Icon */}
          <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#dcf88f] to-[#bce86f] ring-1 ring-white/30 shadow-[0_4px_16px_rgba(181,230,97,0.3)] transition-all duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <img src="/sprout.svg" alt="KhamarBari" className="h-16 w-16 drop-shadow-xs" />
          </span>

          {!collapsed && (
            <span className="flex flex-col min-w-0 truncate">
              <span className="text-[15px] font-extrabold tracking-tight text-[#f8faf6] leading-none transition-colors group-hover:text-white truncate">
                {t('brand.name')}
              </span>
              <span className="mt-1.5 text-[9px] font-bold tracking-[0.2em] text-[#9fc29d] uppercase leading-none">
                FARM OPERATIONS
              </span>
            </span>
          )}
        </NavLink>

        {mobile && (
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all shadow-xs"
            onClick={closeSidebar}
            aria-label={t('sidebar.hide', 'Hide sidebar')}
            title={t('sidebar.hide', 'Hide sidebar')}
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* 3. Navigation List */}
      <nav className="sidebar-nav relative z-10 flex-1 space-y-1 overflow-y-auto px-2.5 pt-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Section divider or title */}
        {collapsed ? (
          <div className="mx-auto my-2 w-6 border-t border-white/[0.12]" />
        ) : (
          <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-[#8fae92] uppercase truncate">
            YOUR WORKSPACE
          </p>
        )}

        {navItems.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={closeSidebar}
            title={collapsed ? t(`sidebar.${key}`) : undefined}
            className={({ isActive }) =>
              cn(
                'group relative isolate flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 border border-transparent',
                collapsed ? 'justify-center p-2.5 my-1' : 'gap-3 px-2.5 py-2',
                isActive
                  ? 'text-[#0d2a1a] font-semibold'
                  : 'text-[#d0e0d1]/75 hover:border-white/[0.08] hover:bg-white/[0.06] hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Pill */}
                {isActive && (
                  <motion.span
                    layoutId={mobile ? 'mobile-sidebar-active' : collapsed ? 'collapsed-sidebar-active' : 'desktop-sidebar-active'}
                    className="absolute inset-0 z-0 rounded-xl bg-gradient-to-r from-[#d9f88c] to-[#cbf478] shadow-[0_4px_20px_rgba(181,230,97,0.22),inset_0_1px_1px_rgba(255,255,255,0.6)]"
                    transition={activeTransition}
                  />
                )}

                {/* Icon Container */}
                <span
                  className={cn(
                    'relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-[#0d2a1a]/12 text-[#0d2a1a]'
                      : 'bg-white/[0.04] text-[#a1c2a0] group-hover:bg-white/[0.08] group-hover:text-[#d5f786]'
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={isActive ? 2 : 1.75} />
                </span>

                {/* Nav Label (when expanded) */}
                {!collapsed && (
                  <span className="relative z-10 truncate text-[13px] tracking-normal">
                    {t(`sidebar.${key}`)}
                  </span>
                )}

                {/* Active Indicator Glowing Dot */}
                {isActive && !collapsed && (
                  <span className="relative z-10 ml-auto flex h-2 w-2 items-center justify-center">
                    <span className="absolute h-2 w-2 rounded-full bg-[#1b502d]/40 animate-ping" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-[#1b502d]" />
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 4. Footer Polish */}
      <div className="relative z-10 border-t border-white/[0.08] p-3 backdrop-blur-xs">
        {mobile ? (
          <button
            type="button"
            onClick={closeSidebar}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.1] hover:bg-white/[0.18] py-2 text-xs font-semibold text-white transition-all active:scale-98 shadow-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{t('sidebar.hide', 'Hide sidebar')}</span>
          </button>
        ) : collapsed ? (
          <div className="flex flex-col items-center gap-2">
            {toggleCollapse && (
              <button
                type="button"
                onClick={toggleCollapse}
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white transition-all shadow-xs"
                title={t('sidebar.expand', 'Expand sidebar')}
                aria-label={t('sidebar.expand', 'Expand sidebar')}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <span className="text-[9px] font-mono text-[#b8dab6]/70">v2.4</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635] shadow-[0_0_6px_#a3e635]" />
                <p className="text-[11px] font-bold text-[#e1efe0] tracking-tight">KhamarBari</p>
              </div>
              <p className="mt-0.5 text-[10px] text-[#8fae92]/70 font-medium">
                © {new Date().getFullYear()} · Smart Agro
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[#b8dab6]">
                v2.4
              </span>
              {toggleCollapse && (
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="grid h-7 w-7 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  title={t('sidebar.collapse', 'Collapse sidebar')}
                  aria-label={t('sidebar.collapse', 'Collapse sidebar')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AppSidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleSidebarCollapsed } = useAppStore()
  const reducedMotion = useReducedMotion()
  const visibleNav = NAV.filter(({ key }) => key !== 'branches' || ['owner', 'admin'].includes(user?.role))

  // Close mobile sidebar on route navigation
  useEffect(() => {
    closeSidebar()
  }, [location.pathname, closeSidebar])

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  return (
    <>
      {/* Desktop / Tablet Sidebar (Collapsible Rail) */}
      <aside
        className={cn(
          'sticky top-0 hidden h-dvh shrink-0 border-r border-[#143e2b] transition-all duration-300 md:block shadow-[1px_0_12px_rgba(0,0,0,0.1)] z-20',
          sidebarCollapsed ? 'w-[4.75rem]' : 'w-[16.5rem]'
        )}
      >
        <SidebarContent
          t={t}
          closeSidebar={closeSidebar}
          navItems={visibleNav}
          collapsed={sidebarCollapsed}
          toggleCollapse={toggleSidebarCollapsed}
        />
      </aside>

      {/* Mobile drawer with balanced width and reliable dismiss */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              aria-label="Close navigation"
              role="button"
              tabIndex={0}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
            />
            <motion.aside
              key="sidebar-drawer"
              className="fixed left-0 top-0 z-50 h-dvh w-[min(76vw,16rem)] max-w-[280px] shadow-[20px_0_60px_rgba(0,0,0,0.45)] md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <SidebarContent t={t} closeSidebar={closeSidebar} navItems={visibleNav} mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
