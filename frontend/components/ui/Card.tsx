import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export default function Card({ children, className, hover = false, glow = false }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-surface border border-border rounded-xl p-6 transition-all duration-300',
        hover && 'hover:border-neon-green/50 hover:shadow-glow-sm cursor-pointer',
        glow && 'shadow-glow-md',
        className
      )}
    >
      {children}
    </div>
  )
}
