import { motion } from 'framer-motion'

export default function SproutLoader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`} role="status">
      <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none">
        <motion.path
          d="M32 56V30" stroke="#245C3A" strokeWidth="4" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.path
          d="M32 34c-8 0-14-6-14-14 8 0 14 6 14 14Z" fill="#65A765"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 180 }}
          style={{ transformOrigin: '32px 30px' }}
        />
        <motion.path
          d="M32 30c0-8 6-14 14-14 0 8-6 14-14 14Z" fill="#245C3A"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 180 }}
          style={{ transformOrigin: '32px 30px' }}
        />
      </svg>
      <span className="text-sm text-forest-700">{label}</span>
    </div>
  )
}