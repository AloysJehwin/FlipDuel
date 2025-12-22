'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import DuelArena from '@/components/DuelArena'
import WagerPanel from '@/components/WagerPanel'
import LiveSidebar from '@/components/LiveSidebar'
import Footer from '@/components/Footer'

type DuelState = 'waiting' | 'countdown' | 'fighting' | 'result'

interface Player {
  username: string
  level: number
  wager: number
  avatar?: string
  wins: number
}

export default function Home() {
  const [duelState, setDuelState] = useState<DuelState>('waiting')
  const [player1, setPlayer1] = useState<Player | null>({
    username: 'You',
    level: 12,
    wager: 50,
    wins: 145,
  })
  const [player2, setPlayer2] = useState<Player | null>(null)
  
  const handleCreateDuel = (amount: number) => {
    // Update player 1's wager
    setPlayer1({
      username: 'You',
      level: 12,
      wager: amount,
      wins: 145,
    })
    
    // Simulate finding an opponent
    setTimeout(() => {
      setPlayer2({
        username: 'Opponent',
        level: Math.floor(Math.random() * 20) + 1,
        wager: amount,
        wins: Math.floor(Math.random() * 200),
      })
      
      // Start countdown
      setTimeout(() => {
        setDuelState('countdown')
        
        // Start fighting
        setTimeout(() => {
          setDuelState('fighting')
          
          // Show result
          setTimeout(() => {
            setDuelState('result')
            
            // Reset after showing result
            setTimeout(() => {
              setDuelState('waiting')
              setPlayer2(null)
            }, 5000)
          }, 2000)
        }, 3000)
      }, 1000)
    }, 1500)
  }
  
  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1920px] mx-auto">
          {/* Hero Section */}
          <div className="text-center py-8 md:py-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">Welcome to the Arena</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
              Challenge players worldwide in instant 1v1 duels. Winner takes all.
            </p>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 mb-12">
            {/* Left Column - Duel Arena + Wager Panel */}
            <div className="space-y-8">
              {/* Duel Arena */}
              <section id="duel">
                <DuelArena
                  player1={player1}
                  player2={player2}
                  state={duelState}
                />
              </section>
              
              {/* Wager Panel - Desktop centered, Mobile full width */}
              <div className="max-w-md mx-auto">
                <WagerPanel
                  onCreateDuel={handleCreateDuel}
                  maxBalance={1250}
                />
              </div>
            </div>
            
            {/* Right Column - Live Sidebar */}
            <div className="xl:sticky xl:top-24 xl:self-start">
              <LiveSidebar />
            </div>
          </div>
          
          {/* Info Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Instant Matches</h3>
              <p className="text-sm text-text-muted">
                Get matched with opponents instantly. No waiting, pure action.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Provably Fair</h3>
              <p className="text-sm text-text-muted">
                All duels are cryptographically verified. 100% transparent and fair.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Winner Takes All</h3>
              <p className="text-sm text-text-muted">
                Double your wager instantly. Simple, thrilling, rewarding.
              </p>
            </div>
          </div>
          
          {/* How to Play Section */}
          <section id="guide" className="mb-12">
            <div className="card">
              <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
                How to Play
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-neon-green/10 border-2 border-neon-green rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-neon-green">1</span>
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">Set Wager</h4>
                  <p className="text-sm text-text-muted">
                    Choose your battle amount from presets or custom
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-neon-green/10 border-2 border-neon-green rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-neon-green">2</span>
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">Create Duel</h4>
                  <p className="text-sm text-text-muted">
                    Hit the button and get matched instantly
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-neon-green/10 border-2 border-neon-green rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-neon-green">3</span>
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">Battle</h4>
                  <p className="text-sm text-text-muted">
                    Watch the countdown and see who wins
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-neon-green/10 border-2 border-neon-green rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-neon-green">4</span>
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2">Claim Win</h4>
                  <p className="text-sm text-text-muted">
                    Winner automatically receives double the wager
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
