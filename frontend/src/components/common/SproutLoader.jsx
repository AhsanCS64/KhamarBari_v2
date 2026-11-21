import { motion } from 'framer-motion'

export default function SproutLoader({ label = 'Loading…', className = '', size = 'lg' }) {
  const sizeClasses = {
    sm: 'h-14 w-14',
    md: 'h-20 w-20',
    lg: 'h-28 w-28 sm:h-32 sm:w-32',
    xl: 'h-36 w-36 sm:h-44 sm:w-44',
  }[size] || 'h-28 w-28 sm:h-32 sm:w-32'

  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`} role="status">
      <div className="relative grid place-items-center">
        {/* Soft atmospheric ambient glow */}
        <div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-tr from-[#dcf88f]/40 to-[#86e246]/25 blur-2xl animate-pulse" />

        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, -1.2, 1.2, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`relative ${sizeClasses} grid place-items-center rounded-3xl bg-gradient-to-br from-[#eafcb2] to-[#aee45a] p-4 shadow-[0_16px_40px_rgba(36,92,58,0.22),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-white/60`}
        >
          <img
            src="/sprout.svg"
            alt="KhamarBari"
            className="h-full w-full object-contain drop-shadow-md select-none"
          />
        </motion.div>
      </div>

      {label && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold tracking-wide text-forest-800">{label}</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-600 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-forest-600 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-forest-600 animate-bounce" />
          </span>
        </div>
      )}
    </div>
  )
}
