import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Warehouse, Plus, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HabitatUtilizationChart({ enclosures = [] }) {
  const { totalOccupied, totalCapacity, utilizationRate } = useMemo(() => {
    let occupied = 0
    let capacity = 0
    enclosures.forEach((e) => {
      occupied += Number(e.occupied || 0)
      capacity += Number(e.capacity || 0)
    })
    const rate = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0
    return {
      totalOccupied: occupied,
      totalCapacity: capacity,
      utilizationRate: rate,
    }
  }, [enclosures])

  if (!enclosures.length) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-forest-200 bg-forest-50/30">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-800 mb-3">
          <Warehouse className="h-6 w-6" />
        </span>
        <h4 className="text-sm font-bold text-forest-950">No Enclosures Registered</h4>
        <p className="text-xs text-forest-600 mt-1 max-w-xs">
          Create rooms, dairy stanchion lines, or ponds to track capacity utilization across your farm.
        </p>
        <Button size="sm" asChild className="mt-4 rounded-xl bg-emerald-700 text-white">
          <Link to="/dashboard/animals">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Enclosure
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overview Stat Meter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-forest-50/60 border border-forest-100/70">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-forest-500">
            Total Habitats Capacity
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-forest-950">
              {totalOccupied.toLocaleString()}
            </span>
            <span className="text-xs text-forest-500 font-medium">
              / {totalCapacity > 0 ? `${totalCapacity.toLocaleString()} max` : 'unlimited'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-forest-500">
              Utilization Rate
            </span>
            <span className={`text-xl font-bold font-mono ${utilizationRate > 95 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {utilizationRate}%
            </span>
          </div>

          {/* Mini Ring or Pie Indicator */}
          <div className="relative h-11 w-11 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-forest-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={utilizationRate > 95 ? 'text-amber-500' : 'text-emerald-500'}
                strokeDasharray={`${Math.min(utilizationRate, 100)}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-forest-950">
              {utilizationRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Per-Enclosure Progress Bars */}
      <div className="space-y-3">
        {enclosures.slice(0, 5).map((enc) => {
          const cap = Number(enc.capacity || 0)
          const occ = Number(enc.occupied || 0)
          const pct = cap > 0 ? Math.min(Math.round((occ / cap) * 100), 100) : 100
          const isCrowded = pct >= 95
          const isAtRisk = enc.health === 'treatment' || enc.health === 'quarantine' || (enc.sickCount > 0)

          return (
            <div
              key={enc.id || enc.name}
              className="group p-3 rounded-xl border border-forest-100 bg-white hover:border-emerald-200 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-forest-950">{enc.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-forest-50 text-forest-700 capitalize">
                    {enc.type || 'Shed'} · {enc.species || 'Livestock'}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-forest-900">
                    {occ.toLocaleString()}
                  </span>
                  <span className="text-forest-400">/ {cap > 0 ? cap.toLocaleString() : '∞'}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isCrowded ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-forest-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCrowded
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-fresh-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Foot note if sick or affected */}
              {isAtRisk && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{enc.sickCount} affected stock under veterinary watch</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {enclosures.length > 5 && (
        <div className="text-right">
          <Link
            to="/dashboard/animals"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            <span>View all {enclosures.length} habitats</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
