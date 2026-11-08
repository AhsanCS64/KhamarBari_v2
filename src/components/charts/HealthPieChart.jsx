import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const cssVar = (name, fallback) =>
  typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
    : fallback

const STATUS = {
  healthy:    cssVar('--color-forest-500', '#10B981'),
  monitoring: cssVar('--color-warn-500',   '#F59E0B'),
  atRisk:     cssVar('--color-alert-500',  '#EF4444'),
  inactive:   cssVar('--color-slate-soft', '#94A3B8'),
}

const TONE = {
  ink:    cssVar('--color-slate-ink',  '#0F172A'),
  muted:  cssVar('--color-slate-soft', '#94A3B8'),
  soft:   cssVar('--color-slate-mid',  '#475569'),
  line:   cssVar('--color-cream-200',  '#E2E8F0'),
  canvas: cssVar('--color-cream-50',   '#FBFDFE'),
}

const statusFor = (name) => {
  const k = String(name ?? '').toLowerCase()
  if (k.includes('health') || k.includes('good') || k.includes('normal'))
    return { color: STATUS.healthy, key: 'healthy', labelKey: 'animalsPage.healthHealthy' }
  if (k.includes('risk') || k.includes('sick') || k.includes('disease') || k.includes('critical') || k.includes('treatment') || k.includes('quarantine') || k.includes('affected'))
    return { color: STATUS.atRisk, key: 'atRisk', labelKey: 'dashboard.sickAffected' }
  if (k.includes('monitor') || k.includes('watch') || k.includes('attention'))
    return { color: STATUS.monitoring, key: 'monitoring', labelKey: 'animalsPage.healthWatch' }
  return { color: STATUS.inactive, key: 'inactive', labelKey: 'dashboard.otherHealth' }
}

// ── Radial gauge geometry ─────────────────────────────────
const SIZE = 260
const CX = SIZE / 2
const CY = SIZE / 2
const R_OUTER = 108
const R_INNER = 88
const START_DEG = 135   // bottom-left
const SWEEP_DEG  = 270  // goes all the way around, gap at bottom
const GAP_DEG    = 2    // gap between segments

const polar = (cx, cy, r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// Build a donut-arc path for a segment from a1 to a2 (in degrees)
const arcPath = (a1, a2) => {
  const large = a2 - a1 > 180 ? 1 : 0
  const o1 = polar(CX, CY, R_OUTER, a1)
  const o2 = polar(CX, CY, R_OUTER, a2)
  const i1 = polar(CX, CY, R_INNER, a2)
  const i2 = polar(CX, CY, R_INNER, a1)
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ')
}

export default function HealthPieChart({ data = [], title, unit = 'items' }) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(null)

  const SEVERITY = { atRisk: 0, monitoring: 1, healthy: 2, inactive: 3 }
  const segments = data
    .map((d, i) => {
      const s = statusFor(d.name)
      const label = t(s.labelKey)
      return { ...d, id: `${s.key}-${i}`, color: d.color ?? s.color, key: s.key, tone: label, name: label }
    })
    .sort((a, b) => SEVERITY[a.key] - SEVERITY[b.key])

  const totalCount = segments.reduce((sum, d) => sum + d.value, 0)
  const total = totalCount || 1
  const atRisk = segments.find((d) => d.key === 'atRisk')?.value ?? 0
  const healthy = segments.find((d) => d.key === 'healthy')?.value ?? 0
  const healthyPct = totalCount ? Math.round((healthy / total) * 100) : 0

  // Lay out arcs left→right across the 270° sweep
  let cursor = START_DEG
  const arcs = segments.map((s) => {
    const slice = (s.value / total) * SWEEP_DEG
    const a1 = cursor
    const a2 = cursor + slice
    cursor = a2
    return { ...s, a1, a2: Math.max(a1 + 0.001, a2 - GAP_DEG / 2) }
  })

  const active = hovered != null ? segments[hovered] : null
  const activePct = active ? Math.round((active.value / total) * 100) : 0

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(180deg, #ffffff 0%, ${TONE.canvas} 100%)`,
        border: `1px solid ${TONE.line}`,
        boxShadow: '0 1px 2px rgba(6,28,21,0.04), 0 12px 32px rgba(6,28,21,0.06)',
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between px-5 pt-5">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: TONE.muted }}
          >
            {title || t('chart.health')}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className="text-[28px] font-bold leading-none tabular-nums"
              style={{ color: TONE.ink }}
            >
              {(active ? active.value : totalCount).toLocaleString()}
            </span>
            <span className="text-xs font-medium" style={{ color: TONE.muted }}>
              {active ? unit : t('dashboard.totalUnit', { unit })}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: 'rgba(16,185,129,0.10)' }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              background: STATUS.healthy,
              boxShadow: `0 0 0 3px ${STATUS.healthy}33`,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: STATUS.healthy }}
          >
            {t('dashboard.live')}
          </span>
        </div>
      </div>

      {/* ── Segmented radial gauge ─────────────────────── */}
      <div className="relative flex justify-center pt-2 pb-1">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Track */}
          <path
            d={arcPath(START_DEG, START_DEG + SWEEP_DEG)}
            fill={TONE.line}
            opacity={0.55}
          />

          {/* Segments */}
          {arcs.map((s, i) => {
            const isHot = hovered === i
            const isDim = hovered != null && !isHot
            return (
              <path
                key={s.id}
                d={arcPath(s.a1, s.a2)}
                fill={s.color}
                opacity={isDim ? 0.22 : 1}
                style={{
                  transition: 'opacity 200ms ease, filter 200ms ease',
                  filter: isHot ? `drop-shadow(0 0 8px ${s.color}99)` : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}

          {/* Outer tick marks — one per status slice, adds instrument feel */}
          {arcs.map((s, i) => {
            const mid = (s.a1 + s.a2) / 2
            const t1 = polar(CX, CY, R_OUTER + 6, mid)
            const t2 = polar(CX, CY, R_OUTER + 12, mid)
            const isHot = hovered === i
            return (
              <line
                key={`t-${s.id}`}
                x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y}
                stroke={isHot ? s.color : TONE.line}
                strokeWidth={isHot ? 2 : 1.5}
                strokeLinecap="round"
                style={{ transition: 'stroke 200ms ease' }}
              />
            )
          })}
        </svg>

        {/* Center readout */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {active ? (
            <>
              <span
                className="text-[34px] font-bold leading-none tabular-nums"
                style={{ color: active.color, transition: 'color 150ms' }}
              >
                {activePct}%
              </span>
              <span
                className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: active.color }}
              >
                {active.tone}
              </span>
            </>
          ) : (
            <>
              <span
                className="text-[40px] font-bold leading-none tabular-nums"
                style={{ color: TONE.ink }}
              >
                {healthyPct}
                <span className="text-lg" style={{ color: TONE.muted }}>%</span>
              </span>
              <span
                className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: TONE.muted }}
              >
                {t('animalsPage.healthHealthy')}
              </span>
              {atRisk > 0 && (
                <span
                  className="mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums"
                  style={{
                    background: 'rgba(239,68,68,0.10)',
                    color: STATUS.atRisk,
                  }}
                >
                  ▲ {t('dashboard.atRiskCount', { count: atRisk.toLocaleString() })}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Status breakdown ───────────────────────────── */}
      <div className="mt-2 border-t px-5 py-4" style={{ borderColor: TONE.line }}>
        <ul className="space-y-1">
          {segments.map((s, i) => {
            const pct = (s.value / total) * 100
            const isHot = hovered === i
            return (
              <li
                key={s.id}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="-mx-2 cursor-pointer rounded-lg px-2 py-2 transition-colors"
                style={{ background: isHot ? `${s.color}10` : 'transparent' }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      background: s.color,
                      boxShadow: isHot ? `0 0 0 3px ${s.color}33` : 'none',
                      transition: 'box-shadow 200ms',
                    }}
                  />
                  <span
                    className="flex-1 truncate text-[13px] font-medium"
                    style={{ color: TONE.ink }}
                  >
                    {s.name}
                  </span>
                  <span
                    className="tabular-nums text-[13px]"
                    style={{ color: TONE.soft }}
                  >
                    {s.value.toLocaleString()}
                  </span>
                  <span
                    className="w-12 text-right text-[12px] font-semibold tabular-nums"
                    style={{ color: isHot ? s.color : TONE.soft }}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div
                  className="mt-1.5 h-[3px] overflow-hidden rounded-full"
                  style={{ background: TONE.line }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: s.color,
                      opacity: hovered == null || isHot ? 1 : 0.35,
                      transition: 'width 500ms cubic-bezier(0.16,1,0.3,1), opacity 200ms',
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.25); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}