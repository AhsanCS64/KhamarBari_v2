import { useMemo } from 'react'
import {
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Droplets, Egg } from 'lucide-react'

export default function ProductionTrendChart({ data = [] }) {
  // Compute totals dynamically from data
  const { totalMilk, totalEggs } = useMemo(() => {
    let milk = 0
    let eggs = 0
    data.forEach((d) => {
      milk += Number(d.milk || 0)
      eggs += Number(d.eggs || 0)
    })
    return { totalMilk: milk, totalEggs: eggs }
  }, [data])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    const milkVal = Number(payload.find((p) => p.dataKey === 'milk')?.value || 0)
    const eggsVal = Number(payload.find((p) => p.dataKey === 'eggs')?.value || 0)

    return (
      <div className="rounded-xl border border-forest-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-xs min-w-[160px]">
        <p className="font-bold text-forest-950 pb-1.5 border-b border-forest-100/70 mb-2">{label}</p>
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="flex items-center gap-1.5 font-sans font-medium text-forest-700">
              <Droplets className="h-3.5 w-3.5 text-emerald-600" />
              Milk:
            </span>
            <span className="font-bold">{milkVal.toLocaleString()} L</span>
          </div>
          <div className="flex items-center justify-between text-amber-800">
            <span className="flex items-center gap-1.5 font-sans font-medium text-forest-700">
              <Egg className="h-3.5 w-3.5 text-amber-600" />
              Eggs:
            </span>
            <span className="font-bold">{eggsVal.toLocaleString()} pcs</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Dynamic Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-forest-50/50 border border-forest-100/70 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
              <Droplets className="h-4 w-4" />
            </span>
            <div>
              <span className="block text-[10px] uppercase font-bold text-forest-500">14-Day Milk Total</span>
              <span className="font-mono font-bold text-emerald-800">{totalMilk.toLocaleString()} Litres</span>
            </div>
          </div>

          <div className="h-6 w-px bg-forest-200/60" />

          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-100 text-amber-800">
              <Egg className="h-4 w-4" />
            </span>
            <div>
              <span className="block text-[10px] uppercase font-bold text-forest-500">14-Day Egg Total</span>
              <span className="font-mono font-bold text-amber-800">{totalEggs.toLocaleString()} Eggs</span>
            </div>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-forest-600 bg-white px-2.5 py-1 rounded-md border border-forest-100">
          Daily Log Window: 14 Days
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 14, right: 10, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="dashboardMilkArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="90%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="dashboardEggArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="90%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8d8" vertical={false} opacity={0.7} />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: '#526859', fontSize: 11, fontWeight: 500 }}
          />

          <YAxis
            yAxisId="milk"
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: '#10b981', fontSize: 10, fontWeight: 500 }}
            tickFormatter={(v) => `${v >= 1000 ? `${v / 1000}k` : v} L`}
          />

          <YAxis
            yAxisId="eggs"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: '#f59e0b', fontSize: 10, fontWeight: 500 }}
            tickFormatter={(v) => `${v >= 1000 ? `${v / 1000}k` : v}`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
            iconType="circle"
            iconSize={7}
            align="right"
            verticalAlign="top"
          />

          <Area
            yAxisId="milk"
            type="monotone"
            dataKey="milk"
            name="Milk Output (L)"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#dashboardMilkArea)"
            activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#10b981' }}
            animationDuration={900}
          />
          <Line
            yAxisId="eggs"
            type="monotone"
            dataKey="eggs"
            name="Egg Collection (pcs)"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#f59e0b' }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#f59e0b' }}
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
