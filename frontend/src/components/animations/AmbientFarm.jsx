import { motion, useReducedMotion } from 'framer-motion'
import { Leaf } from 'lucide-react'

export default function AmbientFarm() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-yellow-200/70 to-transparent blur-2xl animate-sunrise" />

      <motion.div
        className="absolute top-10 left-0 h-10 w-40 rounded-full bg-white/70 blur-sm"
        animate={reducedMotion ? undefined : { x: ['-10%', '110%'] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-24 left-0 h-8 w-28 rounded-full bg-white/60 blur-sm"
        animate={reducedMotion ? undefined : { x: ['-10%', '110%'] }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear', delay: 10 }}
      />

      <Leaf className="absolute bottom-12 left-10 h-8 w-8 text-fresh/70 animate-leaf-sway" />
      <Leaf className="absolute bottom-24 right-16 h-6 w-6 text-forest/50 animate-leaf-sway [animation-delay:1.2s]" />
      <Leaf className="absolute top-1/3 right-8 h-5 w-5 text-fresh/60 animate-leaf-sway [animation-delay:.6s]" />
    </div>
  )
}