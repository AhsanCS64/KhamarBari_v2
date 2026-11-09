import { useId, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Activity, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SIZE = 240
const CENTER = SIZE / 2
const RADIUS = 82
const STROKE = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 5

const STATUS = [
  {
    key: 'healthy',
    gradient: ['#39d99a', '#0b8d5d'],
    label: 'animalsPage.healthHealthy',
    icon: ShieldCheck,
    description: 'dashboard.healthStable',
  },
  {
    key: 'watch',
    gradient: ['#ffd16b', '#d58313'],
    label: 'animalsPage.healthWatch',
    icon: Activity,
    description: 'dashboard.healthMonitor',
  },
  {
    key: 'affected',
    gradient: ['#ff98a0', '#cb3e53'],
    label: 'dashboard.sickAffected',
    icon: HeartPulse,
    description: 'dashboard.healthCare',
  },
]

function getStatus(name) {
  const key = String(name || '').toLowerCase()
  if (key.includes('health') || key.includes('good') || key.includes('normal')) return 'healthy'
  if (key.includes('watch') || key.includes('monitor') || key.includes('attention')) return 'watch'
  return 'affected'
}

function formatValue(value) {
  return Math.round(value).toLocaleString()
}

export default function HealthPieChart({ data = [], title, unit = 'items', scopeLabel }) {
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()
  const chartId = useId().replace(/:/g, '')
  const [pinnedKey, setPinnedKey] = useState(null)
  const [hoveredKey, setHoveredKey] = useState(null)
  const activeKey = pinnedKey || hoveredKey

  const segments = useMemo(() => {
    const values = { healthy: 0, watch: 0, affected: 0 }
    data.forEach((item) => {
      const key = getStatus(item.name)
      values[key] += Math.max(0, Number(item.value) || 0)
    })

    return STATUS.map((status) => ({
      ...status,
      name: t(status.label),
      description: t(status.description),
      value: values[status.key],
    }))
  }, [data, t])

  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const active = segments.find((segment) => segment.key === activeKey)
  const activePercent = active && total ? (active.value / total) * 100 : 0
  const healthyPercent = total ? Math.round((segments[0].value / total) * 100) : 0

  let consumed = 0
  const arcs = segments.map((segment) => {
    const rawLength = total ? (segment.value / total) * CIRCUMFERENCE : 0
    const gap = segment.value > 0 && segments.filter((item) => item.value > 0).length > 1 ? GAP : 0
    const length = Math.max(0, rawLength - gap)
    const offset = consumed + gap / 2
    consumed += rawLength
    return { ...segment, length, offset, percent: total ? (segment.value / total) * 100 : 0 }
  })

  const activate = (key) => setPinnedKey((current) => current === key ? null : key)

  return (
    <section className="relative isolate overflow-hidden rounded-[1.4rem] border border-[#dfece4] bg-[radial-gradient(ellipse_at_12%_0%,rgba(211,244,224,0.72),transparent_38%),linear-gradient(145deg,#fff_5%,#fbfdfb_58%,#f2f8f3_100%)] shadow-[0_16px_44px_rgba(16,54,36,0.08),0_2px_8px_rgba(16,54,36,0.035)]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 -z-10 h-56 w-56 rounded-full bg-emerald-200/20 blur-3xl" />

      <header className="flex items-start justify-between gap-3 border-b border-emerald-950/[0.06] px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-700 text-white shadow-[0_3px_8px_rgba(16,112,72,0.2)]">
              <HeartPulse className="h-3.5 w-3.5" />
            </span>
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.17em] text-emerald-800/65">
              {title || t('chart.health')}
            </p>
          </div>
          <h3 className="mt-2 text-base font-bold tracking-tight text-[#183d2d]">
            {t('dashboard.healthSubtitle', 'Enclosure stock health')}
          </h3>
        </div>

        <span className="inline-flex max-w-[46%] shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-white/80 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-800 shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 ${reducedMotion ? '' : 'animate-ping'}`} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
          </span>
          <span className="truncate">{scopeLabel || t('dashboard.branchScoped', 'Selected branch')}</span>
        </span>
      </header>

      <div className="grid items-center gap-4 p-4 sm:grid-cols-[minmax(210px,0.95fr)_1.05fr] sm:gap-5 sm:p-6">
        <div className="relative mx-auto w-full max-w-[240px]">
          <svg
            className="block h-auto w-full overflow-visible"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={`${formatValue(total)} ${unit}`}
          >
            <defs>
              {STATUS.map((status) => (
                <linearGradient key={status.key} id={`${chartId}-gradient-${status.key}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={status.gradient[0]} />
                  <stop offset="100%" stopColor={status.gradient[1]} />
                </linearGradient>
              ))}
              <radialGradient id={`${chartId}-center-light`}>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f4faf5" />
              </radialGradient>
            </defs>

            <circle cx={CENTER} cy={CENTER} r={RADIUS + 15} fill="none" stroke="#e8f0ea" strokeWidth="1" strokeDasharray="1 6" />
            <circle cx={CENTER} cy={CENTER} r={RADIUS + 7} fill="none" stroke="#e7efe9" strokeWidth="1" />
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#e9f0eb" strokeWidth={STROKE} />
            <circle cx={CENTER} cy={CENTER} r={RADIUS - STROKE / 2 - 7} fill={`url(#${chartId}-center-light)`} />

            {arcs.map((segment) => {
              if (!segment.value) return null
              const isActive = activeKey === segment.key
              const isDimmed = activeKey && !isActive
              return (
                <motion.circle
                  key={segment.key}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={`url(#${chartId}-gradient-${segment.key})`}
                  strokeWidth={isActive ? STROKE + 3 : STROKE}
                  strokeLinecap="round"
                  strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
                  strokeDashoffset={-segment.offset}
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                  initial={reducedMotion ? false : { opacity: 0, strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                  animate={{
                    opacity: isDimmed ? 0.28 : 1,
                    strokeDasharray: `${segment.length} ${CIRCUMFERENCE - segment.length}`,
                  }}
                  transition={{ duration: reducedMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    filter: isActive ? 'drop-shadow(0 3px 5px rgba(13, 74, 45, 0.22))' : undefined,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredKey(segment.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onFocus={() => setHoveredKey(segment.key)}
                  onBlur={() => setHoveredKey(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      activate(segment.key)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={pinnedKey === segment.key}
                  aria-label={`${segment.name}: ${formatValue(segment.value)} (${segment.percent.toFixed(1)}%)`}
                />
              )
            })}

            <circle cx={CENTER} cy={CENTER} r="3" fill="#d7e8dc" />
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={active ? `${active.key}-value` : 'total-value'}
              initial={reducedMotion ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.22 }}
              className="text-[1.8rem] font-bold leading-none tracking-[-0.045em] tabular-nums text-[#183d2d]"
            >
              {formatValue(active ? active.value : total)}
            </motion.span>
            <span className="mt-1.5 max-w-[112px] truncate text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {active ? active.name : unit.split('/')[0].trim()}
            </span>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-white/90 px-2 py-0.5 text-[9px] font-bold text-emerald-800 shadow-sm">
              <Sparkles className="h-2.5 w-2.5 text-emerald-500" />
              {active ? `${activePercent.toFixed(1)}%` : `${healthyPercent}% ${t('animalsPage.healthHealthy')}`}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="mb-3 flex items-end justify-between px-1">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {t('dashboard.healthDistribution', 'Health distribution')}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t('dashboard.healthDistributionHint', 'Based on current enclosure occupancy')}
              </p>
            </div>
            <span className="rounded-lg bg-white/80 px-2 py-1 text-[10px] font-semibold tabular-nums text-slate-500 shadow-sm">
              {formatValue(total)} {unit}
            </span>
          </div>

          {arcs.map((segment, index) => {
            const Icon = segment.icon
            const isActive = activeKey === segment.key
            return (
              <motion.button
                type="button"
                key={segment.key}
                onMouseEnter={() => setHoveredKey(segment.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(segment.key)}
                onBlur={() => setHoveredKey(null)}
                onClick={() => activate(segment.key)}
                initial={reducedMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.28, delay: reducedMotion ? 0 : index * 0.06 }}
                className={`group w-full rounded-2xl border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isActive
                    ? 'border-white bg-white shadow-[0_8px_24px_rgba(19,63,41,0.1)]'
                    : 'border-white/70 bg-white/55 hover:border-emerald-100 hover:bg-white/90'
                }`}
                aria-pressed={pinnedKey === segment.key}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105"
                    style={{ background: `linear-gradient(145deg, ${segment.gradient[0]}, ${segment.gradient[1]})` }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-[#264234]">{segment.name}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-slate-400">{segment.description}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-base font-bold leading-none tabular-nums text-[#183d2d]">
                      {formatValue(segment.value)}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold tabular-nums text-slate-400">
                      {segment.percent.toFixed(1)}%
                    </span>
                  </span>
                </span>
                <span className="mt-3 block h-1 overflow-hidden rounded-full bg-slate-100">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${segment.gradient[0]}, ${segment.gradient[1]})` }}
                    initial={reducedMotion ? false : { width: 0 }}
                    animate={{ width: `${segment.percent}%` }}
                    transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.12 + index * 0.07 }}
                  />
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
