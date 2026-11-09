import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-10 w-full rounded-xl border border-forest-100 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fresh focus-visible:border-fresh disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'