'use client'

import { useState, useEffect } from 'react'
import PlayerCard from './PlayerCard'
import { Swords, Zap } from 'lucide-react'
import clsx from 'clsx'

type DuelState = 'waiting' | 'countdown' | 'fighting' | 'result'

interface Player {
  username: string
  level: number
  wager: number
  avatar?: string
  wins: number
}

interface DuelArenaProps {
  player1: Player | null
  player2: Player | null
  state?: DuelState
}

export default function DuelArena({ player1, player2, state = 'waiting' }: DuelArenaProps) {
  const [countdown, setCountdown] = useState(3)
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null)
  
  useEffect(() => {
    if (state === 'countdown') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [state])
  
  useEffect(() => {
    if (state === 'result' && !winner) {
      // Simulate random winner for demo
      setTimeout(() => {
        setWinner(Math.random() > 0.5 ? 'player1' : 'player2')
      }, 500)
    }
  }, [state, winner])
  
  const renderVSIndicator = () => {
    if (state === 'countdown') {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="text-6xl font-arcade neon-text animate-pulse-slow mb-2">
            {countdown}
          </div>
          <p className="text-sm text-text-muted uppercase tracking-wider">Get Ready</p>
        </div>
      )
    }
    
    if (state === 'fighting') {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <Swords className="w-16 h-16 text-neon-green animate-pulse-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-neon-cyan animate-glow" />
            </div>
          </div>
          <p className="text-sm text-text-muted uppercase tracking-wider mt-2">Fighting!</p>
        </div>
      )
    }
    
    if (state === 'result' && winner) {
      const totalWager = (player1?.wager || 0) + (player2?.wager || 0)
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-arcade neon-text mb-2 animate-fadeIn">
            GG!
          </div>
          <p className="text-sm text-text-muted uppercase tracking-wider">Winner Takes</p>
          <div className="text-2xl font-bold neon-text mt-1">
            {totalWager.toFixed(2)} CSPR
          </div>
        </div>
      )
    }
    
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <div className="text-6xl font-arcade arcade-text animate-glow">
            VS
          </div>
          <div className="absolute inset-0 bg-neon-green/20 blur-2xl"></div>
        </div>
        <p className="text-sm text-text-muted uppercase tracking-wider mt-2">Duel Arena</p>
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-center">
        {/* Player 1 */}
        <div className="w-full">
          {player1 ? (
            <PlayerCard
              username={player1.username}
              level={player1.level}
              wager={player1.wager}
              avatar={player1.avatar}
              wins={player1.wins}
              position="left"
              isWinner={state === 'result' && winner === 'player1'}
            />
          ) : (
            <PlayerCard
              username=""
              level={0}
              wager={0}
              isEmpty={true}
            />
          )}
        </div>
        
        {/* VS Indicator */}
        <div className={clsx(
          'flex items-center justify-center',
          'w-full lg:w-40 h-40',
          'transition-all duration-500'
        )}>
          {renderVSIndicator()}
        </div>
        
        {/* Player 2 */}
        <div className="w-full">
          {player2 ? (
            <PlayerCard
              username={player2.username}
              level={player2.level}
              wager={player2.wager}
              avatar={player2.avatar}
              wins={player2.wins}
              position="right"
              isWinner={state === 'result' && winner === 'player2'}
            />
          ) : (
            <PlayerCard
              username=""
              level={0}
              wager={0}
              isEmpty={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}
