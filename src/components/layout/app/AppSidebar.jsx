import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  LayoutDashboard, Beef, Wallet, ShoppingCart, Milk, Package, GitBranch, Sun,
  Zap, Users, BarChart3, Settings, X,
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

function SidebarContent({ t, closeSidebar, navItems, mobile = false }) {
  const reducedMotion = useReducedMotion()
  const activeTransition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 420, damping: 34 }

  return (
    <div className="sidebar-shell relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#133e2b] via-[#174c34] to-[#0f3422] text-white">
      {/* 1. Refined Ambient Lighting & Background Textures */}
      <div aria-hidden="true" className="sidebar-sunbeams" />
      <div aria-hidden="true" className="sidebar-fieldlines" />

      {/* Subtle Ethereal Sun Watermark (Lower opacity ~6% for ambient depth) */}
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

      {/* Micro-grid Texture (Ultra subtle ambient grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(228,245,219,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(228,245,219,0.3)_1px,transparent_1px)] [background-size:28px_28px]"
      />

      {/* 2. Brand Header (Elevated Typography & Ring Glow) */}
      <div className="relative z-10 flex h-[4.75rem] shrink-0 items-center justify-between border-b border-white/[0.08] px-4 backdrop-blur-xs">
        <NavLink to="/dashboard" onClick={closeSidebar} className="group flex items-center gap-3">
          {/* Brand Icon with Inner Specular Glow & 1px Border Ring */}
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#dcf88f] to-[#bce86f] ring-1 ring-white/30 shadow-[0_4px_16px_rgba(181,230,97,0.25)] transition-all duration-300 group-hover:-rotate-3 group-hover:scale-105 group-hover:shadow-[0_6px_22px_rgba(181,230,97,0.35)]">
            <img src="/sprout.svg" alt="KhamarBari" className="h-6 w-6 drop-shadow-xs" />
          </span>

          <span className="flex flex-col">
            <span className="text-[15px] font-extrabold tracking-tight text-[#f8faf6] leading-none transition-colors group-hover:text-white">
              {t('brand.name')}
            </span>
            <span className="mt-1.5 text-[9px] font-bold tracking-[0.2em] text-[#9fc29d] uppercase leading-none">
              FARM OPERATIONS
            </span>
          </span>
        </NavLink>

        {mobile && (
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 3. Navigation with 8pt Spacing & Refined Active/Hover States */}
      <nav className="sidebar-nav relative z-10 flex-1 space-y-1 overflow-y-auto px-3 pt-5 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Section Title with Higher Tracking & Mint Accent */}
        <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-[#8fae92] uppercase">
          YOUR WORKSPACE
        </p>

        {navItems.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={closeSidebar}
            className={({ isActive }) =>
              cn(
                'group relative isolate flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-200 border border-transparent',
                isActive
                  ? 'text-[#0d2a1a] font-semibold'
                  : 'text-[#d0e0d1]/75 hover:border-white/[0.08] hover:bg-white/[0.06] hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Pill with Soft Multi-layered Shadow & Specular Sheen */}
                {isActive && (
                  <motion.span
                    layoutId={mobile ? 'mobile-sidebar-active' : 'desktop-sidebar-active'}
                    className="absolute inset-0 z-0 rounded-xl bg-gradient-to-r from-[#d9f88c] to-[#cbf478] shadow-[0_4px_20px_rgba(181,230,97,0.22),inset_0_1px_1px_rgba(255,255,255,0.6)]"
                    transition={activeTransition}
                  />
                )}

                {/* Consistent Icon Container with Balanced Stroke & Instant Feedback */}
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

                {/* Nav Label */}
                <span className="relative z-10 truncate text-[13px] tracking-normal">
                  {t(`sidebar.${key}`)}
                </span>

                {/* Active Indicator: Crisp Glowing Dot on the Right Edge */}
                {isActive && (
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

      {/* 4. Refined Footer Polish (Clean 1px Border Top & Crisp Muted Typography) */}
      <div className="relative z-10 border-t border-white/[0.08] px-4 py-3.5 backdrop-blur-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635] shadow-[0_0_6px_#a3e635]" />
              <p className="text-[11px] font-bold text-[#e1efe0] tracking-tight">KhamarBari</p>
            </div>
            <p className="mt-0.5 text-[10px] text-[#8fae92]/70 font-medium">
              © {new Date().getFullYear()} · Smart Agro Systems
            </p>
          </div>
          <span className="rounded-md bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[#b8dab6]">
            v2.4
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AppSidebar() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { sidebarOpen, closeSidebar } = useAppStore()
  const reducedMotion = useReducedMotion()
  const visibleNav = NAV.filter(({ key }) => key !== 'branches' || ['owner', 'admin'].includes(user?.role))

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-[17rem] shrink-0 border-r border-[#143e2b] md:block shadow-[1px_0_12px_rgba(0,0,0,0.1)]">
        <SidebarContent t={t} closeSidebar={closeSidebar} navItems={visibleNav} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-[#03170f]/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.22 }}
              onClick={closeSidebar}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-dvh w-[min(84vw,18rem)] shadow-[20px_0_60px_rgba(0,0,0,0.35)] md:hidden"
              initial={{ x: reducedMotion ? 0 : -28 }}
              animate={{ x: 0 }}
              exit={{ x: reducedMotion ? 0 : -28 }}
              transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <SidebarContent t={t} closeSidebar={closeSidebar} navItems={visibleNav} mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
