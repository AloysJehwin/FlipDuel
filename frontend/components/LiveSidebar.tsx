'use client'

import { Activity, TrendingUp, Clock, Trophy } from 'lucide-react'
import Badge from './ui/Badge'
import clsx from 'clsx'

interface LiveDuel {
  id: string
  player1: string
  player2: string
  wager: number
  status: 'active' | 'completed'
}

interface RecentWin {
  id: string
  winner: string
  amount: number
  timestamp: string
}

export default function LiveSidebar() {
  // Mock data
  const liveDuels: LiveDuel[] = [
    { id: '1', player1: 'CryptoKing', player2: 'ShadowNinja', wager: 150, status: 'active' },
    { id: '2', player1: 'MoonWalker', player2: 'DiamondHands', wager: 300, status: 'active' },
    { id: '3', player1: 'FlashDuel', player2: 'QuickWin', wager: 75, status: 'completed' },
    { id: '4', player1: 'ProGamer', player2: 'ElitePlayer', wager: 500, status: 'active' },
    { id: '5', player1: 'LuckyShot', player2: 'AceHunter', wager: 200, status: 'completed' },
  ]
  
  const recentWins: RecentWin[] = [
    { id: '1', winner: 'CryptoKing', amount: 450, timestamp: '2m ago' },
    { id: '2', winner: 'MoonWalker', amount: 620, timestamp: '5m ago' },
    { id: '3', winner: 'FlashDuel', amount: 180, timestamp: '8m ago' },
    { id: '4', winner: 'ProGamer', amount: 1100, timestamp: '12m ago' },
    { id: '5', winner: 'DiamondHands', amount: 350, timestamp: '15m ago' },
  ]
  
  return (
    <aside className="w-full lg:w-80 space-y-6">
      {/* Live Duels */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-neon-green" />
            <h3 className="font-bold text-retro-charcoal">Live Duels</h3>
          </div>
          <Badge variant="success">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
              {liveDuels.filter(d => d.status === 'active').length} Live
            </span>
          </Badge>
        </div>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-custom">
          {liveDuels.map((duel) => (
            <div
              key={duel.id}
              className={clsx(
                'p-3 rounded-lg border transition-all duration-200 cursor-pointer',
                duel.status === 'active'
                  ? 'bg-surface-light border-neon-green/30 hover:border-neon-green/60'
                  : 'bg-surface-light/50 border-retro-charcoal/50 hover:border-retro-charcoal'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-medium text-retro-charcoal truncate">
                    {duel.player1}
                  </span>
                  <span className="text-xs text-text-muted">vs</span>
                  <span className="text-sm font-medium text-retro-charcoal truncate">
                    {duel.player2}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-neon-green" />
                  <span className="text-xs font-semibold text-neon-green">
                    {duel.wager * 2} CSPR
                  </span>
                </div>
                {duel.status === 'active' && (
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse"></span>
                    Fighting
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Wins */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-neon-cyan" />
          <h3 className="font-bold text-retro-charcoal">Recent Wins</h3>
        </div>
        
        <div className="space-y-2">
          {recentWins.map((win, index) => (
            <div
              key={win.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-surface-light/50 hover:bg-surface-light transition-colors animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 h-6 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-3 h-3 text-neon-green" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-retro-charcoal truncate">
                    {win.winner}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="w-3 h-3" />
                    {win.timestamp}
                  </div>
                </div>
              </div>
              <span className="text-sm font-bold text-neon-green whitespace-nowrap ml-2">
                +{win.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats Card */}
      <div className="card bg-gradient-to-br from-surface to-surface-light">
        <h3 className="font-bold text-retro-charcoal mb-4">24h Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Total Duels</span>
            <span className="text-lg font-bold text-retro-charcoal">1,234</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Total Volume</span>
            <span className="text-lg font-bold neon-text">45,678 CSPR</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Active Players</span>
            <span className="text-lg font-bold text-retro-charcoal">567</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
