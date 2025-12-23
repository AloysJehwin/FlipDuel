'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-12 md:py-16 relative overflow-hidden">
            {/* Animated Trading Chart Lines - Left */}
            <div className="absolute top-10 left-4 w-24 h-24 opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse-slow">
                <polyline
                  points="0,80 25,60 50,70 75,30 100,50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-retro-green"
                />
                <circle cx="25" cy="60" r="4" className="fill-retro-green animate-pulse" />
                <circle cx="50" cy="70" r="4" className="fill-retro-green animate-pulse" style={{animationDelay: '0.3s'}} />
                <circle cx="75" cy="30" r="4" className="fill-retro-green animate-pulse" style={{animationDelay: '0.6s'}} />
              </svg>
            </div>

            {/* Animated Trading Chart Lines - Right */}
            <div className="absolute top-10 right-4 w-24 h-24 opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse-slow">
                <polyline
                  points="0,50 25,30 50,40 75,20 100,35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-retro-coral"
                />
                <circle cx="25" cy="30" r="4" className="fill-retro-coral animate-pulse" />
                <circle cx="50" cy="40" r="4" className="fill-retro-coral animate-pulse" style={{animationDelay: '0.3s'}} />
                <circle cx="75" cy="20" r="4" className="fill-retro-coral animate-pulse" style={{animationDelay: '0.6s'}} />
              </svg>
            </div>

            {/* Rotating Geometric Shapes */}
            <div className="absolute top-1/4 left-8 w-16 h-16 border-4 border-retro-blue opacity-30 animate-spin" style={{animationDuration: '10s'}}></div>
            <div className="absolute top-1/3 right-8 w-20 h-20 border-4 border-retro-coral opacity-30 transform rotate-45 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>

            <div className="retro-frame mb-8 inline-block relative">
              <h1 className="retro-heading text-5xl md:text-7xl mb-4">
                FLIP DUEL
              </h1>
              <p className="retro-subheading text-xl md:text-2xl text-text-primary">
                LIVE CRYPTO TRADING DUELS
              </p>

              {/* Corner Accent Triangles */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-retro-yellow border-2 border-border transform rotate-45"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-retro-coral border-2 border-border transform rotate-45"></div>
            </div>

            <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-8">
              Battle traders in real-time. Pick your token, trade for the time limit, highest gains win. Winner takes all!
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <Link href="/lobby" className="btn-primary text-lg">
                JOIN A DUEL
              </Link>
              <Link href="/create" className="btn-secondary text-lg">
                CREATE DUEL
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <span className="w-3 h-3 bg-retro-green rounded-full animate-pulse"></span>
              <span>247 traders online</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="card-retro text-center relative overflow-hidden">
              {/* Dollar Sign Pattern */}
              <div className="absolute -top-4 -right-4 w-24 h-24 opacity-5">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <text x="50" y="70" fontSize="80" textAnchor="middle" className="fill-retro-coral font-bold">$</text>
                </svg>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-display text-retro-coral mb-2">$127K</div>
                <div className="retro-subheading text-sm">TOTAL PRIZES WON</div>
              </div>
            </div>

            <div className="card-retro text-center relative overflow-hidden">
              {/* Circular Progress Indicator */}
              <div className="absolute top-2 right-2 w-16 h-16 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{animationDuration: '8s'}}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-retro-blue" strokeDasharray="30 20" />
                </svg>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-display text-retro-blue mb-2">1,423</div>
                <div className="retro-subheading text-sm">DUELS COMPLETED</div>
              </div>
            </div>

            <div className="card-retro text-center relative overflow-hidden">
              {/* Trophy/Crown Shape */}
              <div className="absolute -top-2 -right-2 w-20 h-20 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="50,10 30,40 70,40" className="fill-retro-green" />
                  <rect x="35" y="40" width="30" height="35" className="fill-retro-green" />
                  <rect x="25" y="75" width="50" height="15" className="fill-retro-green" />
                </svg>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-display text-retro-green mb-2">89%</div>
                <div className="retro-subheading text-sm">AVG WIN RATE</div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <section className="mb-16">
            <h2 className="retro-heading text-3xl md:text-4xl text-center mb-12">
              HOW IT WORKS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-blue text-text-light">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-retro-yellow border-4 border-border flex items-center justify-center flex-shrink-0 shadow-retro">
                    <span className="text-2xl font-bold text-text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">PAY ENTRY FEE</h3>
                    <p className="text-text-light">
                      Set your entry amount and select your favorite crypto token to trade (BTC, ETH, SOL, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-coral text-text-light">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-retro-yellow border-4 border-border flex items-center justify-center flex-shrink-0 shadow-retro">
                    <span className="text-2xl font-bold text-text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">GET MATCHED</h3>
                    <p className="text-text-light">
                      Wait for an opponent or join an existing duel. Both players pay the same entry fee.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-coral text-text-light">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-retro-yellow border-4 border-border flex items-center justify-center flex-shrink-0 shadow-retro">
                    <span className="text-2xl font-bold text-text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">TRADE LIVE</h3>
                    <p className="text-text-light">
                      Once the timer starts, buy and sell your chosen token. Watch real-time prices and your P&L.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-blue text-text-light">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-retro-yellow border-4 border-border flex items-center justify-center flex-shrink-0 shadow-retro">
                    <span className="text-2xl font-bold text-text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">WINNER TAKES ALL</h3>
                    <p className="text-text-light">
                      Highest % gain wins! Prize is automatically sent to the winner's wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center relative">
            <div className="card-retro bg-retro-gradient p-12 relative overflow-hidden">
              {/* Animated Sword Icons (Duel Theme) */}
              <div className="absolute top-8 left-8 w-16 h-16 opacity-20 animate-bounce-slow">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-45">
                  <rect x="45" y="10" width="10" height="60" className="fill-retro-yellow" />
                  <rect x="35" y="5" width="30" height="10" className="fill-retro-yellow" />
                  <circle cx="50" cy="75" r="8" className="fill-retro-coral" />
                  <rect x="45" y="75" width="10" height="15" className="fill-retro-coral" />
                </svg>
              </div>

              <div className="absolute top-8 right-8 w-16 h-16 opacity-20 animate-bounce-slow" style={{animationDelay: '0.5s'}}>
                <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-45">
                  <rect x="45" y="10" width="10" height="60" className="fill-retro-yellow" />
                  <rect x="35" y="5" width="30" height="10" className="fill-retro-yellow" />
                  <circle cx="50" cy="75" r="8" className="fill-retro-coral" />
                  <rect x="45" y="75" width="10" height="15" className="fill-retro-coral" />
                </svg>
              </div>

              {/* Trading Arrow Indicators */}
              <div className="absolute bottom-8 left-12 w-12 h-12 opacity-15 animate-pulse">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="50,20 80,60 65,60 65,90 35,90 35,60 20,60" className="fill-retro-green" />
                </svg>
              </div>

              <div className="absolute bottom-8 right-12 w-12 h-12 opacity-15 animate-pulse" style={{animationDelay: '0.5s'}}>
                <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-180">
                  <polygon points="50,20 80,60 65,60 65,90 35,90 35,60 20,60" className="fill-retro-coral" />
                </svg>
              </div>

              {/* Geometric Corner Accents */}
              <div className="absolute top-0 left-0 w-24 h-24 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="0,0 100,0 0,100" className="fill-border" />
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="100,100 0,100 100,0" className="fill-border" />
                </svg>
              </div>

              <h2 className="retro-heading text-4xl mb-4 text-text-light relative z-10" style={{textShadow: '4px 4px 0px rgba(44,44,44,0.5)'}}>
                READY TO DUEL?
              </h2>
              <p className="text-xl text-text-light mb-8 relative z-10">
                Connect your wallet and start trading battles now!
              </p>
              <Link href="/lobby" className="btn-primary text-xl inline-block relative z-10">
                ENTER THE ARENA
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
