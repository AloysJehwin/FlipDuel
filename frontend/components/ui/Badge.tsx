import { ReactNode } from 'react'
import clsx from 'clsx'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-surface-light text-text-muted border-border',
    success: 'bg-neon-green/10 text-neon-green border-neon-green/30',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    danger: 'bg-red-500/10 text-red-500 border-red-500/30',
    info: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30',
  }
  
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
