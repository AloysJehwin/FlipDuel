import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import { Trophy, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

interface PlayerCardProps {
  username: string
  level: number
  wager: number
  avatar?: string
  wins?: number
  position?: 'left' | 'right'
  isWinner?: boolean
  isEmpty?: boolean
}

export default function PlayerCard({
  username,
  level,
  wager,
  avatar,
  wins = 0,
  position = 'left',
  isWinner = false,
  isEmpty = false,
}: PlayerCardProps) {
  if (isEmpty) {
    return (
      <div className="card flex flex-col items-center justify-center gap-4 min-h-[280px] border-dashed">
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-retro-charcoal flex items-center justify-center">
          <span className="text-4xl">?</span>
        </div>
        <p className="text-text-muted text-sm">Waiting for opponent...</p>
      </div>
    )
  }
  
  return (
    <div
      className={clsx(
        'card card-hover relative overflow-hidden',
        isWinner && 'border-neon-green shadow-neon-green'
      )}
    >
      {/* Winner Glow Effect */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-transparent pointer-events-none"></div>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar src={avatar} alt={username} size="xl" fallback={username[0]} />
          {isWinner && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-neon-green rounded-full flex items-center justify-center shadow-neon-green animate-pulse-slow">
              <Trophy className="w-4 h-4 text-primary-bg" />
            </div>
          )}
        </div>
        
        {/* Username */}
        <div className="text-center">
          <h3 className={clsx(
            'text-xl font-bold',
            isWinner ? 'neon-text' : 'text-retro-charcoal'
          )}>
            {username}
          </h3>
          <p className="text-sm text-text-muted">Level {level}</p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-medium text-retro-charcoal">{wins}</span>
          </div>
          <div className="w-px h-4 bg-retro-charcoal"></div>
          <Badge variant="success">
            <TrendingUp className="w-3 h-3 mr-1" />
            {Math.floor(Math.random() * 30 + 70)}% WR
          </Badge>
        </div>
        
        {/* Wager */}
        <div className="w-full mt-2 pt-4 border-t border-retro-charcoal">
          <p className="text-xs text-text-muted text-center mb-1">Wager</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold neon-text">{wager.toFixed(2)}</span>
            <span className="text-sm text-text-muted">CSPR</span>
          </div>
        </div>
      </div>
    </div>
  )
}
