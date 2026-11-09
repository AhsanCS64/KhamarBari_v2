import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Clock, Sparkles, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function FarmRoiCalculator() {
  const [animals, setAnimals] = useState(120)
  const [branches, setBranches] = useState(2)
  const [farmType, setFarmType] = useState('dairy')

  // Calculate projected savings
  const results = useMemo(() => {
    // Multipliers based on farm type
    const typeFactors = {
      dairy: { hoursPerHead: 0.28, takaSavedPerHead: 310, marginBoost: 18.2 },
      poultry: { hoursPerHead: 0.008, takaSavedPerHead: 8.5, marginBoost: 21.5 },
      aqua: { hoursPerHead: 0.45, takaSavedPerHead: 520, marginBoost: 24.0 },
      mixed: { hoursPerHead: 0.22, takaSavedPerHead: 240, marginBoost: 19.8 },
    }

    const factor = typeFactors[farmType] || typeFactors.dairy
    const effectiveAnimals = farmType === 'poultry' ? animals * 15 : animals

    // Monthly hours saved
    const hours = Math.round(effectiveAnimals * factor.hoursPerHead + branches * 12)
    // Monthly money saved
    const money = Math.round(effectiveAnimals * factor.takaSavedPerHead + branches * 15000)
    // Margin increase
    const margin = factor.marginBoost

    return {
      hoursSaved: Math.min(hours, 240),
      moneySaved: money.toLocaleString('en-US'),
      marginBoost: margin,
    }
  }, [animals, branches, farmType])

  return (
    <section className="relative py-20 lg:py-28 bg-[#103827] text-cream overflow-hidden">
      {/* Decorative ambient sunburst */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-yellow-400/15 via-emerald-400/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-600/20 to-transparent blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-950/60 text-fresh-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator className="h-3.5 w-3.5 text-fresh-400" />
            INTERACTIVE SAVINGS SIMULATOR
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            See how much your farm will save every month
          </h2>
          <p className="mt-4 text-base sm:text-lg text-cream/75 max-w-xl mx-auto">
            Adjust the sliders to match your current setup and discover the exact time and money KhamarBari frees up for you.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_32px_96px_rgba(3,24,16,0.35)]">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-7">
            {/* Farm Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-fresh-300 mb-2">
                Primary Farm Focus
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'dairy', label: '🥛 Dairy', desc: 'Cattle & Goats' },
                  { id: 'poultry', label: '🐔 Poultry', desc: 'Broiler & Layer' },
                  { id: 'aqua', label: '🐟 Fisheries', desc: 'Ponds & Biofloc' },
                  { id: 'mixed', label: '🌾 Mixed', desc: 'Multi-Sector' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFarmType(type.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      farmType === type.id
                        ? 'border-fresh-400 bg-fresh-400/20 text-white shadow-xs'
                        : 'border-white/10 bg-white/5 text-cream/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-bold">{type.label}</span>
                    <span className="block text-[10px] text-cream/50 mt-0.5">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 1: Number of Animals / Enclosures */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-cream/80">
                  {farmType === 'poultry' ? 'Flock Size (in hundreds)' : 'Animals / Habitats'}
                </label>
                <span className="font-mono text-lg font-black text-fresh-300">
                  {animals} {farmType === 'poultry' ? 'x 100 birds' : 'headcount'}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={animals}
                onChange={(e) => setAnimals(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-emerald-950 appearance-none cursor-pointer accent-fresh-400"
              />
              <div className="flex justify-between text-[10px] text-cream/40 mt-1 font-mono">
                <span>10</span>
                <span>250</span>
                <span>500+</span>
              </div>
            </div>

            {/* Slider 2: Number of Branches */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-cream/80">
                  Active Farm Branches
                </label>
                <span className="font-mono text-lg font-black text-fresh-300">
                  {branches} {branches === 1 ? 'Location' : 'Locations'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={branches}
                onChange={(e) => setBranches(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-emerald-950 appearance-none cursor-pointer accent-fresh-400"
              />
              <div className="flex justify-between text-[10px] text-cream/40 mt-1 font-mono">
                <span>1 Branch</span>
                <span>4 Branches</span>
                <span>8 Branches</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box (Spans 5 cols on lg) */}
          <div className="lg:col-span-5 rounded-2xl border border-fresh-400/30 bg-gradient-to-b from-forest-800/90 to-forest-950/95 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-24 w-24 text-fresh-300" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-fresh-400">
              ESTIMATED MONTHLY RETURN
            </span>

            <div className="mt-4 space-y-4">
              {/* Money Saved */}
              <div className="pb-3 border-b border-white/10">
                <span className="text-xs text-cream/70 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-fresh-400" />
                  Monthly Loss & Waste Prevented
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono text-fresh-300">
                    ৳{results.moneySaved}
                  </span>
                  <span className="text-xs text-cream/60">/ month</span>
                </div>
              </div>

              {/* Hours Saved */}
              <div className="pb-3 border-b border-white/10">
                <span className="text-xs text-cream/70 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-yellow-300" />
                  Time Freed From Tedious Paperwork
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono text-yellow-300">
                    ~{results.hoursSaved} hrs
                  </span>
                  <span className="text-xs text-cream/60">/ month</span>
                </div>
              </div>

              {/* Efficiency */}
              <div>
                <span className="text-xs text-cream/70">Projected Margin Surge</span>
                <div className="mt-1 text-2xl font-black font-mono text-white">
                  +{results.marginBoost}%
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mt-6 rounded-xl bg-fresh-400 text-forest-950 hover:bg-fresh-300 font-bold shadow-lg shadow-fresh-400/25 transition-all hover:scale-[1.02] cursor-pointer"
              asChild
            >
              <Link to="/signup" className="flex items-center justify-center gap-2">
                <span>Unlock These Savings Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-2 text-center text-[11px] text-cream/50">
              Free 14-day setup · No payment info required
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
