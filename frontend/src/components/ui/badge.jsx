import { cn } from '@/lib/utils'

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-sage text-forest-800',
    success: 'bg-fresh-100 text-fresh-600',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-700',
    outline: 'border border-forest-100 text-forest-800 bg-white',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}