'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface HistoricalDuel {
  id: string
  date: string
  opponent: string
  token: string
  entryFee: number
  duration: number
  yourPnl: number
  yourPnlPercent: number
  opponentPnl: number
  opponentPnlPercent: number
  result: 'won' | 'lost'
  prize: number
}

const MOCK_HISTORY: HistoricalDuel[] = [
  {
    id: '1',
    date: '2024-01-15 14:30',
    opponent: '0x4b8e...1a5f',
    token: 'ETH',
    entryFee: 0.1,
    duration: 15,
    yourPnl: 0.36,
    yourPnlPercent: 17.14,
    opponentPnl: -0.11,
    opponentPnlPercent: -5.24,
    result: 'won',
    prize: 0.2,
  },
  {
    id: '2',
    date: '2024-01-15 12:00',
    opponent: '0x9c2d...7e4b',
    token: 'BTC',
    entryFee: 0.05,
    duration: 10,
    yourPnl: -0.02,
    yourPnlPercent: -4.12,
    opponentPnl: 0.05,
    opponentPnlPercent: 10.5,
    result: 'lost',
    prize: 0,
  },
  {
    id: '3',
    date: '2024-01-14 18:45',
    opponent: '0x1f6a...3c9e',
    token: 'SOL',
    entryFee: 0.2,
    duration: 20,
    yourPnl: 0.12,
    yourPnlPercent: 6.15,
    opponentPnl: 0.08,
    opponentPnlPercent: 4.02,
    result: 'won',
    prize: 0.4,
  },
  {
    id: '4',
    date: '2024-01-14 16:20',
    opponent: '0x5d3b...8f2a',
    token: 'ETH',
    entryFee: 0.15,
    duration: 30,
    yourPnl: 0.05,
    yourPnlPercent: 3.33,
    opponentPnl: -0.08,
    opponentPnlPercent: -5.33,
    result: 'won',
    prize: 0.3,
  },
  {
    id: '5',
    date: '2024-01-13 20:10',
    opponent: '0x7e2f...4d1c',
    token: 'BTC',
    entryFee: 0.25,
    duration: 15,
    yourPnl: -0.15,
    yourPnlPercent: -12.0,
    opponentPnl: 0.18,
    opponentPnlPercent: 14.4,
    result: 'lost',
    prize: 0,
  },
]

export default function HistoryPage() {
  const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all')

  // Mock connected wallet address - in production this would come from Casper.click wallet
  const userWalletAddress = '0x7a3f...9d2c'

  const filteredHistory = MOCK_HISTORY.filter(duel => {
    if (filter === 'all') return true
    return duel.result === filter
  })

  const totalDuels = MOCK_HISTORY.length
  const wins = MOCK_HISTORY.filter(d => d.result === 'won').length
  const losses = MOCK_HISTORY.filter(d => d.result === 'lost').length
  const winRate = ((wins / totalDuels) * 100).toFixed(1)
  const totalEarnings = MOCK_HISTORY.reduce((sum, d) => sum + (d.result === 'won' ? d.prize : -d.entryFee), 0)
  const totalPnl = MOCK_HISTORY.reduce((sum, d) => sum + d.yourPnl, 0)

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="retro-heading text-4xl md:text-5xl mb-4">
              DUEL HISTORY
            </h1>
            <div className="card-retro inline-block px-6 py-3 mb-4">
              <div className="text-xs text-text-muted uppercase mb-1">Your Wallet</div>
              <div className="font-mono font-bold text-retro-charcoal text-lg">{userWalletAddress}</div>
            </div>
            <p className="text-text-muted">
              Track your performance and past duels
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card-retro text-center">
              <div className="text-3xl font-display text-retro-blue mb-1">
                {totalDuels}
              </div>
              <div className="retro-subheading text-xs">TOTAL DUELS</div>
            </div>

            <div className="card-retro text-center">
              <div className="text-3xl font-display text-retro-green mb-1">
                {wins}W - {losses}L
              </div>
              <div className="retro-subheading text-xs">WIN/LOSS</div>
            </div>

            <div className="card-retro text-center">
              <div className="text-3xl font-display text-retro-blue mb-1">
                {winRate}%
              </div>
              <div className="retro-subheading text-xs">WIN RATE</div>
            </div>

            <div className="card-retro text-center">
              <div className={`text-3xl font-display mb-1 ${
                totalEarnings >= 0 ? 'text-retro-green' : 'text-retro-coral'
              }`}>
                {totalEarnings > 0 ? '+' : ''}{totalEarnings.toFixed(3)}
              </div>
              <div className="retro-subheading text-xs">NET PROFIT (ETH)</div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="card-retro mb-8">
            <h2 className="retro-subheading text-xl mb-4">PERFORMANCE OVERVIEW</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-text-muted uppercase mb-2">Best Token</div>
                <div className="flex items-center gap-2">
                  <span className="retro-badge bg-retro-blue text-retro-cream">ETH</span>
                  <span className="text-retro-green font-bold">75% WR</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-text-muted uppercase mb-2">Avg P&L Per Duel</div>
                <div className={`text-2xl font-bold ${
                  totalPnl >= 0 ? 'text-retro-green' : 'text-retro-coral'
                }`}>
                  {totalPnl > 0 ? '+' : ''}{(totalPnl / totalDuels).toFixed(4)} ETH
                </div>
              </div>

              <div>
                <div className="text-sm text-text-muted uppercase mb-2">Longest Win Streak</div>
                <div className="text-2xl font-bold text-retro-yellow">3 WINS</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="card bg-retro-beige p-4">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-2 border-[3px] border-retro-charcoal font-bold uppercase transition-all ${
                    filter === 'all'
                      ? 'bg-retro-blue text-retro-cream shadow-retro'
                      : 'bg-surface text-retro-charcoal hover:bg-retro-tan'
                  }`}
                >
                  All Duels
                </button>
                <button
                  onClick={() => setFilter('won')}
                  className={`px-6 py-2 border-[3px] border-retro-charcoal font-bold uppercase transition-all ${
                    filter === 'won'
                      ? 'bg-retro-green text-retro-cream shadow-retro'
                      : 'bg-surface text-retro-charcoal hover:bg-retro-tan'
                  }`}
                >
                  Wins Only
                </button>
                <button
                  onClick={() => setFilter('lost')}
                  className={`px-6 py-2 border-[3px] border-retro-charcoal font-bold uppercase transition-all ${
                    filter === 'lost'
                      ? 'bg-retro-coral text-retro-cream shadow-retro'
                      : 'bg-surface text-retro-charcoal hover:bg-retro-tan'
                  }`}
                >
                  Losses Only
                </button>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="card-retro overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-4 border-retro-charcoal">
                  <th className="text-left py-3 px-4 retro-subheading text-sm">Date</th>
                  <th className="text-left py-3 px-4 retro-subheading text-sm">Opponent</th>
                  <th className="text-left py-3 px-4 retro-subheading text-sm">Token</th>
                  <th className="text-left py-3 px-4 retro-subheading text-sm">Entry</th>
                  <th className="text-left py-3 px-4 retro-subheading text-sm">Your P&L</th>
                  <th className="text-left py-3 px-4 retro-subheading text-sm">Opp P&L</th>
                  <th className="text-left py-3 px-4 retro-subheading text-sm">Result</th>
                  <th className="text-left py-3 px-4 retro-subheading text-sm">Prize</th>
                  <th className="text-left py-3 px-4 retro-subheading text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((duel) => (
                  <tr key={duel.id} className="border-b-2 border-retro-charcoal/20 hover:bg-retro-tan/20 transition-colors">
                    <td className="py-3 px-4 text-sm text-text-muted">
                      {duel.date}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">
                      {duel.opponent}
                    </td>
                    <td className="py-3 px-4">
                      <span className="retro-badge bg-retro-blue text-retro-cream text-xs">
                        {duel.token}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">
                      {duel.entryFee} ETH
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-bold ${
                        duel.yourPnl >= 0 ? 'text-retro-green' : 'text-retro-coral'
                      }`}>
                        {duel.yourPnl > 0 ? '+' : ''}{duel.yourPnlPercent.toFixed(2)}%
                      </div>
                      <div className="text-xs text-text-muted">
                        {duel.yourPnl > 0 ? '+' : ''}{duel.yourPnl.toFixed(4)} ETH
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-bold ${
                        duel.opponentPnl >= 0 ? 'text-retro-green' : 'text-retro-coral'
                      }`}>
                        {duel.opponentPnl > 0 ? '+' : ''}{duel.opponentPnlPercent.toFixed(2)}%
                      </div>
                      <div className="text-xs text-text-muted">
                        {duel.opponentPnl > 0 ? '+' : ''}{duel.opponentPnl.toFixed(4)} ETH
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`retro-badge ${
                        duel.result === 'won' ? 'bg-retro-green' : 'bg-retro-coral'
                      } text-retro-cream`}>
                        {duel.result === 'won' ? 'WON' : 'LOST'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {duel.result === 'won' ? (
                        <span className="text-retro-green">+{duel.prize.toFixed(3)} ETH</span>
                      ) : (
                        <span className="text-retro-coral">-{duel.entryFee.toFixed(3)} ETH</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/results/${duel.id}`}
                        className="text-retro-blue hover:text-retro-blue-dark font-bold text-sm underline"
                      >
                        VIEW
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredHistory.length === 0 && (
            <div className="text-center py-16">
              <div className="retro-frame inline-block p-8">
                <div className="w-24 h-24 mx-auto mb-4 opacity-30">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polyline points="10,90 30,60 50,70 70,40 90,50" fill="none" stroke="currentColor" strokeWidth="6" className="text-retro-charcoal" />
                    <circle cx="30" cy="60" r="5" className="fill-retro-charcoal" />
                    <circle cx="50" cy="70" r="5" className="fill-retro-charcoal" />
                    <circle cx="70" cy="40" r="5" className="fill-retro-charcoal" />
                  </svg>
                </div>
                <h3 className="retro-heading text-2xl mb-2">NO DUELS FOUND</h3>
                <p className="text-text-muted mb-6">
                  {filter === 'all'
                    ? "You haven't participated in any duels yet!"
                    : `No ${filter} duels to display.`}
                </p>
                <Link href="/lobby" className="btn-primary">
                  JOIN YOUR FIRST DUEL
                </Link>
              </div>
            </div>
          )}

          {/* Action Button */}
          {filteredHistory.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/lobby" className="btn-primary text-lg">
                JOIN ANOTHER DUEL
              </Link>
            </div>
          )}
        </div>
      </main>

    </div>
  )
}
