'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Home() {
  const [showNavbar, setShowNavbar] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar after scrolling past 80% of viewport height
      setShowNavbar(window.scrollY > window.innerHeight * 0.8)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* Hero Section - Full Screen */}
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center relative flex flex-col items-center">
            <div className="mb-16 w-full flex flex-col items-center justify-center">
              <h1 className="title-fragmented text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] mb-12 leading-none animate-fadeIn" data-text="FLIPDUEL" style={{ animationDuration: '1s', marginLeft: 0, marginRight: 0 }}>
                FLIPDUEL
              </h1>
              <p className="retro-subheading text-2xl md:text-3xl lg:text-4xl text-text-secondary max-w-4xl mb-12 animate-slideUp" style={{ animationDelay: '0.3s', animationDuration: '0.8s', opacity: 0, animationFillMode: 'forwards' }}>
                LIVE CRYPTO TRADING DUELS
              </p>
            </div>

            <p className="text-xl md:text-2xl lg:text-3xl text-text-muted max-w-3xl mx-auto mb-12 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.6s', animationDuration: '0.8s', opacity: 0, animationFillMode: 'forwards' }}>
              Battle traders in real-time. Pick your token, trade for the time limit, highest gains win. Winner takes all!
            </p>

            <div className="flex flex-wrap gap-6 justify-center mb-8 animate-slideUp" style={{ animationDelay: '0.9s', animationDuration: '0.8s', opacity: 0, animationFillMode: 'forwards' }}>
              <Link href="/lobby" className="btn-primary text-xl px-8 py-4 hover:scale-110 transition-transform duration-300">
                JOIN A DUEL
              </Link>
              <Link href="/create" className="btn-secondary text-xl px-8 py-4 hover:scale-110 transition-transform duration-300">
                CREATE DUEL
              </Link>
            </div>

            <div className="flex items-center justify-center gap-3 text-lg text-text-muted mb-20 animate-fadeIn" style={{ animationDelay: '1.2s', animationDuration: '0.8s', opacity: 0, animationFillMode: 'forwards' }}>
              <span className="w-3 h-3 bg-retro-cherry rounded-full animate-pulse"></span>
              <span>247 traders online</span>
            </div>
          </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-text-muted text-sm uppercase tracking-wider font-bold">Scroll Down</span>
            <svg className="w-6 h-6 text-retro-cherry" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-retro-cherry rounded-lg animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-40 right-20 w-24 h-24 border-4 border-retro-cherry-light rounded-lg animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 border-4 border-accent-gray rounded-lg animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 border-4 border-retro-cherry rounded-lg animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
        </div>
      </main>

      {/* Navbar - Only shows when scrolling */}
      <Navbar visible={showNavbar} />

      {/* Secondary Sections */}
      <div>
        <div className="pt-12 px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="card-retro text-center">
              <div className="text-4xl font-retro text-retro-cherry mb-2">$127K</div>
              <div className="retro-subheading text-sm">TOTAL PRIZES WON</div>
            </div>

            <div className="card-retro text-center">
              <div className="text-4xl font-retro text-retro-cherry-light mb-2">1,423</div>
              <div className="retro-subheading text-sm">DUELS COMPLETED</div>
            </div>

            <div className="card-retro text-center">
              <div className="text-4xl font-retro text-retro-cherry-light mb-2">89%</div>
              <div className="retro-subheading text-sm">AVG WIN RATE</div>
            </div>
          </div>

          {/* Features Section */}
          <section className="mb-16">
            <h2 className="retro-heading text-3xl md:text-4xl text-center mb-12">
              HOW IT WORKS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-retro">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-retro-cherry border-2 border-retro-cherry-light flex items-center justify-center flex-shrink-0 rounded-lg">
                    <span className="text-2xl font-bold text-text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">PAY ENTRY FEE</h3>
                    <p className="text-text-muted">
                      Set your entry amount and select your favorite crypto token to trade (BTC, ETH, SOL, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-retro">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-retro-cherry border-2 border-retro-cherry-light flex items-center justify-center flex-shrink-0 rounded-lg">
                    <span className="text-2xl font-bold text-text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">GET MATCHED</h3>
                    <p className="text-text-muted">
                      Wait for an opponent or join an existing duel. Both players pay the same entry fee.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-retro">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-retro-cherry border-2 border-retro-cherry-light flex items-center justify-center flex-shrink-0 rounded-lg">
                    <span className="text-2xl font-bold text-text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">TRADE LIVE</h3>
                    <p className="text-text-muted">
                      Once the timer starts, buy and sell your chosen token. Watch real-time prices and your P&L.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-retro">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-retro-cherry border-2 border-retro-cherry-light flex items-center justify-center flex-shrink-0 rounded-lg">
                    <span className="text-2xl font-bold text-text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">WINNER TAKES ALL</h3>
                    <p className="text-text-muted">
                      Highest % gain wins! Prize is automatically sent to the winner's wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="card-retro p-12">
              <h2 className="retro-heading text-4xl mb-4">
                READY TO DUEL?
              </h2>
              <p className="text-xl text-text-muted mb-8">
                Connect your wallet and start trading battles now!
              </p>
              <Link href="/lobby" className="btn-primary text-xl inline-block">
                ENTER THE ARENA
              </Link>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  )
}
