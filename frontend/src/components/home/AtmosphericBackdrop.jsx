import { motion, useReducedMotion } from 'framer-motion'
import { Leaf } from 'lucide-react'

// ─── Scene geometry ─────────────────────────────────────────────────────────
const VB_W = 1440
const VB_H = 800
const SUN_X = 720
const HORIZON_Y = 446

// ─── Particle presets ───────────────────────────────────────────────────────
const LEAF_PRESETS = [
  { id: 1, left: '8%', delay: 0, duration: 18, size: 24, rotation: 120, xOffset: 35 },
  { id: 2, left: '22%', delay: 3, duration: 22, size: 18, rotation: -90, xOffset: -40 },
  { id: 3, left: '38%', delay: 7, duration: 20, size: 20, rotation: 180, xOffset: 25 },
  { id: 4, left: '55%', delay: 1.5, duration: 24, size: 16, rotation: -140, xOffset: -30 },
  { id: 5, left: '72%', delay: 5, duration: 19, size: 22, rotation: 90, xOffset: 45 },
  { id: 6, left: '88%', delay: 8, duration: 23, size: 19, rotation: -160, xOffset: -35 },
  { id: 7, left: '15%', delay: 11, duration: 21, size: 15, rotation: 60, xOffset: 28 },
  { id: 8, left: '47%', delay: 13, duration: 25, size: 21, rotation: -110, xOffset: -38 },
  { id: 9, left: '81%', delay: 2, duration: 17, size: 17, rotation: 150, xOffset: 32 },
]

const SUNBURST_RAYS = Array.from({ length: 19 }, (_, i) => {
  const angle = Math.PI + (Math.PI * i) / 18
  const startRadius = 61
  const compactLength = (i % 2 === 0 ? 48 : 36) + (1 - Math.abs(i - 9) / 9) * 14
  const expandedLength = compactLength + (i % 2 === 0 ? 28 : 22)
  return {
    x1: 180 + Math.cos(angle) * startRadius,
    y1: 174 + Math.sin(angle) * startRadius,
    compactX2: 180 + Math.cos(angle) * (startRadius + compactLength),
    compactY2: 174 + Math.sin(angle) * (startRadius + compactLength),
    expandedX2: 180 + Math.cos(angle) * (startRadius + expandedLength),
    expandedY2: 174 + Math.sin(angle) * (startRadius + expandedLength),
    width: i % 2 === 0 ? 5.2 : 3.8,
  }
})

const STAR_PRESETS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 37.7) % 100}%`,
  top: `${(i * 13.3) % 60}%`,
  size: 1 + (i % 3) * 0.6,
  delay: (i * 0.21) % 4,
  duration: 2 + (i % 5) * 0.8,
}))

const CLOUD_PRESETS = [
  { id: 1, top: '10%', height: 56, width: 320, opacity: 0.1, duration: 75, delay: 0 },
  { id: 2, top: '24%', height: 40, width: 224, opacity: 0.15, duration: 90, delay: 12 },
  { id: 3, top: '42%', height: 32, width: 190, opacity: 0.08, duration: 110, delay: 24 },
  { id: 4, top: '6%', height: 72, width: 420, opacity: 0.06, duration: 140, delay: 40 },
]

const BIRD_PRESETS = [
  { id: 1, top: '12%', duration: 34, delay: 0, scale: 1, yDrift: [0, -30, -12, -38, 0] },
  { id: 2, top: '21%', duration: 42, delay: 7, scale: 0.72, yDrift: [0, 18, -8, 14, 0] },
  { id: 3, top: '17%', duration: 38, delay: 15, scale: 0.84, yDrift: [0, -14, 12, -22, 0] },
]

// ─── Landscape geometry ─────────────────────────────────────────────────────
const MT_FAR_L = 'M-20,452 L-20,318 L58,246 L108,280 L190,170 L262,252 L304,226 L392,322 L452,352 L540,420 L624,448 Z'
const MT_FAR_R = 'M1460,452 L1460,268 L1384,214 L1326,254 L1252,188 L1184,262 L1132,238 L1060,330 L1004,372 L930,424 L848,448 Z'
const MT_MID_L = 'M-20,520 L-20,360 L70,312 L128,350 L214,284 L292,360 L350,330 L430,410 L500,440 L580,462 L660,470 Z'
const MT_MID_R = 'M1460,520 L1460,330 L1398,284 L1338,332 L1262,262 L1190,346 L1140,322 L1070,404 L1000,438 L920,462 L820,470 Z'

const SHADE_FAR = ['M190,170 L172,222 L150,246 L128,298 L108,280 Z', 'M1252,188 L1268,236 L1292,256 L1306,300 L1326,254 Z']
const SHADE_MID = ['M214,284 L200,322 L170,340 L128,350 Z', 'M1262,262 L1276,300 L1306,320 L1338,332 Z']
const SNOW_CAPS = ['M190,170 L163,205 L176,200 L186,214 L198,200 L208,212 L221,205 Z', 'M1252,188 L1217,225 L1232,220 L1244,234 L1258,219 L1270,232 L1288,225 Z']

const HORIZON_RIDGE = 'M-20,472 C200,458 400,452 560,452 C640,444 680,448 720,446 C760,448 800,444 880,452 C1040,452 1240,460 1460,470'
const GROUND_PATH = `${HORIZON_RIDGE} L1460,${VB_H} L-20,${VB_H} Z`
const MID_CREST = 'M-20,500 C150,470 300,505 450,500 C560,495 650,480 720,482 C800,480 900,495 1010,500 C1160,508 1290,470 1460,495'
const MID_HILLS = `${MID_CREST} L1460,${VB_H} L-20,${VB_H} Z`
const FG_L_CREST = 'M-20,540 C100,520 220,560 330,585 C430,606 520,640 560,690'
const FG_L = `${FG_L_CREST} C590,730 560,770 520,800 L-20,800 Z`
const FG_R_CREST = 'M1460,560 C1340,545 1230,585 1120,610 C1020,632 930,660 880,710'
const FG_R = `${FG_R_CREST} C850,745 850,775 860,800 L1460,800 Z`

const RIVER_PTS = [
  [720, 446, 3], [708, 480, 7], [690, 525, 13], [728, 575, 24],
  [772, 625, 38], [728, 680, 56], [676, 735, 78], [700, 790, 102], [708, 830, 115],
]

function smooth(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

const offsetLine = (k) => smooth(RIVER_PTS.map(([x, y, w]) => [x + w * k, y]))
const RIVER_LEFT = offsetLine(-1)
const RIVER_RIGHT = offsetLine(1)
const RIVER_CENTER = offsetLine(0)
const RIVER_SHAPE = `${RIVER_LEFT} ${smooth(RIVER_PTS.map(([x, y, w]) => [x + w, y]).reverse()).replace(/^M/, 'L')} Z`
const LEFT_BANK_CLIP = `M0,${HORIZON_Y} ${RIVER_LEFT.slice(1)} L0,${VB_H} Z`
const RIGHT_BANK_CLIP = `${RIVER_RIGHT} L${VB_W},${VB_H} L${VB_W},${HORIZON_Y} Z`
const RIVER_FLOW_LINES = [
  { path: offsetLine(-0.55), dash: '5 46', duration: 7, width: 2 },
  { path: RIVER_CENTER, dash: '9 70', duration: 5.5, width: 2.6 },
  { path: offsetLine(0.5), dash: '6 54', duration: 8, width: 2 },
]

// ─── Trees ──────────────────────────────────────────────────────────────────
const TREES = [
  ...[110, 150, 196, 244, 296, 352, 410, 470, 530, 590].map((x, i) => ({
    kind: i % 3 === 1 ? 'oak' : 'pine', x, y: 470 - (x / 600) * 18, s: 0.17 + (i % 3) * 0.03, layer: 'far',
  })),
  ...[870, 930, 990, 1050, 1110, 1180, 1250, 1320, 1390].map((x, i) => ({
    kind: i % 3 === 0 ? 'oak' : 'pine', x, y: 458 + ((x - 870) / 520) * 6, s: 0.17 + (i % 3) * 0.03, layer: 'far',
  })),
  ...[40, 98, 160, 222, 290, 360, 430, 500, 580].map((x, i) => ({
    kind: i % 3 === 2 ? 'oak' : 'pine', x, y: 494 + (i % 2) * 4, s: 0.4 + (i % 4) * 0.06, layer: 'mid',
  })),
  ...[820, 880, 960, 1030, 1100, 1170, 1240, 1310, 1380, 1430].map((x, i) => ({
    kind: i % 3 === 1 ? 'oak' : 'pine', x, y: 494 + (i % 2) * 5, s: 0.4 + (i % 4) * 0.06, layer: 'mid',
  })),
  { kind: 'pine', x: 30, y: 585, s: 1.65, layer: 'near' },
  { kind: 'oak', x: 130, y: 578, s: 1.25, layer: 'near' },
  { kind: 'pine', x: 215, y: 594, s: 1.05, layer: 'near' },
  { kind: 'pine', x: 1420, y: 592, s: 1.75, layer: 'near' },
  { kind: 'oak', x: 1325, y: 586, s: 1.3, layer: 'near' },
  { kind: 'pine', x: 1240, y: 610, s: 1.1, layer: 'near' },
]

// ─── Farming layout tables (data-driven rows) ───────────────────────────────
// Wheat rows — three staggered bands with perspective scale
const WHEAT_ROWS = [
  { y: 620, count: 9, spacing: 34, offset: 0, scale: 0.85 },
  { y: 648, count: 10, spacing: 32, offset: 14, scale: 0.95 },
  { y: 680, count: 11, spacing: 30, offset: 6, scale: 1.05 },
]

// ─── NEW: Second wheat field on the right bank (more farmland) ──────────────
const WHEAT_ROWS_RIGHT = [
  { y: 618, count: 8, spacing: 32, offset: 0, scale: 0.82, baseX: 1030 },
  { y: 644, count: 9, spacing: 30, offset: 12, scale: 0.92, baseX: 1030 },
  { y: 672, count: 10, spacing: 28, offset: 5, scale: 1.02, baseX: 1030 },
]

// ─── NEW: Corn rows — a taller crop plot beside the wheat ───────────────────
const CORN_ROWS = [
  { y: 636, count: 5, spacing: 30, offset: 0, scale: 0.8, baseX: 835 },
  { y: 660, count: 6, spacing: 29, offset: 10, scale: 0.9, baseX: 835 },
  { y: 688, count: 7, spacing: 28, offset: 4, scale: 1.0, baseX: 835 },
]

// ─── NEW: Sunflowers — a cheery patch on the left mid-bank ──────────────────
const SUNFLOWER_STALKS = Array.from({ length: 14 }, (_, i) => ({
  x: 300 + (i % 7) * 30 + Math.floor(i / 7) * 12,
  y: 604 + Math.floor(i / 7) * 22,
  s: 0.85 + (i % 4) * 0.08,
}))

// ─── NEW: Plowed furrows — decorative soil strip ────────────────────────────
const FURROW_LINES = Array.from({ length: 9 }, (_, i) => ({
  y: 662 + i * 7,
  x0: 1005 + i * 3,
  x1: 1180 - i * 2,
  opacity: 0.35 - i * 0.025,
}))

// Orchard trees — neat grid on far-left bank
const ORCHARD = [
  { x: 60, y: 560, s: 0.55 }, { x: 110, y: 558, s: 0.55 }, { x: 160, y: 562, s: 0.55 },
  { x: 78, y: 596, s: 0.68 }, { x: 132, y: 594, s: 0.68 }, { x: 186, y: 598, s: 0.68 },
  { x: 96, y: 640, s: 0.85 }, { x: 158, y: 638, s: 0.85 },
]

// ─── NEW: Second orchard block on the right bank ────────────────────────────
const ORCHARD_RIGHT = [
  { x: 1270, y: 566, s: 0.5 }, { x: 1318, y: 564, s: 0.5 }, { x: 1366, y: 568, s: 0.5 },
  { x: 1290, y: 604, s: 0.64 }, { x: 1344, y: 602, s: 0.64 },
  { x: 1310, y: 646, s: 0.8 },
]

// Vegetable plot rows — cabbages on right bank
const VEG_ROWS = [
  { y: 620, count: 8, spacing: 26, offset: 0, scale: 0.85, color: '#6fa64c' },
  { y: 648, count: 9, spacing: 24, offset: 10, scale: 0.95, color: '#7ab356' },
  { y: 676, count: 10, spacing: 22, offset: 4, scale: 1.05, color: '#88c162' },
]

// Trellis vine posts on far-right
const TRELLIS_POSTS = Array.from({ length: 6 }, (_, i) => ({ x: 1210 + i * 32, y: 660 + i * 6 }))

// Hay bale cluster
const HAY_BALES = [
  { x: 548, y: 570, r: 12 }, { x: 568, y: 574, r: 11 },
  { x: 556, y: 551, r: 10 },
]

// Hay bales beside the right farmhouse
const HAY_BALES_RIGHT = [
  { x: 1044, y: 558, r: 12 }, { x: 1064, y: 562, r: 11 },
  { x: 1052, y: 540, r: 10 },
]

// ─── NEW: Wooden fence run (small decorative paddock divider) ───────────────
const FENCE_POSTS = Array.from({ length: 10 }, (_, i) => ({
  x: 380 + i * 22,
  y: 646 + Math.sin(i * 0.7) * 2,
}))

// ─── NEW: Pond + duck + fish data ───────────────────────────────────────────
const DUCK_PRESETS = [
  { id: 'mama', x: 288, y: 726, s: 1.0, facing: 1 },
  { id: 'd1', x: 262, y: 734, s: 0.62, facing: 1 },
  { id: 'd2', x: 274, y: 742, s: 0.58, facing: -1 },
  { id: 'd3', x: 306, y: 740, s: 0.6, facing: 1 },
]

const FISH_PRESETS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  cx: -34 + (i % 3) * 27,
  cy: -6 + Math.floor(i / 3) * 10,
  dur: 2.4 + (i % 3) * 0.6,
  delay: i * 0.4,
  scale: 0.7 + (i % 2) * 0.2,
}))

const BANK_GRASS_TUFTS = Array.from({ length: 110 }, (_, i) => ({
  id: i,
  x: 18 + ((i * 83) % 1400),
  y: 530 + ((i * 47) % 260),
  height: 5 + ((i * 7) % 8),
  lean: i % 2 === 0 ? 1 : -1,
  flower: i % 13 === 0,
}))

// ─── Theme definitions ──────────────────────────────────────────────────────
const THEMES = {
  meadow: {
    skyGradient: 'linear-gradient(180deg, #0b3d2b 0%, #11573c 45%, #186a4a 80%, #1e7d58 100%)',
    sunColor: '#fde047', sunGlow: 'rgba(253, 224, 71, 0.45)', sunCorona: 'rgba(250, 204, 21, 0.22)',
    hillFront: '#124833', hillBack: '#0d3726', hillDeep: '#082418',
    mtFar: '#1a6a4c', mtMid: '#124a35',
    treeFar: '#0f4a33', treeMid: '#0c3a28', treeNear: '#07291c',
    fog: '#a7f3d0', particleColor: 'text-emerald-300/60', accentGlow: 'rgba(74, 222, 128, 0.15)',
    waterColor: 'rgba(94, 234, 212, 0.35)', riverColor: '#1686a3',
    starOpacity: 0, aurora: false, butterflies: true, fireflies: false,
    // farm palette
    soil: '#3d2a17', soilLight: '#5c402a',
    wheat: '#e8c86a', wheatShade: '#c9a548',
    cropGreen: '#7ab356', cropDark: '#4a7a2c',
    wood: '#7a5230', woodLight: '#a07048',
    barnRed: '#a83c2a', barnDark: '#7a2818',
  },
  harvest: {
    skyGradient: 'linear-gradient(180deg, #2b1f0d 0%, #452e12 35%, #633e13 70%, #825016 100%)',
    sunColor: '#fbbf24', sunGlow: 'rgba(251, 191, 36, 0.55)', sunCorona: 'rgba(245, 158, 11, 0.28)',
    hillFront: '#3d250c', hillBack: '#2e1b09', hillDeep: '#1f1206',
    mtFar: '#6a4416', mtMid: '#4d3010',
    treeFar: '#6b4417', treeMid: '#4a2e0f', treeNear: '#2c1a08',
    fog: '#fde68a', particleColor: 'text-amber-300/70', accentGlow: 'rgba(245, 158, 11, 0.2)',
    waterColor: 'rgba(251, 191, 36, 0.35)', riverColor: '#2687a8',
    starOpacity: 0, aurora: false, butterflies: true, fireflies: false,
    soil: '#4a2e12', soilLight: '#6b4420',
    wheat: '#f0d068', wheatShade: '#c9a03a',
    cropGreen: '#8a9a3c', cropDark: '#5c6a20',
    wood: '#8a5a2c', woodLight: '#b88040',
    barnRed: '#b8452c', barnDark: '#8a2e18',
  },
  dusk: {
    skyGradient: 'linear-gradient(180deg, #06181b 0%, #092c30 40%, #0c3e38 75%, #10493b 100%)',
    sunColor: '#a5e8ff', sunGlow: 'rgba(125, 211, 252, 0.34)', sunCorona: 'rgba(125, 211, 252, 0.2)',
    hillFront: '#09252d', hillBack: '#061c25', hillDeep: '#020f19',
    mtFar: '#16475a', mtMid: '#103746',
    treeFar: '#174d59', treeMid: '#103943', treeNear: '#061d27',
    fog: '#a5d9ef', particleColor: 'text-teal-200/75', accentGlow: 'rgba(45, 212, 191, 0.16)',
    waterColor: 'rgba(45, 212, 191, 0.3)', riverColor: '#167e9e',
    starOpacity: 0.55, aurora: true, butterflies: false, fireflies: true,
    soil: '#0e2630', soilLight: '#1a3a42',
    wheat: '#c9b86a', wheatShade: '#8a7a40',
    cropGreen: '#4a8a6a', cropDark: '#2a5a44',
    wood: '#4a5a5c', woodLight: '#6a7a7c',
    barnRed: '#5a3a3a', barnDark: '#3a2020',
  },
  morning: {
    skyGradient: 'linear-gradient(180deg, #092f20 0%, #0d462f 35%, #136041 70%, #1a7852 100%)',
    sunColor: '#fed766', sunGlow: 'rgba(254, 215, 102, 0.55)', sunCorona: 'rgba(253, 224, 71, 0.28)',
    hillFront: '#0d3f2b', hillBack: '#082a1d', hillDeep: '#041a11',
    mtFar: '#176648', mtMid: '#0f4a33',
    treeFar: '#125a3b', treeMid: '#0d452e', treeNear: '#062a1b',
    fog: '#fef08a', particleColor: 'text-yellow-200/65', accentGlow: 'rgba(250, 204, 21, 0.18)',
    waterColor: 'rgba(254, 240, 138, 0.28)', riverColor: '#1686a3',
    starOpacity: 0, aurora: false, butterflies: true, fireflies: false,
    soil: '#33241a', soilLight: '#4d3826',
    wheat: '#ead77a', wheatShade: '#c9b050',
    cropGreen: '#7ab85c', cropDark: '#4a8030',
    wood: '#6b4a2c', woodLight: '#93703e',
    barnRed: '#a03a28', barnDark: '#702818',
  },
}

// ─── Sub-components (environment) ───────────────────────────────────────────
function StarField({ opacity, reducedMotion }) {
  if (reducedMotion || opacity === 0) return null
  return (
    <div className="absolute inset-0" style={{ opacity }}>
      {STAR_PRESETS.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, boxShadow: `0 0 ${s.size * 3}px rgba(255,255,255,0.9)` }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.2, 0.7] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  )
}

function Aurora({ reducedMotion }) {
  const ribbons = [
    { color: '#5eead4', opacity: 0.42, duration: 19, delay: 0, path: 'M -200 150 C 100 20, 260 250, 520 115 S 950 20, 1250 145 S 1600 60, 1850 130' },
    { color: '#818cf8', opacity: 0.32, duration: 25, delay: -7, path: 'M -200 100 C 100 240, 300 0, 580 125 S 920 260, 1200 95 S 1550 180, 1850 70' },
    { color: '#a78bfa', opacity: 0.28, duration: 22, delay: -12, path: 'M -200 120 C 120 0, 330 190, 600 85 S 980 180, 1250 55 S 1550 130, 1850 90' },
  ]
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[58%] overflow-hidden" aria-hidden="true"
      style={{ maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)' }}>
      <motion.div className="absolute inset-0" animate={reducedMotion ? undefined : { opacity: [0.7, 1, 0.75] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}>
        <svg viewBox="0 0 1440 420" preserveAspectRatio="xMidYMin slice" className="h-full w-full overflow-visible" fill="none">
          <defs>
            {ribbons.map((r, i) => (
              <linearGradient key={i} id={`aurora-gradient-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={r.color} stopOpacity="0" />
                <stop offset="30%" stopColor={r.color} stopOpacity="0.8" />
                <stop offset="65%" stopColor={r.color} stopOpacity="0.65" />
                <stop offset="100%" stopColor={r.color} stopOpacity="0" />
              </linearGradient>
            ))}
            <filter id="aurora-blur"><feGaussianBlur stdDeviation="24" /></filter>
          </defs>
          {ribbons.map((r, i) => (
            <motion.g key={i}
              animate={reducedMotion ? undefined : { x: [0, i % 2 === 0 ? 65 : -55, 0], y: [0, i % 2 === 0 ? 16 : -18, 0], scaleY: [1, 1.15, 0.92, 1] }}
              transition={{ duration: r.duration, delay: r.delay, repeat: Infinity, ease: 'easeInOut' }}>
              <path d={r.path} stroke={r.color} strokeWidth="100" strokeLinecap="round" opacity={r.opacity} filter="url(#aurora-blur)" />
              <path d={r.path} stroke={`url(#aurora-gradient-${i})`} strokeWidth="38" strokeLinecap="round" opacity={r.opacity + 0.12} />
            </motion.g>
          ))}
        </svg>
      </motion.div>
    </div>
  )
}

function Butterflies({ reducedMotion }) {
  if (reducedMotion) return null
  const flies = [
    { id: 1, x: '28%', y: '66%', delay: 0, duration: 11 },
    { id: 2, x: '64%', y: '72%', delay: 2.5, duration: 13 },
    { id: 3, x: '82%', y: '78%', delay: 5, duration: 9 },
  ]
  return (
    <div className="absolute inset-0">
      {flies.map((f) => (
        <motion.div key={f.id} className="absolute text-yellow-200/80" style={{ left: f.x, top: f.y }}
          animate={{ x: [0, 26, -18, 12, 0], y: [0, -22, -38, -12, 0], rotate: [0, 12, -12, 4, 0] }}
          transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}>
          <motion.div animate={{ rotateY: [0, 180, 0] }} transition={{ duration: 0.42, repeat: Infinity }}>
            <svg width="12" height="10" viewBox="0 0 16 12" fill="currentColor" opacity="0.85">
              <path d="M8 6C6 1 1 0 0 3C0 6 4 7 8 6Z" /><path d="M8 6C10 1 15 0 16 3C16 6 12 7 8 6Z" />
            </svg>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

function Fireflies({ reducedMotion }) {
  if (reducedMotion) return null
  return (
    <div className="absolute inset-0">
      {[...Array(10)].map((_, i) => (
        <motion.div key={`firefly-${i}`} className="absolute h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_#fde047]"
          style={{ top: `${40 + ((i * 4.7) % 50)}%`, left: `${(i * 7.5 + 4) % 94}%` }}
          animate={{ opacity: [0.1, 1, 0.2, 0.9, 0.1], scale: [0.8, 1.4, 0.9, 1.3, 0.8], x: [0, (i % 2 === 0 ? 1 : -1) * 35, 0], y: [0, (i % 3 === 0 ? -1 : 1) * 25, 0] }}
          transition={{ duration: 4.5 + (i % 4), repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }} />
      ))}
    </div>
  )
}

function CloudLayer({ reducedMotion }) {
  return (
    <>
      {CLOUD_PRESETS.map((c) => (
        <motion.div key={c.id} className="absolute left-0 rounded-full bg-white blur-xl"
          style={{ top: c.top, height: c.height, width: c.width, opacity: c.opacity }}
          animate={reducedMotion ? undefined : { x: ['-25%', '125vw'] }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'linear' }} />
      ))}
    </>
  )
}

function BirdFlock({ reducedMotion }) {
  if (reducedMotion) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes backdropBirdWingLeft {
          0%, 100% { transform: rotate(42deg); }
          50% { transform: rotate(-18deg); }
        }
        @keyframes backdropBirdWingRight {
          0%, 100% { transform: rotate(-42deg); }
          50% { transform: rotate(18deg); }
        }
      `}</style>
      {BIRD_PRESETS.map((bird, index) => {
        const size = bird.scale || 1
        const flapDuration = 0.82 + index * 0.12
        return (
          <motion.div key={bird.id} className="absolute left-0"
            style={{ top: bird.top, width: 92 * size, height: 54 * size, opacity: 0.44 + size * 0.18, willChange: 'transform' }}
            initial={{ x: '-14vw', y: 0, opacity: 0 }}
            animate={{ x: '112vw', y: bird.yDrift, opacity: [0, 0.9, 0.9, 0] }}
            transition={{
              x: { duration: bird.duration, delay: bird.delay, repeat: Infinity, repeatType: 'loop', ease: 'linear' },
              y: { duration: bird.duration, delay: bird.delay, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' },
              opacity: { duration: bird.duration, delay: bird.delay, repeat: Infinity, repeatType: 'loop', ease: 'linear', times: [0, 0.12, 0.88, 1] },
            }}>
            <svg viewBox="0 0 96 56" className="h-full w-full overflow-visible" fill="none">
              <g className="backdrop-bird-wing-left"
                style={{ transformBox: 'view-box', transformOrigin: '52px 24px', animation: `backdropBirdWingLeft ${flapDuration}s ease-in-out ${bird.delay}s infinite` }}>
                <path d="M 52 24 C 43 12 27 4 14 3 C 20 15 33 25 49 30 Z" fill="#8fbac4" />
              </g>
              <g className="backdrop-bird-wing-right"
                style={{ transformBox: 'view-box', transformOrigin: '52px 24px', animation: `backdropBirdWingRight ${flapDuration}s ease-in-out ${bird.delay + flapDuration * 0.08}s infinite` }}>
                <path d="M 52 24 C 61 12 74 5 84 4 C 79 16 68 25 55 30 Z" fill="#c6e7ea" />
              </g>
              <g fill="#a9cbd1" stroke="#d8eff1" strokeWidth="0.65" strokeLinejoin="round">
                <path d="M 42 27 Q 34 22 24 20 Q 29 27 40 30 Z" />
                <path d="M 41 29 Q 31 28 21 29 Q 29 34 40 32 Z" />
                <path d="M 41 31 Q 32 34 25 39 Q 34 39 42 34 Z" />
              </g>
              <path d="M 42 29 Q 34 28 27 29" fill="none" stroke="#7eaab3" strokeWidth="0.8" strokeLinecap="round" />
              <path d="M 37 27 C 42 22 48 18 54 18 C 57 13 61 11 66 13 C 70 15 71 20 68 23 C 64 26 60 27 56 27 C 50 31 44 32 37 30 Z" fill="#effbfc" stroke="#c3e3e7" strokeWidth="0.8" />
              <path d="M 67 15 L 78 17 L 69 20 Z" fill="#eccd92" />
              <circle cx="65" cy="15" r="0.9" fill="#18323b" />
            </svg>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Trees ──────────────────────────────────────────────────────────────────
function TreeShape({ kind, fill, rim }) {
  if (kind === 'oak') {
    return (
      <>
        <path d="M-3,2 L-2,-28 L2,-28 L3,2 Z" fill={fill} />
        <g fill={fill}>
          <circle cx="0" cy="-52" r="26" /><circle cx="-18" cy="-40" r="18" />
          <circle cx="18" cy="-40" r="18" /><circle cx="-2" cy="-72" r="16" />
        </g>
        <g fill={rim} opacity="0.15"><circle cx="10" cy="-58" r="15" /><circle cx="22" cy="-42" r="11" /></g>
      </>
    )
  }
  return (
    <>
      <rect x="-3" y="-10" width="6" height="12" rx="1" fill={fill} />
      <path d="M0,-104 L-16,-70 L-8,-70 L-24,-40 L-12,-40 L-30,-10 L30,-10 L12,-40 L24,-40 L8,-70 L16,-70 Z" fill={fill} />
      <path d="M0,-104 L16,-70 L8,-70 L24,-40 L12,-40 L30,-10 L0,-10 Z" fill={rim} opacity="0.15" />
    </>
  )
}

function Tree({ tree, theme, reducedMotion, index }) {
  const fill = tree.layer === 'far' ? theme.treeFar : tree.layer === 'mid' ? theme.treeMid : theme.treeNear
  const swayable = tree.layer === 'near' && !reducedMotion
  const shape = <g opacity={tree.layer === 'far' ? 0.85 : 1}><TreeShape kind={tree.kind} fill={fill} rim={theme.sunColor} /></g>
  return (
    <g transform={`translate(${tree.x} ${tree.y}) scale(${tree.s})`}>
      {swayable ? (
        <motion.g style={{ originX: 0.5, originY: 1 }} animate={{ rotate: [-0.9, 0.9, -0.9] }}
          transition={{ duration: 6 + (index % 4), repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}>
          {shape}
        </motion.g>
      ) : shape}
    </g>
  )
}

// ─── NEW: Farmstead (rear, decorative — kept from original, cleaner) ────────
function Farmstead({ x, y, theme, mood }) {
  const night = mood === 'dusk'
  const wall = night ? '#718f91' : '#e4d9b8'
  const roof = night ? '#345563' : theme.barnRed
  const roofLight = night ? '#527b83' : theme.woodLight
  const wood = night ? '#705e49' : theme.wood
  const window = night ? '#f5d58d' : '#f9e7b7'
  const dark = night ? '#183d45' : '#574b3a'

  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-65 5 Q-20 -7 20 2 T115 4" fill="none" stroke={theme.cropGreen} strokeWidth="12" strokeLinecap="round" opacity=".4" />
      <path d="M38 -39 V-59 H48 V-35" fill={night ? '#506f78' : '#c5b995'} />
      <path d="M36 -59 H50 V-55 H36 Z" fill={roof} />
      {!night && (
        <g fill="none" stroke="#f4ead5" strokeWidth="3" strokeLinecap="round" opacity=".5">
          <path d="M43 -62 Q36 -69 44 -74" /><path d="M48 -67 Q55 -74 49 -80" opacity=".65" />
        </g>
      )}
      <path d="M-7 2 V-33 L24 -56 L58 -33 V2 Z" fill={dark} opacity=".16" />
      <path d="M-5 0 V-32 L24 -52 L55 -32 V0 Z" fill={wall} />
      <path d="M-5 -32 L24 -52 V0 H-5 Z" fill={night ? '#506f78' : '#c5b995'} opacity=".22" />
      <path d="M-12 -31 L24 -59 L63 -31 L56 -27 L24 -51 L-5 -27 Z" fill={roof} />
      <path d="M-8 -31 L24 -55 L58 -31" fill="none" stroke={roofLight} strokeWidth="2.5" />
      <path d="M15 0 V-23 Q24 -29 33 -23 V0 Z" fill={wood} />
      <circle cx="29" cy="-12" r="1.2" fill="#e8c78c" />
      {[-1, 39].map((wx) => (
        <g key={wx}>
          <rect x={wx} y="-30" width="10" height="11" rx="1" fill={dark} />
          <rect x={wx + 1} y="-29" width="8" height="9" rx=".5" fill={window} />
        </g>
      ))}
      <path d="M-8 0 H59" stroke={wood} strokeWidth="3" />
      <g transform="translate(82 -2)">
        <path d="M-10 -1 L-8 -36 H9 L11 -1 Z" fill={night ? '#799a9b' : '#c6c5a5'} />
        <path d="M-11 -36 Q0 -44 12 -36 L9 -32 H-9 Z" fill={roof} />
        <path d="M-8 -29 H9 M-9 -12 H10" stroke={night ? '#506f78' : '#aaa98c'} strokeWidth="1.5" />
      </g>
    </g>
  )
}

function FarmBillboard({ x, y, mood }) {
  const night = mood === 'dusk'
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="2" rx="39" ry="4" fill="#071b20" opacity=".24" />
      <path d="M-25 -8 V8 M25 -8 V8" stroke={night ? '#6d8180' : '#745536'} strokeWidth="3" />
      <rect x="-43" y="-47" width="86" height="40" rx="3" fill={night ? '#d9e8dc' : '#fff8df'} stroke={night ? '#9ebbb4' : '#d3b878'} strokeWidth="2" />
      <rect x="-39" y="-43" width="78" height="32" rx="2" fill={night ? '#eaf2e8' : '#fffdf0'} />
      <image href="/sprout.svg" x="-10" y="-41" width="20" height="20" preserveAspectRatio="xMidYMid meet" />
      <text x="0" y="-15" textAnchor="middle" fill={night ? '#234d42' : '#17512f'} fontSize="7" fontWeight="700" letterSpacing=".4">
        Khamar Bari
      </text>
      <path d="M-26 8 H-20 M20 8 H26" stroke={night ? '#6d8180' : '#745536'} strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

function RiverBridge({ x, y, mood }) {
  const night = mood === 'dusk'
  const stone = night ? '#607d7c' : '#a99776'
  const stoneLight = night ? '#91aaa2' : '#d1bc91'

  return (
    <g transform={`translate(${x} ${y}) scale(.55)`}>
      <path d="M-43 -4 Q0 9 43 -4 L39 2 Q0 14 -39 2 Z" fill={stone} />
      <path d="M-31 2 Q0 12 31 2" fill="none" stroke={stoneLight} strokeWidth="1.4" opacity=".8" />
      <path d="M-47 -7 Q0 0 47 -7 L43 -2 Q0 5 -43 -2 Z" fill={stoneLight} stroke={stone} strokeWidth="1.5" />
      <path d="M-44 -9 Q0 -2 44 -9" fill="none" stroke={stone} strokeWidth="1.5" strokeLinecap="round" />
      {[-35, -18, 0, 18, 35].map((postX) => (
        <path key={postX} d={`M${postX} ${-7 + Math.abs(postX) * 0.05} V${-12 + Math.abs(postX) * 0.05}`}
          stroke={stone} strokeWidth="1.2" strokeLinecap="round" />
      ))}
      <path d="M-40 -12 Q0 -5 40 -12" fill="none" stroke={stone} strokeWidth="1.7" strokeLinecap="round" />
    </g>
  )
}

// ─── NEW: Windmill ──────────────────────────────────────────────────────────
function Windmill({ x, y, theme, reducedMotion }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="2" rx="20" ry="3" fill="#000" opacity="0.25" />
      {/* tower */}
      <path d="M-14 0 L-8 -70 L8 -70 L14 0 Z" fill={theme.wood} />
      <path d="M-8 -70 L8 -70 L12 0 L0 0 Z" fill={theme.woodLight} opacity="0.5" />
      {/* cap */}
      <path d="M-10 -70 Q0 -80 10 -70 Z" fill={theme.barnDark} />
      {/* blades */}
      <motion.g style={{ originX: '0px', originY: '-70px' }}
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}>
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a} 0 -70)`}>
            <line x1="0" y1="-70" x2="0" y2="-118" stroke={theme.woodLight} strokeWidth="2" />
            <rect x="-5" y="-118" width="10" height="24" fill={theme.wheat} opacity="0.9" />
          </g>
        ))}
        <circle cx="0" cy="-70" r="4" fill={theme.wood} />
      </motion.g>
      {/* door */}
      <rect x="-4" y="-14" width="8" height="14" rx="1" fill={theme.woodLight} opacity="0.6" />
    </g>
  )
}

// ─── NEW: Water wheel ───────────────────────────────────────────────────────
function WaterWheel({ x, y, theme, reducedMotion }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* support */}
      <rect x="-3" y="-38" width="6" height="38" fill={theme.wood} />
      <line x1="-16" y1="-34" x2="16" y2="-34" stroke={theme.wood} strokeWidth="3" />
      {/* wheel */}
      <motion.g style={{ originX: '0px', originY: '-22px' }}
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
        <circle cx="0" cy="-22" r="18" fill="none" stroke={theme.wood} strokeWidth="2.5" />
        {[0, 45, 90, 135].map((a) => (
          <line key={a} x1={-Math.cos((a * Math.PI) / 180) * 18} y1={-22 - Math.sin((a * Math.PI) / 180) * 18}
            x2={Math.cos((a * Math.PI) / 180) * 18} y2={-22 + Math.sin((a * Math.PI) / 180) * 18}
            stroke={theme.wood} strokeWidth="1.5" />
        ))}
        <circle cx="0" cy="-22" r="3" fill={theme.wood} />
      </motion.g>
      {/* splash */}
      {!reducedMotion && (
        <motion.g animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <circle cx="-14" cy="-4" r="2" fill="#e0fff8" opacity="0.7" />
          <circle cx="8" cy="-2" r="1.5" fill="#e0fff8" opacity="0.6" />
        </motion.g>
      )}
    </g>
  )
}

// ─── NEW: Tractor ───────────────────────────────────────────────────────────
function Tractor({ x, y, theme, reducedMotion }) {
  return (
    <motion.g
      transform={`translate(${x} ${y})`}
      animate={reducedMotion ? undefined : { x: [0, 180, 0] }}
      transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}>
      {/* body */}
      <rect x="-30" y="-16" width="46" height="18" rx="3" fill={theme.barnRed} />
      <rect x="-22" y="-30" width="22" height="16" rx="2" fill={theme.barnRed} />
      <rect x="-19" y="-27" width="8" height="8" fill={theme.hillBack} opacity="0.5" />
      {/* exhaust */}
      <rect x="-26" y="-32" width="2" height="8" fill={theme.wood} />
      {/* big rear wheel */}
      <motion.g style={{ originX: '-22px', originY: '4px' }}
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
        <circle cx="-22" cy="4" r="13" fill="#1a1a1a" />
        <circle cx="-22" cy="4" r="7" fill="#3a3a3a" />
        <line x1="-22" y1="-8" x2="-22" y2="16" stroke="#5a5a5a" strokeWidth="1.5" />
      </motion.g>
      {/* small front wheel */}
      <motion.g style={{ originX: '12px', originY: '4px' }}
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}>
        <circle cx="12" cy="4" r="8" fill="#1a1a1a" />
        <circle cx="12" cy="4" r="4" fill="#3a3a3a" />
      </motion.g>
      {/* dust puffs */}
      {!reducedMotion && (
        <motion.g animate={{ opacity: [0.4, 0, 0.4], x: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}>
          <circle cx="-38" cy="0" r="4" fill={theme.soilLight} opacity="0.5" />
          <circle cx="-44" cy="-3" r="3" fill={theme.soilLight} opacity="0.4" />
        </motion.g>
      )}
    </motion.g>
  )
}

// ─── NEW: Wheat field (rows of swaying stalks) ──────────────────────────────
function WheatField({ theme }) {
  return (
    <g>
      {/* soil base under the wheat */}
      <ellipse cx="440" cy="690" rx="120" ry="26" fill={theme.soil} opacity="0.55" />
      {WHEAT_ROWS.map((row, ri) =>
        Array.from({ length: row.count }).map((_, ci) => {
          const x = 350 + ci * row.spacing + row.offset
          return (
            <g key={`${ri}-${ci}`}>
              <line x1={x} y1={row.y + 12 * row.scale} x2={x} y2={row.y - 14 * row.scale}
                stroke={theme.cropDark} strokeWidth={1.8 * row.scale} strokeLinecap="round" />
              {/* wheat head */}
              <ellipse cx={x} cy={row.y - 16 * row.scale} rx={2.8 * row.scale} ry={6 * row.scale}
                fill={theme.wheat} />
              <ellipse cx={x} cy={row.y - 16 * row.scale} rx={2.8 * row.scale} ry={6 * row.scale}
                fill={theme.wheatShade} opacity="0.35" />
            </g>
          )
        })
      )}
    </g>
  )
}

// ─── NEW: Second wheat field (right bank) — more farmland ───────────────────
function WheatFieldRight({ theme }) {
  return (
    <g>
      <ellipse cx="1105" cy="690" rx="118" ry="24" fill={theme.soil} opacity="0.5" />
      {WHEAT_ROWS_RIGHT.map((row, ri) =>
        Array.from({ length: row.count }).map((_, ci) => {
          const x = row.baseX + ci * row.spacing + row.offset
          return (
            <g key={`wfr-${ri}-${ci}`}>
              <line x1={x} y1={row.y + 12 * row.scale} x2={x} y2={row.y - 14 * row.scale}
                stroke={theme.cropDark} strokeWidth={1.7 * row.scale} strokeLinecap="round" />
              <ellipse cx={x} cy={row.y - 15 * row.scale} rx={2.6 * row.scale} ry={5.4 * row.scale}
                fill={theme.wheat} />
              <ellipse cx={x} cy={row.y - 15 * row.scale} rx={2.6 * row.scale} ry={5.4 * row.scale}
                fill={theme.wheatShade} opacity="0.32" />
            </g>
          )
        })
      )}
    </g>
  )
}

// ─── NEW: Corn field — taller stalks with cobs ─────────────────────────────
function CornField({ theme }) {
  return (
    <g>
      <ellipse cx="920" cy="686" rx="88" ry="22" fill={theme.soil} opacity="0.52" />
      {CORN_ROWS.map((row, ri) =>
        Array.from({ length: row.count }).map((_, ci) => {
          const x = row.baseX + ci * row.spacing + row.offset
          const h = 30 * row.scale
          return (
            <g key={`corn-${ri}-${ci}`}>
              {/* stalk */}
              <line x1={x} y1={row.y + 8} x2={x} y2={row.y - h}
                stroke={theme.cropDark} strokeWidth={1.6 * row.scale} strokeLinecap="round" />
              {/* upper leaves */}
              <path d={`M${x} ${row.y - h * 0.35} q ${8 * row.scale} ${-4 * row.scale} ${13 * row.scale} ${-10 * row.scale}`}
                fill="none" stroke={theme.cropGreen} strokeWidth={2.2 * row.scale} strokeLinecap="round" />
              <path d={`M${x} ${row.y - h * 0.55} q ${-8 * row.scale} ${-4 * row.scale} ${-13 * row.scale} ${-10 * row.scale}`}
                fill="none" stroke={theme.cropGreen} strokeWidth={2.2 * row.scale} strokeLinecap="round" />
              {/* tassel */}
              <circle cx={x} cy={row.y - h - 2} r={2.4 * row.scale} fill={theme.wheat} />
              {/* cob */}
              <ellipse cx={x + 2} cy={row.y - h * 0.5} rx={2.4 * row.scale} ry={5 * row.scale}
                fill="#e8c25a" opacity="0.9" />
            </g>
          )
        })
      )}
    </g>
  )
}

// ─── NEW: Sunflower patch ───────────────────────────────────────────────────
function SunflowerPatch({ theme }) {
  return (
    <g>
      <ellipse cx="395" cy="632" rx="110" ry="20" fill={theme.soil} opacity="0.4" />
      {SUNFLOWER_STALKS.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
          <line x1="0" y1="0" x2="0" y2="-26" stroke={theme.cropDark} strokeWidth="2" />
          <path d="M0 -12 q 6 -4 10 -8" fill="none" stroke={theme.cropGreen} strokeWidth="1.6" />
          <path d="M0 -18 q -6 -4 -10 -8" fill="none" stroke={theme.cropGreen} strokeWidth="1.6" />
          {/* petals */}
          <g transform="translate(0 -30)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 6}
                cy={Math.sin((a * Math.PI) / 180) * 6}
                rx="3" ry="2" transform={`rotate(${a} 0 0)`} fill="#f7d23a" />
            ))}
            <circle cx="0" cy="0" r="4.2" fill="#6b4420" />
            <circle cx="0" cy="0" r="2.4" fill="#3a250f" />
          </g>
        </g>
      ))}
    </g>
  )
}

// ─── NEW: Plowed furrow strip ──────────────────────────────────────────────
function PlowedFurrows({ theme }) {
  return (
    <g>
      {FURROW_LINES.map((f, i) => (
        <path key={i} d={`M${f.x0} ${f.y} Q ${(f.x0 + f.x1) / 2} ${f.y - 3} ${f.x1} ${f.y}`}
          stroke={theme.soilLight} strokeWidth="2.4" strokeLinecap="round"
          fill="none" opacity={f.opacity} />
      ))}
    </g>
  )
}

// ─── NEW: Scarecrow ─────────────────────────────────────────────────────────
function Scarecrow({ x, y, theme }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="2" rx="10" ry="2" fill="#000" opacity="0.25" />
      {/* pole */}
      <line x1="0" y1="0" x2="0" y2="-52" stroke={theme.wood} strokeWidth="3" />
      {/* arms */}
      <line x1="-18" y1="-38" x2="18" y2="-38" stroke={theme.wood} strokeWidth="2.5" />
      {/* shirt */}
      <rect x="-11" y="-42" width="22" height="20" rx="2" fill={theme.barnRed} opacity="0.85" />
      {/* head */}
      <circle cx="0" cy="-52" r="8" fill={theme.wheat} />
      <circle cx="-3" cy="-53" r="1" fill="#2a1a10" />
      <circle cx="3" cy="-53" r="1" fill="#2a1a10" />
      <path d="M-3 -48 Q0 -46 3 -48" stroke="#2a1a10" strokeWidth="0.8" fill="none" />
      {/* hat */}
      <ellipse cx="0" cy="-58" rx="11" ry="3" fill={theme.wood} />
      <rect x="-5" y="-66" width="10" height="8" rx="1" fill={theme.wood} />
      {/* straw tufts */}
      <line x1="-18" y1="-38" x2="-22" y2="-34" stroke={theme.wheat} strokeWidth="1.5" />
      <line x1="18" y1="-38" x2="22" y2="-34" stroke={theme.wheat} strokeWidth="1.5" />
    </g>
  )
}

// ─── NEW: Hay bales ─────────────────────────────────────────────────────────
function HayBales({ theme }) {
  return (
    <g>
      {HAY_BALES.map((b, i) => (
        <g key={i}>
          <ellipse cx={b.x} cy={b.y + b.r * 0.5} rx={b.r} ry={b.r * 0.3} fill="#000" opacity="0.2" />
          <circle cx={b.x} cy={b.y} r={b.r} fill={theme.wheat} />
          <circle cx={b.x} cy={b.y} r={b.r * 0.6} fill="none" stroke={theme.wheatShade} strokeWidth="1.5" />
          <circle cx={b.x} cy={b.y} r={b.r * 0.25} fill={theme.wheatShade} opacity="0.5" />
        </g>
      ))}
    </g>
  )
}

// ─── NEW: Second hay bale cluster ──────────────────────────────────────────
function HayBalesRight({ theme }) {
  return (
    <g>
      {HAY_BALES_RIGHT.map((b, i) => (
        <g key={`hb-r-${i}`}>
          <ellipse cx={b.x} cy={b.y + b.r * 0.5} rx={b.r} ry={b.r * 0.3} fill="#000" opacity="0.2" />
          <circle cx={b.x} cy={b.y} r={b.r} fill={theme.wheat} />
          <circle cx={b.x} cy={b.y} r={b.r * 0.6} fill="none" stroke={theme.wheatShade} strokeWidth="1.5" />
          <circle cx={b.x} cy={b.y} r={b.r * 0.25} fill={theme.wheatShade} opacity="0.5" />
        </g>
      ))}
    </g>
  )
}

// ─── NEW: Orchard (regular grid of small fruit trees) ───────────────────────
function Orchard({ theme }) {
  return (
    <g>
      {ORCHARD.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
          {/* trunk */}
          <rect x="-1.5" y="-10" width="3" height="12" fill={theme.wood} />
          {/* canopy */}
          <circle cx="0" cy="-22" r="14" fill={theme.cropGreen} />
          <circle cx="-8" cy="-18" r="9" fill={theme.cropGreen} />
          <circle cx="8" cy="-18" r="9" fill={theme.cropGreen} />
          {/* apples */}
          <circle cx="-4" cy="-22" r="1.8" fill="#d84a3a" />
          <circle cx="5" cy="-20" r="1.8" fill="#d84a3a" />
          <circle cx="0" cy="-26" r="1.8" fill="#d84a3a" />
          {/* rim light */}
          <circle cx="8" cy="-26" r="6" fill={theme.sunColor} opacity="0.12" />
        </g>
      ))}
    </g>
  )
}

// ─── NEW: Second orchard block (right bank) ────────────────────────────────
function OrchardRight({ theme }) {
  return (
    <g>
      {ORCHARD_RIGHT.map((t, i) => (
        <g key={`orch-r-${i}`} transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
          <rect x="-1.5" y="-10" width="3" height="12" fill={theme.wood} />
          <circle cx="0" cy="-22" r="14" fill={theme.cropGreen} />
          <circle cx="-8" cy="-18" r="9" fill={theme.cropGreen} />
          <circle cx="8" cy="-18" r="9" fill={theme.cropGreen} />
          <circle cx="-4" cy="-22" r="1.8" fill="#e8a03a" />
          <circle cx="5" cy="-20" r="1.8" fill="#e8a03a" />
          <circle cx="0" cy="-26" r="1.8" fill="#e8a03a" />
          <circle cx="8" cy="-26" r="6" fill={theme.sunColor} opacity="0.12" />
        </g>
      ))}
    </g>
  )
}

// ─── NEW: Vegetable rows (cabbages) ─────────────────────────────────────────
function VegetableRows({ theme }) {
  return (
    <g>
      <ellipse cx="1060" cy="660" rx="110" ry="24" fill={theme.soil} opacity="0.5" />
      {VEG_ROWS.map((row, ri) =>
        Array.from({ length: row.count }).map((_, ci) => {
          const x = 990 + ci * row.spacing + row.offset
          return (
            <g key={`${ri}-${ci}`}>
              <ellipse cx={x} cy={row.y} rx={9 * row.scale} ry={5 * row.scale} fill={row.color} />
              <ellipse cx={x} cy={row.y - 2 * row.scale} rx={6 * row.scale} ry={3 * row.scale}
                fill={theme.cropGreen} opacity="0.6" />
              <ellipse cx={x} cy={row.y - 4 * row.scale} rx={3 * row.scale} ry={1.5 * row.scale}
                fill={theme.sunColor} opacity="0.15" />
            </g>
          )
        })
      )}
    </g>
  )
}

// ─── NEW: Pumpkin patch ─────────────────────────────────────────────────────
function PumpkinPatch({ theme }) {
  const pumpkins = [
    { x: 1300, y: 700, r: 12 }, { x: 1324, y: 704, r: 10 },
    { x: 1310, y: 686, r: 9 }, { x: 1338, y: 694, r: 8 },
  ]
  return (
    <g>
      {pumpkins.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y + p.r * 0.5} rx={p.r} ry={p.r * 0.35} fill="#000" opacity="0.2" />
          <ellipse cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.85} fill="#e8762c" />
          <ellipse cx={p.x} cy={p.y} rx={p.r * 0.6} ry={p.r * 0.5} fill="#f5a04a" opacity="0.5" />
          <line x1={p.x} y1={p.y - p.r * 0.8} x2={p.x} y2={p.y - p.r * 1.1} stroke="#4a6a2a" strokeWidth="2" />
        </g>
      ))}
      {/* vine */}
      <path d="M1290 700 Q1310 690 1330 700 T1360 700" stroke={theme.cropDark} strokeWidth="1.5" fill="none" />
    </g>
  )
}

// ─── NEW: Chicken coop + hens ───────────────────────────────────────────────
function ChickenCoop({ x, y, theme, reducedMotion }) {
  const hens = [
    { x: 20, y: 0, delay: 0 }, { x: 36, y: 2, delay: 1.2 }, { x: 8, y: 3, delay: 2.4 },
  ]
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* coop */}
      <rect x="-28" y="-22" width="36" height="22" fill={theme.woodLight} />
      <path d="M-32 -22 L-10 -36 L12 -22 Z" fill={theme.barnDark} />
      <rect x="-16" y="-14" width="10" height="14" fill={theme.soil} opacity="0.6" />
      <circle cx="-11" cy="-7" r="1.2" fill={theme.wood} />
      {/* ramp */}
      <line x1="-6" y1="0" x2="4" y2="4" stroke={theme.wood} strokeWidth="2.5" />
      {/* hens */}
      {hens.map((h, i) => (
        <motion.g key={i}
          animate={reducedMotion ? undefined : { y: [0, -1, 0] }}
          transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, delay: h.delay, ease: 'easeInOut' }}>
          <ellipse cx={h.x} cy={h.y} rx="6" ry="4" fill="#f0ead4" />
          <circle cx={h.x + 4} cy={h.y - 4} r="2.8" fill="#f0ead4" />
          <path d={`M${h.x + 6} ${h.y - 4} L${h.x + 10} ${h.y - 3} L${h.x + 6} ${h.y - 2} Z`} fill="#e3a34d" />
          <circle cx={h.x + 4.5} cy={h.y - 4.5} r="0.5" fill="#233b3d" />
          <path d={`M${h.x + 4} ${h.y - 7} Q${h.x + 5} ${h.y - 9} ${h.x + 6} ${h.y - 7}`} fill="#c94a3a" />
        </motion.g>
      ))}
    </g>
  )
}

// ─── NEW: Beehives ──────────────────────────────────────────────────────────
function Beehives({ x, y, theme, reducedMotion }) {
  const hives = [{ x: 0, y: 0 }, { x: 20, y: 2 }, { x: 10, y: -14 }]
  return (
    <g transform={`translate(${x} ${y})`}>
      {hives.map((h, i) => (
        <g key={i} transform={`translate(${h.x} ${h.y})`}>
          <rect x="-7" y="-18" width="14" height="18" rx="2" fill={theme.wheat} />
          <rect x="-7" y="-14" width="14" height="2" fill={theme.wheatShade} />
          <rect x="-7" y="-8" width="14" height="2" fill={theme.wheatShade} />
          <rect x="-8" y="-20" width="16" height="3" rx="1" fill={theme.wood} />
          <circle cx="0" cy="-9" r="1.5" fill="#2a1a10" />
        </g>
      ))}
      {/* bees */}
      {!reducedMotion && [0, 1, 2, 3].map((i) => (
        <motion.circle key={i} r="1" fill="#e8b020"
          animate={{ cx: [0, 15, -10, 5, 0], cy: [-20, -35, -25, -40, -20], opacity: [0.4, 1, 0.6, 1, 0.4] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }} />
      ))}
    </g>
  )
}

// ─── NEW: Trellis vines ─────────────────────────────────────────────────────
function TrellisVines({ theme, reducedMotion }) {
  return (
    <g>
      {TRELLIS_POSTS.map((p, i) => (
        <g key={i}>
          <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - 32} stroke={theme.wood} strokeWidth="2" />
          <motion.path
            d={`M${p.x} ${p.y - 4} q 6 -8 12 -4 q -4 8 -12 4`}
            fill={theme.cropGreen} opacity="0.85"
            animate={reducedMotion ? undefined : { rotate: [-1, 1, -1] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
            style={{ originX: `${p.x}px`, originY: `${p.y - 4}px` }} />
          {i < TRELLIS_POSTS.length - 1 && (
            <line x1={p.x} y1={p.y - 28} x2={p.x + 32} y2={p.y - 22} stroke={theme.wood} strokeWidth="1" opacity="0.6" />
          )}
        </g>
      ))}
    </g>
  )
}

// ─── NEW: Irrigation ditch ─────────────────────────────────────────────────
function IrrigationDitch({ theme }) {
  return (
    <g>
      <path d="M560 650 Q620 660 640 690 Q660 720 700 730" stroke={theme.soilLight} strokeWidth="6" fill="none" opacity="0.6" />
      <path d="M560 650 Q620 660 640 690 Q660 720 700 730" stroke="#5ec4d4" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M880 640 Q820 655 800 685 Q780 715 760 725" stroke={theme.soilLight} strokeWidth="6" fill="none" opacity="0.6" />
      <path d="M880 640 Q820 655 800 685 Q780 715 760 725" stroke="#5ec4d4" strokeWidth="2" fill="none" opacity="0.5" />
    </g>
  )
}

// ─── NEW: Wooden fence run ─────────────────────────────────────────────────
function WoodenFence({ theme }) {
  return (
    <g>
      {FENCE_POSTS.map((p, i) => (
        <line key={i} x1={p.x} y1={p.y} x2={p.x} y2={p.y - 20}
          stroke={theme.wood} strokeWidth="2.2" strokeLinecap="round" />
      ))}
      <path d={`M${FENCE_POSTS[0].x} ${FENCE_POSTS[0].y - 15}` +
        FENCE_POSTS.slice(1).map((p) => ` L${p.x} ${p.y - 15}`).join('')}
        stroke={theme.woodLight} strokeWidth="1.6" fill="none" opacity="0.75" />
      <path d={`M${FENCE_POSTS[0].x} ${FENCE_POSTS[0].y - 7}` +
        FENCE_POSTS.slice(1).map((p) => ` L${p.x} ${p.y - 7}`).join('')}
        stroke={theme.woodLight} strokeWidth="1.6" fill="none" opacity="0.75" />
    </g>
  )
}

function MeadowGrass({ theme, side }) {
  const clipPath = side === 'left' ? 'url(#bdLeftBankClip)' : 'url(#bdRightBankClip)'
  const flowers = ['#f7d66c', '#f4a8a8', '#f6f0d8', '#d5b8f2']
  return (
    <g clipPath={clipPath} pointerEvents="none">
      {BANK_GRASS_TUFTS.map((tuft) => (
        <g
          key={tuft.id}
          transform={`translate(${tuft.x} ${tuft.y})`}
          opacity={0.45 + (tuft.id % 4) * 0.08}
        >
          <path
            d={`M0 0 Q-2 ${-tuft.height * 0.55} ${-3 - tuft.lean} ${-tuft.height} M0 0 Q1 ${-tuft.height * 0.7} ${2 + tuft.lean} ${-tuft.height * 1.15} M0 0 Q3 ${-tuft.height * 0.45} ${5 + tuft.lean} ${-tuft.height * 0.82}`}
            fill="none"
            stroke={tuft.id % 3 === 0 ? theme.cropDark : theme.cropGreen}
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          {tuft.flower && (
            <g transform={`translate(${tuft.lean * 4} ${-tuft.height - 2})`}>
              <path d="M0 2 V7" stroke={theme.cropDark} strokeWidth="0.8" />
              <circle r="1.8" fill={flowers[tuft.id % flowers.length]} />
              <circle r="0.65" fill="#f3c45c" />
            </g>
          )}
        </g>
      ))}
    </g>
  )
}

// ─── NEW: Fish school (reusable in any pond) ───────────────────────────────
function FishSchool({ reducedMotion, cx, cy, color = '#f5b45a' }) {
  return (
    <g>
      {FISH_PRESETS.map((f) => (
        <motion.g key={f.id}
          transform={`translate(${cx + f.cx} ${cy + f.cy})`}
          animate={reducedMotion ? undefined : {
            x: [0, 10, -6, 8, 0],
            y: [0, -4, 3, -3, 0],
            scaleX: [1, 1, -1, -1, 1],
          }}
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '0px', originY: '0px' }}>
          <g transform={`scale(${f.scale})`}>
            <ellipse cx="0" cy="0" rx="5" ry="2.4" fill={color} />
            <path d="M5 0 L8 -2 L8 2 Z" fill={color} opacity="0.9" />
            <circle cx="-2.4" cy="-0.5" r="0.6" fill="#20303a" />
          </g>
        </motion.g>
      ))}
    </g>
  )
}

// ─── NEW: Medium pond with ripples ─────────────────────────────────────────
function MediumPond({ x, y, scale = 1, theme, mood, reducedMotion }) {
  const night = mood === 'dusk'
  const water = night ? '#1f5d72' : theme.riverColor
  const shine = night ? '#a5e8ff' : '#dff6ff'
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* shadow */}
      <ellipse cx="0" cy="8" rx="118" ry="34" fill="#051416" opacity="0.28" />
      {/* muddy bank */}
      <ellipse cx="0" cy="4" rx="114" ry="32" fill={night ? '#2b3a3a' : theme.soilLight} opacity="0.9" />
      {/* water */}
      <ellipse cx="0" cy="0" rx="104" ry="26" fill={water} />
      {/* water sheen */}
      <ellipse cx="0" cy="-3" rx="96" ry="20" fill={shine} opacity="0.24" />
      {/* ripple rings */}
      {!reducedMotion && [0, 1, 2].map((i) => (
        <motion.ellipse key={i} cx={-20 + i * 22} cy={-2 + (i % 2) * 4}
          rx={12 + i * 6} ry={3 + i * 1.4}
          fill="none" stroke={shine} strokeOpacity="0.45" strokeWidth="1"
          animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.05, 0.45, 0.05] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.9, ease: 'easeInOut' }}
          style={{ originX: `${x}px`, originY: `${y}px` }} />
      ))}
      {/* reeds on the bank */}
      {[-84, -68, -50].map((rx, i) => (
        <g key={`reed-l-${i}`} transform={`translate(${rx} -6)`}>
          <line x1="0" y1="0" x2="0" y2={-16 - i * 4} stroke={theme.cropDark} strokeWidth="1.6" />
          <ellipse cx="0" cy={-18 - i * 4} rx="1.6" ry="3" fill={theme.cropGreen} />
        </g>
      ))}
      {[66, 82, 98].map((rx, i) => (
        <g key={`reed-r-${i}`} transform={`translate(${rx} -3)`}>
          <line x1="0" y1="0" x2="0" y2={-14 - i * 3} stroke={theme.cropDark} strokeWidth="1.6" />
          <ellipse cx="0" cy={-16 - i * 3} rx="1.6" ry="3" fill={theme.cropGreen} />
        </g>
      ))}
      {/* fish inside the water */}
      <FishSchool reducedMotion={reducedMotion} cx={-10} cy={-2} color={night ? '#a5e8ff' : '#f5b45a'} />
    </g>
  )
}

// ─── NEW: Duck (single) ────────────────────────────────────────────────────
function Duck({ x, y, scale = 1, facing = 1, reducedMotion }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      <motion.g animate={reducedMotion ? undefined : { x: [0, 3, 7, 3, 0], y: [0, -1.5, 0, -0.8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#f6f0dd" />
        <ellipse cx="0" cy="-1" rx="7" ry="3.5" fill="#fbf8ec" opacity="0.65" />
        <path d="M-8 -3 Q-11 -6 -9 -7 Q-6 -5 -6 -3" fill="#f6f0dd" />
        <circle cx="-5" cy="-9" r="4" fill="#f6f0dd" />
        <circle cx="-6" cy="-10" r="0.7" fill="#1c2a2a" />
        <path d="M-9 -9 L-13 -8 L-9 -7 Z" fill="#f0a83a" />
        <path d="M-5 -12 Q-2 -14 -1 -12 Q-3 -11 -5 -11" fill="#f0a83a" opacity="0.85" />
      </motion.g>
    </g>
  )
}

// ─── Existing small creatures ──────────────────────────────────────────────
function GrazingCattle({ x, y, scale = 1, mood }) {
  const night = mood === 'dusk'
  const coat = night ? '#b4c9c4' : '#eee6d0'
  const shade = night ? '#78999a' : '#c6b99f'
  const dark = night ? '#405e63' : '#75634f'
  const spot = night ? '#57747a' : '#827362'
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="1" rx="28" ry="4" fill="#071b20" opacity=".23" />
      <path d="M-19 -17 Q-29 -22 -27 -11 Q-26 -6 -30 -4" fill="none" stroke={dark} strokeWidth="2" strokeLinecap="round" />
      <path d="M-20 -12 Q-20 -24 -9 -24 H10 Q22 -23 23 -12 L18 -5 H-16 Z" fill={coat} />
      <path d="M-15 -21 Q-6 -26 -2 -17 L-8 -10 L-16 -13 Z" fill={spot} opacity=".85" />
      <path d="M7 -22 Q17 -24 19 -16 L13 -11 L5 -15 Z" fill={spot} opacity=".85" />
      <path d="M13 -21 Q22 -26 27 -17 L25 -7 L17 -7 L12 -13 Z" fill={coat} />
      <path d="M22 -21 Q28 -24 32 -18 L31 -10 Q27 -6 23 -10 L19 -15 Z" fill={coat} />
      <path d="M23 -19 Q16 -26 14 -21 L20 -16" fill={shade} />
      <path d="M29 -20 Q35 -26 37 -20 L31 -16" fill={shade} />
      <path d="M24 -23 Q20 -29 23 -30 M29 -23 Q34 -29 32 -30" fill="none" stroke="#d8c9a9" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="30" cy="-12" rx="4" ry="3" fill={night ? '#9caaa0' : '#d8b8a0'} />
      <circle cx="28" cy="-17" r="1" fill="#253d3b" /><circle cx="32" cy="-17" r="1" fill="#253d3b" />
      <g stroke={dark} strokeWidth="2.8" strokeLinecap="round" fill="none">
        <path d="M-14 -7 L-15 1 M-5 -7 L-5 1 M10 -7 L11 1 M18 -8 L19 1" />
      </g>
    </g>
  )
}

function Farmer({ x, y, mood }) {
  const night = mood === 'dusk'
  const skin = night ? '#d5b29a' : '#d9ad83'
  const clothes = night ? '#8fc3b7' : '#d3b36e'
  const trousers = night ? '#405e69' : '#65735a'
  const hat = night ? '#526d6c' : '#94704b'
  const boot = '#514c3c'
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="1" rx="10" ry="2" fill="#061b1d" opacity=".25" />
      <path d="M-4 -9 L-5 -1 M4 -9 L6 -1" stroke={trousers} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M-5 -1 L-9 0 M6 -1 L10 0" stroke={boot} strokeWidth="3" strokeLinecap="round" />
      <path d="M-6 -21 Q0 -25 6 -21 L8 -9 Q0 -6 -8 -9 Z" fill={clothes} />
      <path d="M-5 -19 L-10 -11 L-7 -8 M5 -19 L10 -13 L13 -15" fill="none" stroke={clothes} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="-7" cy="-8" r="1.8" fill={skin} /><circle cx="13" cy="-15" r="1.8" fill={skin} />
      <path d="M-2 -24 V-21 H2 V-24" fill={skin} />
      <circle cx="0" cy="-28" r="4.5" fill={skin} />
      <path d="M-9 -32 Q-8 -37 0 -38 Q8 -37 9 -32 Q4 -30 -9 -32 Z" fill={hat} />
      <path d="M13 -15 L17 -31" stroke="#92744e" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14 -30 L20 -30" stroke="#a9aaa0" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  )
}

function SmallRuminant({ x, y, kind = 'goat', scale = 1, mood }) {
  const night = mood === 'dusk'
  const coat = night ? '#b7ccca' : '#f0e9d8'
  const shade = night ? '#62838a' : '#a69a82'
  const isSheep = kind === 'sheep'
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="1" rx="17" ry="2.5" fill="#061b1d" opacity=".22" />
      {isSheep ? (
        <g fill={coat}>
          <circle cx="-8" cy="-13" r="7" /><circle cx="0" cy="-16" r="8" />
          <circle cx="8" cy="-13" r="7" /><circle cx="1" cy="-9" r="7" />
        </g>
      ) : (
        <path d="M-14 -10 Q-15 -19 -7 -20 H7 Q15 -18 15 -10 L11 -6 H-11 Z" fill={coat} />
      )}
      <path d="M11 -18 Q19 -22 22 -15 L20 -8 L13 -8 Z" fill={coat} />
      <path d="M-10 -6 L-11 0 M-3 -6 L-3 0 M7 -7 L8 0 M14 -8 L14 0" stroke={shade} strokeWidth="2" strokeLinecap="round" />
      <circle cx="19" cy="-16" r=".8" fill="#243a3c" />
    </g>
  )
}

function RiversidePond({ x, y, scale = 1, mood, reducedMotion }) {
  const water = mood === 'dusk' ? '#237b91' : '#3294a5'
  const shine = mood === 'dusk' ? '#a4e6ec' : '#d8f3d9'
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="2" rx="76" ry="25" fill="#061b1d" opacity=".28" />
      <ellipse cx="0" cy="0" rx="72" ry="23" fill={mood === 'dusk' ? '#31574f' : '#6e9a57'} />
      <ellipse cx="0" cy="-2" rx="65" ry="17" fill={water} stroke="#b6e0ba" strokeOpacity=".5" strokeWidth="1.5" />
      <path d="M-48 -8 Q-21 -18 8 -9 T48 -10" fill="none" stroke={shine} strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" />
      <motion.g animate={reducedMotion ? undefined : { x: [-5, 6, -5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <path d="M-25 1 Q-18 -5 -11 1 Q-18 7 -25 1 Z" fill="#e2c76f" />
        <path d="M-25 1 L-31 -2 L-29 2 Z" fill="#f3dda0" />
        <circle cx="-14" cy="0" r=".7" fill="#233d42" />
      </motion.g>
      {/* NEW: little fish inside this pond too */}
      <FishSchool reducedMotion={reducedMotion} cx={8} cy={-1} color={mood === 'dusk' ? '#a4e6ec' : '#f5b45a'} />
    </g>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function AtmosphericBackdrop({ mood = 'morning' }) {
  const reducedMotion = useReducedMotion()
  const theme = THEMES[mood] ?? THEMES.morning
  const svgProps = {
    viewBox: `0 0 ${VB_W} ${VB_H}`,
    preserveAspectRatio: 'xMidYMax slice',
    className: 'absolute inset-0 h-full w-full',
    fill: 'none',
  }
  const treesOf = (layer) => TREES.map((t, i) => ({ t, i })).filter(({ t }) => t.layer === layer)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden transition-colors duration-1000 ease-out"
      style={{ background: theme.skyGradient }} aria-hidden="true">

      <StarField opacity={theme.starOpacity} reducedMotion={reducedMotion} />
      {theme.aurora && <Aurora reducedMotion={reducedMotion} />}

      {/* ── Sky: sun / moon ── */}
      <svg {...svgProps}>
        <defs>
          <linearGradient id="homeBackdropSun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffdf0" /><stop offset="48%" stopColor={theme.sunColor} />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <radialGradient id="bdCorona">
            <stop offset="0%" stopColor={theme.sunCorona} /><stop offset="100%" stopColor={theme.sunCorona} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bdHorizonGlow">
            <stop offset="0%" stopColor={theme.sunColor} stopOpacity="0.35" /><stop offset="100%" stopColor={theme.sunColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bdMoonGlow">
            <stop offset="0%" stopColor="#d7f5ff" stopOpacity="0.3" />
            <stop offset="45%" stopColor="#a5d9ef" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#a5d9ef" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bdMoonSurface" cx="32%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#fffef4" /><stop offset="60%" stopColor="#d9edf1" /><stop offset="100%" stopColor="#9cc5d4" />
          </radialGradient>
          <mask id="bdCrescentMask" maskUnits="userSpaceOnUse" x="-55" y="-55" width="110" height="110">
            <rect x="-55" y="-55" width="110" height="110" fill="black" />
            <circle cx="0" cy="0" r="48" fill="white" /><circle cx="23" cy="-15" r="43" fill="black" />
          </mask>
        </defs>

        {mood === 'dusk' ? (
          <g transform="translate(340 205)">
            <motion.circle r="150" fill="url(#bdMoonGlow)"
              animate={reducedMotion ? undefined : { opacity: [0.65, 1, 0.65], scale: [0.92, 1.08, 0.92] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
            <circle r="48" fill="url(#bdMoonSurface)" mask="url(#bdCrescentMask)" />
          </g>
        ) : (
          <>
            <motion.circle cx={SUN_X} cy={HORIZON_Y} r="340" fill="url(#bdCorona)" style={{ originX: 0.5, originY: 0.5 }}
              animate={reducedMotion ? undefined : { opacity: [0.45, 0.85, 0.45], scale: [0.9, 1.12, 0.9] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
            <ellipse cx={SUN_X} cy={HORIZON_Y} rx="520" ry="70" fill="url(#bdHorizonGlow)" />
            <g transform={`translate(${SUN_X} ${HORIZON_Y}) scale(1.2) translate(-180 -174)`}>
              <path d="M 126 174 A 54 54 0 0 1 234 174 Z" fill="url(#homeBackdropSun)" stroke="#fff7d6" strokeOpacity="0.85" strokeWidth="1.6" />
              {SUNBURST_RAYS.map((ray, i) => (
                <motion.line key={i} x1={ray.x1} y1={ray.y1} x2={ray.compactX2} y2={ray.compactY2}
                  animate={reducedMotion ? undefined : { x2: [ray.compactX2, ray.expandedX2, ray.compactX2], y2: [ray.compactY2, ray.expandedY2, ray.compactY2], opacity: [0.62, 1, 0.62] }}
                  transition={{ duration: 3.6 + (i % 5) * 0.42, delay: i * 0.11, repeat: Infinity, ease: 'easeInOut' }}
                  stroke={i % 2 === 0 ? theme.sunColor : '#fff0b3'} strokeWidth={ray.width} strokeLinecap="round" />
              ))}
            </g>
          </>
        )}
      </svg>

      <CloudLayer reducedMotion={reducedMotion} />
      <BirdFlock reducedMotion={reducedMotion} />

      {/* ── Land: mountains, river, farm ── */}
      <svg {...svgProps}>
        <defs>
          <linearGradient id="bdLightL" gradientUnits="userSpaceOnUse" x1={SUN_X} y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={theme.sunColor} stopOpacity="0.32" />
            <stop offset="70%" stopColor={theme.sunColor} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bdLightR" gradientUnits="userSpaceOnUse" x1={SUN_X} y1="0" x2={VB_W} y2="0">
            <stop offset="0%" stopColor={theme.sunColor} stopOpacity="0.32" />
            <stop offset="70%" stopColor={theme.sunColor} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bdRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={theme.sunColor} stopOpacity="0" />
            <stop offset="50%" stopColor={theme.sunColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={theme.sunColor} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="bdFog">
            <stop offset="0%" stopColor={theme.fog} stopOpacity="0.28" />
            <stop offset="100%" stopColor={theme.fog} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bdSheen" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON_Y} x2="0" y2="800">
            <stop offset="0%" stopColor={theme.riverColor} stopOpacity="0.9" />
            <stop offset="40%" stopColor={theme.riverColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={theme.riverColor} stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="bdDayReflection" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON_Y} x2="0" y2="800">
            <stop offset="0%" stopColor={theme.sunColor} stopOpacity="0.24" />
            <stop offset="42%" stopColor={theme.sunColor} stopOpacity="0.11" />
            <stop offset="100%" stopColor={theme.sunColor} stopOpacity="0.02" />
          </linearGradient>
          <clipPath id="bdRiverClip"><path d={RIVER_SHAPE} /></clipPath>
          <clipPath id="bdLeftBankClip"><path d={LEFT_BANK_CLIP} /></clipPath>
          <clipPath id="bdRightBankClip"><path d={RIGHT_BANK_CLIP} /></clipPath>
        </defs>

        {/* Far mountains */}
        {[MT_FAR_L, MT_FAR_R].map((d, i) => (
          <g key={`far-${i}`}>
            <path d={d} fill={theme.mtFar} />
            <path d={d} fill={i === 0 ? 'url(#bdLightL)' : 'url(#bdLightR)'} />
          </g>
        ))}
        {SHADE_FAR.map((d, i) => <path key={i} d={d} fill="#000" opacity="0.18" />)}
        {SNOW_CAPS.map((d, i) => <path key={i} d={d} fill={mood === 'dusk' ? '#d9f3ff' : '#fff8e1'} opacity="0.5" />)}

        <motion.ellipse cx="420" cy="438" rx="460" ry="34" fill="url(#bdFog)"
          animate={reducedMotion ? undefined : { x: [-30, 30, -30] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.ellipse cx="1030" cy="440" rx="440" ry="30" fill="url(#bdFog)"
          animate={reducedMotion ? undefined : { x: [30, -30, 30] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }} />

        {/* Mid mountains */}
        {[MT_MID_L, MT_MID_R].map((d, i) => (
          <g key={`mid-${i}`}>
            <path d={d} fill={theme.mtMid} />
            <path d={d} fill={i === 0 ? 'url(#bdLightL)' : 'url(#bdLightR)'} opacity="0.7" />
          </g>
        ))}
        {SHADE_MID.map((d, i) => <path key={i} d={d} fill="#000" opacity="0.24" />)}

        {/* Horizon ground */}
        <path d={GROUND_PATH} fill={theme.hillBack} />
        <path d={HORIZON_RIDGE} stroke="url(#bdRim)" strokeWidth="2.5" />

        {/* Far trees */}
        {treesOf('far').map(({ t, i }) => <Tree key={i} tree={t} theme={theme} reducedMotion={reducedMotion} index={i} />)}

        {/* Rolling mid hills */}
        <path d={MID_HILLS} fill={theme.hillFront} />
        <path d={MID_CREST} stroke={theme.sunColor} strokeOpacity="0.14" strokeWidth="1.5" />
        {[26, 54, 88].map((dy, i) => (
          <path key={dy} d={MID_CREST} transform={`translate(0 ${dy})`}
            stroke={theme.sunColor} strokeOpacity={0.07 - i * 0.015} strokeWidth="1.2" />
        ))}
        {treesOf('mid').map(({ t, i }) => <Tree key={i} tree={t} theme={theme} reducedMotion={reducedMotion} index={i} />)}

        <FarmBillboard x={1080} y={454} mood={mood} />

        {/* Farmsteads */}
        <Farmstead x={425} y={548} theme={theme} mood={mood} />
        <Farmstead x={925} y={548} theme={theme} mood={mood} />

        {/* River */}
        <path d={RIVER_SHAPE} fill={theme.hillDeep} opacity="0.6" />
        <path d={RIVER_SHAPE} fill={theme.riverColor} />
        <g clipPath="url(#bdRiverClip)">
          <rect x="0" y={HORIZON_Y - 10} width={VB_W} height={VB_H} fill="url(#bdSheen)" />
          {!theme.fireflies && (
            <motion.rect x="0" y={HORIZON_Y - 10} width={VB_W} height={VB_H} fill="url(#bdDayReflection)"
              animate={reducedMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
          )}
          {RIVER_FLOW_LINES.map((line, i) => (
            <motion.path key={i} d={line.path} stroke="#e0fff8" strokeOpacity="0.7"
              strokeWidth={line.width} strokeLinecap="round" strokeDasharray={line.dash}
              animate={reducedMotion ? undefined : {
                strokeDashoffset: [0, -(parseFloat(line.dash.split(' ')[0]) + parseFloat(line.dash.split(' ')[1])) * 2],
                opacity: [0.35, 0.9, 0.35],
              }}
              transition={{ duration: line.duration, repeat: Infinity, ease: 'linear' }} />
          ))}
        </g>
        <path d={RIVER_LEFT} stroke={theme.hillDeep} strokeOpacity="0.55" strokeWidth="3" />
        <path d={RIVER_RIGHT} stroke={theme.hillDeep} strokeOpacity="0.55" strokeWidth="3" />

        <RiverBridge x={702} y={491} mood={mood} />

        <MeadowGrass theme={theme} side="left" />
        <MeadowGrass theme={theme} side="right" />

        {/* ── FARM LAYER ──────────────────────────────────────────────── */}

        {/* Left bank working farm */}
        <g clipPath="url(#bdLeftBankClip)">
          <Orchard theme={theme} />
          <Windmill x={240} y={648} theme={theme} reducedMotion={reducedMotion} />
          <HayBales theme={theme} />
          <WheatField theme={theme} />
          <Scarecrow x={420} y={680} theme={theme} />
          <SunflowerPatch theme={theme} />
          <WoodenFence theme={theme} />
          <Beehives x={250} y={600} theme={theme} reducedMotion={reducedMotion} />
          <IrrigationDitch theme={theme} />
        </g>

        {/* NEW: medium pond + ducks + fish (left meadow) */}
        <MediumPond x={300} y={752} scale={1} theme={theme} mood={mood} reducedMotion={reducedMotion} />
        {DUCK_PRESETS.map((d) => (
          <Duck key={d.id} x={d.x} y={d.y} scale={d.s} facing={d.facing} reducedMotion={reducedMotion} />
        ))}

        {/* Water wheel in the river */}
        <WaterWheel x={800} y={672} theme={theme} reducedMotion={reducedMotion} />

        {/* Right bank working farm */}
        <g clipPath="url(#bdRightBankClip)">
          <VegetableRows theme={theme} />
          <HayBalesRight theme={theme} />
          <ChickenCoop x={1150} y={688} theme={theme} reducedMotion={reducedMotion} />
          <PumpkinPatch theme={theme} />
          <TrellisVines theme={theme} reducedMotion={reducedMotion} />
          <WheatFieldRight theme={theme} />
          <CornField theme={theme} />
          <OrchardRight theme={theme} />
          <PlowedFurrows theme={theme} />
          <Tractor x={980} y={700} theme={theme} reducedMotion={reducedMotion} />
        </g>

        {/* People + livestock (originals) */}
        <g clipPath="url(#bdLeftBankClip)">
          <GrazingCattle x={625} y={570} scale={0.78} mood={mood} />
          <Farmer x={580} y={587} mood={mood} />
        </g>
        <g clipPath="url(#bdRightBankClip)">
          <GrazingCattle x={842} y={570} scale={0.88} mood={mood} />
          <Farmer x={880} y={588} mood={mood} />
        </g>

        {/* NEW: extra cattle, sheep, and goats scattered across the meadow */}
        <g clipPath="url(#bdLeftBankClip)">
          <GrazingCattle x={675} y={596} scale={0.72} mood={mood} />
          <SmallRuminant x={560} y={648} kind="sheep" scale={0.82} mood={mood} />
          <SmallRuminant x={620} y={660} kind="sheep" scale={0.78} mood={mood} />
          <SmallRuminant x={660} y={640} kind="goat" scale={0.8} mood={mood} />
          <SmallRuminant x={505} y={688} kind="sheep" scale={0.95} mood={mood} />
        </g>

        <g clipPath="url(#bdRightBankClip)">
          <GrazingCattle x={1055} y={600} scale={0.82} mood={mood} />
          <GrazingCattle x={880} y={612} scale={0.68} mood={mood} />
          <SmallRuminant x={1060} y={640} kind="sheep" scale={0.86} mood={mood} />
          <SmallRuminant x={1130} y={658} kind="goat" scale={0.82} mood={mood} />
          <SmallRuminant x={953} y={686} kind="goat" scale={0.9} mood={mood} />
        </g>

        {/* Foreground banks */}
        <path d={FG_L} fill={theme.hillDeep} />
        <path d={FG_R} fill={theme.hillDeep} />
        <path d={FG_L_CREST} stroke={theme.sunColor} strokeOpacity="0.14" strokeWidth="1.5" />
        <path d={FG_R_CREST} stroke={theme.sunColor} strokeOpacity="0.2" strokeWidth="1.5" />
        {treesOf('near').map(({ t, i }) => <Tree key={i} tree={t} theme={theme} reducedMotion={reducedMotion} index={i} />)}

        {/* Ponds and small livestock */}
        <RiversidePond x={335} y={718} scale={0.9} mood={mood} reducedMotion={reducedMotion} />
        <RiversidePond x={1102} y={716} scale={0.82} mood={mood} reducedMotion={reducedMotion} />
        <Duck x={325} y={716} scale={0.52} facing={1} reducedMotion={reducedMotion} />
        <Duck x={1092} y={714} scale={0.48} facing={1} reducedMotion={reducedMotion} />
        <Duck x={1110} y={718} scale={0.42} facing={-1} reducedMotion={reducedMotion} />
      </svg>

      {/* Floating leaves */}
      <div className="absolute inset-0">
        {LEAF_PRESETS.map((p) => (
          <motion.div key={p.id} className={`absolute bottom-0 ${theme.particleColor}`} style={{ left: p.left }}
            initial={{ y: '10%', opacity: 0 }}
            animate={reducedMotion ? { opacity: 0.4 } : {
              y: ['10%', '-115vh'], x: [0, p.xOffset, -p.xOffset * 0.7, p.xOffset * 0.5, 0],
              rotate: [0, p.rotation, p.rotation * 1.5, p.rotation * 2], opacity: [0, 0.85, 0.95, 0.7, 0],
            }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}>
            {p.id % 2 === 0 ? (
              <Leaf style={{ width: p.size, height: p.size }} />
            ) : (
              <div className="rounded-full bg-current shadow-[0_0_12px_currentColor]"
                style={{ width: p.size * 0.45, height: p.size * 0.45 }} />
            )}
          </motion.div>
        ))}
      </div>

      {theme.fireflies && <Fireflies reducedMotion={reducedMotion} />}
      {theme.butterflies && <Butterflies reducedMotion={reducedMotion} />}

      {/* Accent bloom */}
      <motion.div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl"
        style={{ background: theme.accentGlow }}
        animate={reducedMotion ? undefined : { opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: theme.accentGlow }}
        animate={reducedMotion ? undefined : { opacity: [0.7, 0.4, 0.7] }}
        transition={{ duration: 11, repeat: Infinity, delay: 2, ease: 'easeInOut' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Vignette */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.22) 100%)' }} />
    </div>
  )
}