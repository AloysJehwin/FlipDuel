import clsx from 'clsx'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
}

export default function Avatar({ src, alt, size = 'md', className, fallback }: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  }
  
  return (
    <div
      className={clsx(
        'rounded-full overflow-hidden border-2 border-neon-green/50 bg-surface-light flex items-center justify-center font-semibold',
        sizeStyles[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="text-neon-green">{fallback || '?'}</span>
      )}
    </div>
  )
}
