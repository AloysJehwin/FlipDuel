'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Trade {
  type: 'BUY' | 'SELL'
  amount: number
  price: number
  timestamp: string
  pnl: number
}

interface PlayerResult {
  address: string
  startingBalance: number
  finalBalance: number
  totalPnl: number
  pnlPercent: number
  trades: Trade[]
  rank: number
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()

  // Mock results data
  const winner: PlayerResult = {
    address: '0x7a3f...9d2c',
    startingBalance: 2.1,
    finalBalance: 2.46,
    totalPnl: 0.36,
    pnlPercent: 17.14,
    trades: [
      { type: 'BUY', amount: 0.5, price: 3240.50, timestamp: '14:45', pnl: 0.12 },
      { type: 'SELL', amount: 0.3, price: 3255.80, timestamp: '14:52', pnl: 0.08 },
      { type: 'BUY', amount: 0.4, price: 3248.20, timestamp: '14:57', pnl: 0.16 },
    ],
    rank: 1,
  }

  const loser: PlayerResult = {
    address: '0x4b8e...1a5f',
    startingBalance: 2.1,
    finalBalance: 1.99,
    totalPnl: -0.11,
    pnlPercent: -5.24,
    trades: [
      { type: 'BUY', amount: 0.6, price: 3250.00, timestamp: '14:46', pnl: -0.05 },
      { type: 'SELL', amount: 0.4, price: 3242.50, timestamp: '14:50', pnl: -0.03 },
      { type: 'BUY', amount: 0.2, price: 3255.00, timestamp: '14:55', pnl: -0.03 },
    ],
    rank: 2,
  }

  // Mock connected wallet - in production this comes from Casper.click wallet
  const userWalletAddress = '0x7a3f...9d2c'

  const isWinner = winner.address === userWalletAddress
  const myStats = isWinner ? winner : loser
  const opponentStats = isWinner ? loser : winner
  const prizeAmount = 0.2 // 2x entry fee

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Winner Announcement */}
          <div className="text-center mb-12">
            {isWinner ? (
              <div className="retro-frame bg-retro-gradient p-12 animate-fadeIn">
                <div className="w-20 h-20 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full animate-bounce-slow">
                    <polygon points="50,10 30,40 70,40" className="fill-retro-yellow" />
                    <rect x="35" y="40" width="30" height="35" className="fill-retro-yellow" />
                    <rect x="25" y="75" width="50" height="15" className="fill-retro-yellow" />
                  </svg>
                </div>
                <h1 className="retro-heading text-5xl md:text-7xl mb-4 text-text-light"
                    style={{textShadow: '5px 5px 0px rgba(44,44,44,0.5)'}}>
                  VICTORY!
                </h1>
                <div className="card-retro inline-block px-6 py-2 mb-4">
                  <div className="font-mono font-bold text-text-primary">{userWalletAddress}</div>
                </div>
                <p className="text-2xl text-text-light mb-6">
                  You won the duel!
                </p>
                <div className="card-retro bg-retro-yellow inline-block px-8 py-4">
                  <div className="text-sm text-text-muted uppercase mb-1">Prize Won</div>
                  <div className="text-4xl font-display text-text-primary">
                    +{prizeAmount.toFixed(3)} ETH
                  </div>
                </div>
              </div>
            ) : (
              <div className="retro-frame bg-retro-coral p-12 animate-fadeIn">
                <div className="w-20 h-20 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-text-light" />
                    <line x1="35" y1="35" x2="65" y2="65" stroke="currentColor" strokeWidth="8" className="text-text-light" />
                    <line x1="65" y1="35" x2="35" y2="65" stroke="currentColor" strokeWidth="8" className="text-text-light" />
                  </svg>
                </div>
                <h1 className="retro-heading text-5xl md:text-7xl mb-4 text-text-light"
                    style={{textShadow: '5px 5px 0px rgba(44,44,44,0.5)'}}>
                  DEFEAT
                </h1>
                <div className="card-retro inline-block px-6 py-2 mb-4">
                  <div className="font-mono font-bold text-text-primary">{userWalletAddress}</div>
                </div>
                <p className="text-2xl text-text-light mb-6">
                  Better luck next time!
                </p>
                <div className="text-lg text-text-light">
                  Keep practicing and you'll win soon
                </div>
              </div>
            )}
          </div>

          {/* Final Comparison */}
          <section className="mb-12">
            <h2 className="retro-heading text-3xl text-center mb-8">
              FINAL RESULTS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Winner Card */}
              <div className="card-retro bg-retro-green">
                <div className="mb-4">
                  <div className="retro-badge bg-retro-yellow mb-2">
                    WINNER
                  </div>
                  <div className="font-mono text-lg font-bold text-text-primary mb-1">
                    {winner.address}
                  </div>
                  {isWinner && (
                    <div className="text-xs text-text-primary uppercase font-bold">
                      ★ This is you ★
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface/80 border-[3px] border-border p-3">
                    <div className="text-xs text-text-muted uppercase">Starting</div>
                    <div className="font-bold text-text-primary">
                      {winner.startingBalance.toFixed(3)} ETH
                    </div>
                  </div>
                  <div className="bg-surface/80 border-[3px] border-border p-3">
                    <div className="text-xs text-text-muted uppercase">Final</div>
                    <div className="font-bold text-retro-blue">
                      {winner.finalBalance.toFixed(3)} ETH
                    </div>
                  </div>
                </div>

                <div className="bg-retro-yellow border-[3px] border-border p-4 shadow-retro-inset">
                  <div className="text-xs text-text-muted uppercase mb-1">Total P&L</div>
                  <div className="text-3xl font-display text-text-primary">
                    +{winner.pnlPercent.toFixed(2)}%
                  </div>
                  <div className="text-sm font-bold text-retro-green">
                    +{winner.totalPnl.toFixed(4)} ETH
                  </div>
                </div>
              </div>

              {/* Loser Card */}
              <div className="card-retro bg-retro-coral">
                <div className="mb-4">
                  <div className="retro-badge bg-surface mb-2">
                    2ND PLACE
                  </div>
                  <div className="font-mono text-lg font-bold text-text-light mb-1">
                    {loser.address}
                  </div>
                  {!isWinner && (
                    <div className="text-xs text-text-light uppercase font-bold">
                      ★ This is you ★
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface/80 border-[3px] border-border p-3">
                    <div className="text-xs text-text-muted uppercase">Starting</div>
                    <div className="font-bold text-text-primary">
                      {loser.startingBalance.toFixed(3)} ETH
                    </div>
                  </div>
                  <div className="bg-surface/80 border-[3px] border-border p-3">
                    <div className="text-xs text-text-muted uppercase">Final</div>
                    <div className="font-bold text-retro-blue">
                      {loser.finalBalance.toFixed(3)} ETH
                    </div>
                  </div>
                </div>

                <div className="bg-surface border-[3px] border-border p-4 shadow-retro-inset">
                  <div className="text-xs text-text-muted uppercase mb-1">Total P&L</div>
                  <div className="text-3xl font-display text-text-primary">
                    {loser.pnlPercent.toFixed(2)}%
                  </div>
                  <div className="text-sm font-bold text-retro-coral">
                    {loser.totalPnl.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trade History */}
          <section className="mb-12">
            <h2 className="retro-heading text-2xl mb-6">YOUR TRADE HISTORY</h2>

            <div className="card-retro">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-4 border-border">
                      <th className="text-left py-3 px-4 retro-subheading text-sm">Type</th>
                      <th className="text-left py-3 px-4 retro-subheading text-sm">Amount</th>
                      <th className="text-left py-3 px-4 retro-subheading text-sm">Price</th>
                      <th className="text-left py-3 px-4 retro-subheading text-sm">Time</th>
                      <th className="text-left py-3 px-4 retro-subheading text-sm">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStats.trades.map((trade, idx) => (
                      <tr key={idx} className="border-b-2 border-border/20">
                        <td className="py-3 px-4">
                          <span className={`retro-badge ${
                            trade.type === 'BUY' ? 'bg-retro-green' : 'bg-retro-coral'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">{trade.amount.toFixed(4)} ETH</td>
                        <td className="py-3 px-4 font-mono">${trade.price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-text-muted">{trade.timestamp}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${
                            trade.pnl >= 0 ? 'text-retro-green' : 'text-retro-coral'
                          }`}>
                            {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(4)} ETH
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t-4 border-border flex justify-between items-center">
                <span className="retro-subheading">TOTAL</span>
                <span className={`text-2xl font-display ${
                  myStats.totalPnl >= 0 ? 'text-retro-green' : 'text-retro-coral'
                }`}>
                  {myStats.totalPnl > 0 ? '+' : ''}{myStats.totalPnl.toFixed(4)} ETH
                </span>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/lobby" className="btn-primary text-lg text-center">
              JOIN ANOTHER DUEL
            </Link>
            <Link href="/create" className="btn-secondary text-lg text-center">
              CREATE NEW DUEL
            </Link>
            <Link href="/history" className="btn-outline text-lg text-center">
              VIEW HISTORY
            </Link>
          </div>
        </div>
      </main>

    </div>
  )
}
