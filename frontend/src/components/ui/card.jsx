import * as React from 'react'
import { cn } from '@/lib/utils'

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('card-soft', className)} {...props} />
))
Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('p-5 pb-2', className)} {...props} />
)
export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-base font-semibold text-forest-900', className)} {...props} />
)
export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-5 pt-2', className)} {...props} />
)