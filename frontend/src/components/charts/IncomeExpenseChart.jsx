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
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'

export default function IncomeExpenseChart({ data = [] }) {
  // Dynamically compute totals from data
  const { totalIncome, totalExpense, netFlow, marginPct } = useMemo(() => {
    let income = 0
    let expense = 0
    data.forEach((d) => {
      income += Number(d.income || 0)
      expense += Number(d.expense || 0)
    })
    const net = income - expense
    const margin = income > 0 ? Math.round((net / income) * 100) : 0
    return {
      totalIncome: income,
      totalExpense: expense,
      netFlow: net,
      marginPct: margin,
    }
  }, [data])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    const incomeVal = Number(payload.find((p) => p.dataKey === 'income')?.value || 0)
    const expenseVal = Number(payload.find((p) => p.dataKey === 'expense')?.value || 0)
    const net = incomeVal - expenseVal

    return (
      <div className="rounded-xl border border-forest-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-xs min-w-[170px]">
        <p className="font-bold text-forest-950 pb-1.5 border-b border-forest-100/70 mb-2">{label}</p>
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="flex items-center gap-1.5 font-sans font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Income:
            </span>
            <span className="font-bold">৳{incomeVal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-amber-700">
            <span className="flex items-center gap-1.5 font-sans font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Expense:
            </span>
            <span className="font-bold">৳{expenseVal.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t border-forest-100/70 flex items-center justify-between text-forest-900 font-bold">
            <span className="font-sans">Net Cash:</span>
            <span className={net >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
              {net >= 0 ? `+৳${net.toLocaleString()}` : `-৳${Math.abs(net).toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Top Metric Header dynamically calculated from data */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-forest-50/50 border border-forest-100/70 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-forest-500">Period Income</span>
          <p className="font-mono font-bold text-emerald-800 text-sm mt-0.5">৳{totalIncome.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-forest-500">Period Expenses</span>
          <p className="font-mono font-bold text-amber-800 text-sm mt-0.5">৳{totalExpense.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-forest-500">Net Surplus</span>
          <p className={`font-mono font-bold text-sm mt-0.5 flex items-center gap-0.5 ${netFlow >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {netFlow >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            ৳{Math.abs(netFlow).toLocaleString()}
            <span className="text-[10px] font-sans opacity-75 ml-1">({marginPct}%)</span>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={290}>
        <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: -10 }}>
          <defs>
            <linearGradient id="dashboardIncomeArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="90%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="dashboardExpenseArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="90%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8d8" vertical={false} opacity={0.7} />

          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: '#526859', fontSize: 11, fontWeight: 500 }}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            width={58}
            tick={{ fill: '#78897c', fontSize: 10, fontWeight: 500 }}
            tickFormatter={(v) => `৳${v >= 1000 ? `${v / 1000}k` : v}`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: 11, color: '#475569', paddingTop: 4 }}
            iconType="circle"
            iconSize={7}
            align="right"
            verticalAlign="top"
          />

          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#dashboardIncomeArea)"
            activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#10b981' }}
            animationDuration={850}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#f59e0b' }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#f59e0b' }}
            animationDuration={850}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
