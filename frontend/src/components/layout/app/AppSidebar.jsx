import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  LayoutDashboard, Beef, Wallet, ShoppingCart, Milk, Package, GitBranch, Sun,
  Zap, Users, BarChart3, Settings, X, ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'

// Same routes and order as before, now tagged with a section so the rail reads in chunks.
const NAV = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard, end: true, group: 'overview' },
  { to: '/dashboard/animals', key: 'animals', icon: Beef, group: 'livestock' },
  { to: '/dashboard/branches', key: 'branches', icon: GitBranch, group: 'livestock' },
  { to: '/dashboard/expenses', key: 'expenses', icon: Wallet, group: 'finance' },
  { to: '/dashboard/sales', key: 'sales', icon: ShoppingCart, group: 'finance' },
  { to: '/dashboard/production', key: 'production', icon: Milk, group: 'operations' },
  { to: '/dashboard/inventory', key: 'inventory', icon: Package, group: 'operations' },
  { to: '/dashboard/utilities', key: 'utilities', icon: Zap, group: 'operations' },
  { to: '/dashboard/workers', key: 'workers', icon: Users, group: 'people' },
  { to: '/dashboard/reports', key: 'reports', icon: BarChart3, group: 'people' },
  { to: '/dashboard/settings', key: 'settings', icon: Settings, group: 'system' },
]

const GROUP_LABELS = {
  overview: 'Overview',
  livestock: 'Livestock',
  finance: 'Money',
  operations: 'Operations',
  people: 'People & reports',
  system: 'System',
}

function SidebarContent({ t, closeSidebar, navItems, mobile = false, collapsed = false }) {
  const reducedMotion = useReducedMotion()
  const user = useAuthStore((state) => state.user)
  const spotRef = useRef(null)
  const [tip, setTip] = useState(null) // tooltip for the collapsed rail

  const activeTransition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 420, damping: 34 }

  // Group the (already role-filtered) items, keeping their original order
  const groups = useMemo(() => {
    const out = []
    navItems.forEach((item) => {
      const last = out[out.length - 1]
      if (last && last.id === item.group) last.items.push(item)
      else out.push({ id: item.group, items: [item] })
    })
    return out
  }, [navItems])

  const order = useMemo(() => Object.fromEntries(navItems.map((n, i) => [n.to, i])), [navItems])

  const displayName = user?.name || user?.full_name || user?.email?.split('@')[0] || 'Farm member'
  const role = user?.role || ''

  // Cursor-follow light across the nav (no re-render: writes CSS variables directly)
  const onMove = (e) => {
    const el = spotRef.current
    if (!el || reducedMotion) return
    const r = e.currentTarget.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
    el.style.opacity = '1'
  }
  const onLeave = () => {
    if (spotRef.current) spotRef.current.style.opacity = '0'
  }

  const showTip = (label) => (e) => {
    if (!collapsed) return
    const r = e.currentTarget.getBoundingClientRect()
    setTip({ label, left: r.right + 14, top: r.top + r.height / 2 })
  }
  const hideTip = () => setTip(null)

  return (
    <div className="sidebar-shell relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#0f3624] via-[#145034] to-[#0b2a1b] text-white select-none">
      {/* Ambient layers (existing hooks kept) */}
      <div aria-hidden="true" className="sidebar-sunbeams pointer-events-none" />
      <div aria-hidden="true" className="sidebar-fieldlines pointer-events-none" />

      {/* Warm light spilling in from the top corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-[#d9f88c]/[0.13] blur-3xl"
      />

      {/* Slow-turning sun watermark */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-34px] top-[96px] z-0 text-[#f5d477]/[0.07]"
        animate={reducedMotion ? undefined : { rotate: 360, y: [0, -6, 0] }}
        transition={{
          rotate: { duration: 84, repeat: Infinity, ease: 'linear' },
          y: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <Sun className="h-44 w-44" strokeWidth={0.65} />
      </motion.div>

      {/* Micro-grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(228,245,219,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(228,245,219,0.3)_1px,transparent_1px)] [background-size:28px_28px]"
      />

      {/* Rolling hills at the foot of the rail */}
      <svg
        aria-hidden="true"
        viewBox="0 0 264 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 w-full"
      >
        <path d="M0 70 Q60 40 130 62 T264 48 V120 H0Z" fill="#d9f88c" opacity="0.045" />
        <path d="M0 92 Q70 66 140 86 T264 76 V120 H0Z" fill="#d9f88c" opacity="0.06" />
      </svg>

      {/* ── Brand header ── */}
      <div
        className={cn(
          'relative z-10 flex h-[4.75rem] shrink-0 items-center border-b border-white/[0.08]',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        <NavLink
          to="/dashboard"
          onClick={closeSidebar}
          className="group flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#d9f88c]/60"
          title={t('brand.name')}
        >
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#e6fba4] to-[#b6e463] shadow-[0_6px_20px_rgba(181,230,97,0.35),inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-white/40 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            <img src="/sprout.svg" alt="KhamarBari" className="h-9 w-9" />
          </span>

          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[16px] font-extrabold leading-none tracking-tight text-[#f8faf6]">
                {t('brand.name')}
              </span>
              <span className="mt-1.5 truncate text-[11px] font-medium leading-none text-[#9fc29d]">
                Farm operations
              </span>
            </span>
          )}
        </NavLink>

        {mobile && (
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white outline-none transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-[#d9f88c]/60 active:scale-95"
            onClick={closeSidebar}
            aria-label={t('sidebar.hide', 'Hide sidebar')}
            title={t('sidebar.hide', 'Hide sidebar')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="relative z-10 min-h-0 flex-1" onMouseMove={onMove} onMouseLeave={onLeave}>
        <div
          ref={spotRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(170px circle at var(--mx, 50%) var(--my, 50%), rgba(217,248,140,0.11), transparent 70%)',
          }}
        />

        <nav
          className="sidebar-nav relative z-10 h-full overflow-y-auto px-2.5 pb-6 pt-3 [-ms-overflow-style:none] [mask-image:linear-gradient(to_bottom,transparent,black_14px,black_calc(100%-28px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Main"
        >
          {groups.map((group, gi) => (
            <div key={group.id} className={gi === 0 ? '' : 'mt-3'}>
              {collapsed ? (
                gi > 0 && <div className="mx-auto mb-2 w-5 border-t border-white/[0.12]" />
              ) : (
                <p className="truncate px-3 pb-1.5 pt-1 text-[11px] font-semibold text-[#8fae92]">
                  {t(`sidebar.groups.${group.id}`, GROUP_LABELS[group.id])}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map(({ to, key, icon: Icon, end }) => {
                  const label = t(`sidebar.${key}`)
                  return (
                    <motion.div
                      key={to}
                      initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.04 + order[to] * 0.03, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <NavLink
                        to={to}
                        end={end}
                        onClick={closeSidebar}
                        onMouseEnter={showTip(label)}
                        onMouseLeave={hideTip}
                        onFocus={showTip(label)}
                        onBlur={hideTip}
                        aria-label={collapsed ? label : undefined}
                        className={({ isActive }) =>
                          cn(
                            'group relative isolate flex items-center rounded-xl text-[13px] font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#d9f88c]/60',
                            collapsed ? 'mx-auto h-11 w-11 justify-center' : 'h-10 gap-3 px-2.5',
                            isActive ? 'font-semibold text-white' : 'text-[#c5d9c6]/75 hover:text-white'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active glass pill with a lime edge */}
                            {isActive && (
                              <motion.span
                                layoutId={mobile ? 'mobile-sidebar-active' : collapsed ? 'collapsed-sidebar-active' : 'desktop-sidebar-active'}
                                className="absolute inset-0 z-0 rounded-xl bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.18)] ring-1 ring-inset ring-white/[0.14]"
                                transition={activeTransition}
                              >
                                <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#d9f88c] shadow-[0_0_12px_rgba(217,248,140,0.9)]" />
                              </motion.span>
                            )}

                            <span
                              className={cn(
                                'relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-all duration-200',
                                isActive
                                  ? 'bg-[#d9f88c] text-[#0d2a1a] shadow-[0_4px_14px_rgba(217,248,140,0.4)]'
                                  : 'bg-white/[0.05] text-[#a1c2a0] group-hover:scale-110 group-hover:bg-white/10 group-hover:text-[#d5f786]'
                              )}
                            >
                              <Icon className="h-4 w-4" strokeWidth={isActive ? 2.1 : 1.75} />
                            </span>

                            {!collapsed && (
                              <span className="relative z-10 truncate tracking-normal">{label}</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* ── Footer: signed-in member + version ── */}
      <div className="relative z-10 border-t border-white/[0.08] p-3">
        {mobile && (
          <button
            type="button"
            onClick={closeSidebar}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.1] py-2 text-xs font-semibold text-white outline-none transition-all hover:bg-white/[0.18] focus-visible:ring-2 focus-visible:ring-[#d9f88c]/60 active:scale-[0.98]"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{t('sidebar.hide', 'Hide sidebar')}</span>
          </button>
        )}

        <div
          className={cn(
            'flex items-center rounded-2xl border border-white/[0.08] bg-white/[0.05] backdrop-blur-sm',
            collapsed ? 'mx-auto h-11 w-11 justify-center' : 'gap-2.5 p-2'
          )}
          onMouseEnter={showTip(displayName)}
          onMouseLeave={hideTip}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#e6fba4] to-[#a3e635] text-[13px] font-bold text-[#0d2a1a]">
            {displayName.charAt(0).toUpperCase()}
          </span>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold leading-tight text-[#eef6ec]">{displayName}</p>
                <p className="truncate text-[11px] capitalize leading-tight text-[#8fae92]">
                  {role || `© ${new Date().getFullYear()} Smart Agro`}
                </p>
              </div>
              <span className="rounded-md border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#b8dab6]">
                v2.4
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tooltip for the collapsed rail (fixed, so the shell can't clip it) */}
      <AnimatePresence>
        {collapsed && tip && (
          <motion.div
            key={tip.label}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0b2a1b] px-2.5 py-1.5 text-xs font-medium text-white shadow-xl"
            style={{ left: tip.left, top: tip.top }}
          >
            {tip.label}
          </motion.div>
        )}
      </AnimatePresence>
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

  // Escape closes the drawer; Ctrl/Cmd + B toggles the desktop rail
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const el = e.target
        const typing = el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
        if (typing) return
        e.preventDefault()
        toggleSidebarCollapsed()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar, toggleSidebarCollapsed])

  // Stop the page scrolling behind the open mobile drawer
  useEffect(() => {
    if (!sidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [sidebarOpen])

  return (
    <>
      {/* Desktop / tablet rail */}
      <aside
        className={cn(
          'sticky top-0 z-20 hidden h-dvh shrink-0 border-r border-[#143e2b] shadow-[1px_0_12px_rgba(0,0,0,0.1)] transition-[width] duration-300 ease-out md:block',
          sidebarCollapsed ? 'w-[4.75rem]' : 'w-[16.5rem]'
        )}
      >
        <SidebarContent t={t} closeSidebar={closeSidebar} navItems={visibleNav} collapsed={sidebarCollapsed} />

        {/* Edge handle sits on the border, like a gate latch */}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          title={`${sidebarCollapsed ? t('sidebar.expand', 'Expand sidebar') : t('sidebar.collapse', 'Collapse sidebar')} (Ctrl+B)`}
          aria-label={sidebarCollapsed ? t('sidebar.expand', 'Expand sidebar') : t('sidebar.collapse', 'Collapse sidebar')}
          aria-expanded={!sidebarCollapsed}
          className="absolute -right-3 top-[4.75rem] z-30 grid h-6 w-6 place-items-center rounded-full border border-white/20 bg-[#174c34] text-[#d9f88c] shadow-lg outline-none transition hover:scale-110 hover:bg-[#1d5a3e] focus-visible:ring-2 focus-visible:ring-[#d9f88c]/70"
        >
          <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform duration-300', sidebarCollapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              aria-label="Close navigation"
              role="button"
              tabIndex={0}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && closeSidebar()}
            />
            <motion.aside
              key="sidebar-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
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
