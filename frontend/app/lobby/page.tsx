'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Duel {
  id: string
  creator: string
  entryFee: number
  token: string
  duration: number
  status: 'waiting' | 'active'
  createdAt: string
}

const MOCK_DUELS: Duel[] = [
  {
    id: '1',
    creator: '0x7a3f...9d2c',
    entryFee: 0.1,
    token: 'ETH',
    duration: 15,
    status: 'waiting',
    createdAt: '2 min ago'
  },
  {
    id: '2',
    creator: '0x4b8e...1a5f',
    entryFee: 0.05,
    token: 'BTC',
    duration: 30,
    status: 'waiting',
    createdAt: '5 min ago'
  },
  {
    id: '3',
    creator: '0x9c2d...7e4b',
    entryFee: 0.2,
    token: 'SOL',
    duration: 10,
    status: 'waiting',
    createdAt: '8 min ago'
  },
  {
    id: '4',
    creator: '0x1f6a...3c9e',
    entryFee: 0.15,
    token: 'ETH',
    duration: 20,
    status: 'waiting',
    createdAt: '12 min ago'
  },
  {
    id: '5',
    creator: '0x5d3b...8f2a',
    entryFee: 0.5,
    token: 'BTC',
    duration: 15,
    status: 'active',
    createdAt: '1 min ago'
  },
]

export default function LobbyPage() {
  const [filter, setFilter] = useState<'all' | 'waiting' | 'active'>('waiting')
  const [selectedToken, setSelectedToken] = useState<string>('all')

  const filteredDuels = MOCK_DUELS.filter(duel => {
    if (filter !== 'all' && duel.status !== filter) return false
    if (selectedToken !== 'all' && duel.token !== selectedToken) return false
    return true
  })

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="retro-heading text-4xl md:text-5xl mb-2">
                  DUEL LOBBY
                </h1>
                <p className="text-text-muted">
                  Join an existing duel or create your own
                </p>
              </div>

              <Link href="/create" className="btn-primary w-fit">
                + CREATE NEW DUEL
              </Link>
            </div>

            {/* Live Stats Bar */}
            <div className="card-retro">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-retro-coral">
                    {MOCK_DUELS.filter(d => d.status === 'waiting').length}
                  </div>
                  <div className="text-sm text-text-muted uppercase">Open Duels</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-retro-blue">
                    {MOCK_DUELS.filter(d => d.status === 'active').length}
                  </div>
                  <div className="text-sm text-text-muted uppercase">Active Now</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-retro-green">247</div>
                  <div className="text-sm text-text-muted uppercase">Online</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-retro-blue">$12.4K</div>
                  <div className="text-sm text-text-muted uppercase">Prize Pool</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="card bg-win95-light p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Status Filter */}
                <div className="flex-1">
                  <label className="retro-subheading text-sm mb-2 block">
                    STATUS
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('waiting')}
                      className={`px-4 py-2 border-[3px] border-border font-bold text-sm uppercase transition-all ${
                        filter === 'waiting'
                          ? 'bg-retro-coral text-text-light shadow-retro'
                          : 'bg-surface text-text-primary hover:bg-retro-tan'
                      }`}
                    >
                      Waiting
                    </button>
                    <button
                      onClick={() => setFilter('active')}
                      className={`px-4 py-2 border-[3px] border-border font-bold text-sm uppercase transition-all ${
                        filter === 'active'
                          ? 'bg-retro-coral text-text-light shadow-retro'
                          : 'bg-surface text-text-primary hover:bg-retro-tan'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 border-[3px] border-border font-bold text-sm uppercase transition-all ${
                        filter === 'all'
                          ? 'bg-retro-coral text-text-light shadow-retro'
                          : 'bg-surface text-text-primary hover:bg-retro-tan'
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>

                {/* Token Filter */}
                <div className="flex-1">
                  <label className="retro-subheading text-sm mb-2 block">
                    TOKEN
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedToken('all')}
                      className={`px-4 py-2 border-[3px] border-border font-bold text-sm uppercase transition-all ${
                        selectedToken === 'all'
                          ? 'bg-retro-blue text-text-light shadow-retro'
                          : 'bg-surface text-text-primary hover:bg-retro-tan'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedToken('ETH')}
                      className={`px-4 py-2 border-[3px] border-border font-bold text-sm uppercase transition-all ${
                        selectedToken === 'ETH'
                          ? 'bg-retro-blue text-text-light shadow-retro'
                          : 'bg-surface text-text-primary hover:bg-retro-tan'
                      }`}
                    >
                      ETH
                    </button>
                    <button
                      onClick={() => setSelectedToken('BTC')}
                      className={`px-4 py-2 border-[3px] border-border font-bold text-sm uppercase transition-all ${
                        selectedToken === 'BTC'
                          ? 'bg-retro-blue text-text-light shadow-retro'
                          : 'bg-surface text-text-primary hover:bg-retro-tan'
                      }`}
                    >
                      BTC
                    </button>
                    <button
                      onClick={() => setSelectedToken('SOL')}
                      className={`px-4 py-2 border-[3px] border-border font-bold text-sm uppercase transition-all ${
                        selectedToken === 'SOL'
                          ? 'bg-retro-blue text-text-light shadow-retro'
                          : 'bg-surface text-text-primary hover:bg-retro-tan'
                      }`}
                    >
                      SOL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Duels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDuels.map((duel) => (
              <div key={duel.id} className="card-retro hover:scale-105 transition-transform">
                {/* Status Badge */}
                <div className="mb-4 flex justify-between items-start">
                  <div
                    className={`retro-badge ${
                      duel.status === 'waiting'
                        ? 'bg-retro-green'
                        : 'bg-retro-coral'
                    }`}
                  >
                    {duel.status === 'waiting' ? 'OPEN' : 'LIVE'}
                  </div>
                  <div className="text-xs text-text-muted">{duel.createdAt}</div>
                </div>

                {/* Duel Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted uppercase">Creator</span>
                    <span className="font-mono font-bold text-text-primary">
                      {duel.creator}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted uppercase">Entry Fee</span>
                    <span className="text-2xl font-display text-retro-coral">
                      {duel.entryFee} ETH
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted uppercase">Token</span>
                    <span className="retro-badge bg-retro-blue text-text-light">
                      {duel.token}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted uppercase">Duration</span>
                    <span className="font-bold text-text-primary">
                      {duel.duration} min
                    </span>
                  </div>
                </div>

                {/* Prize Pool */}
                <div className="bg-retro-yellow border-[3px] border-border p-3 mb-4 shadow-retro-inset">
                  <div className="text-xs text-text-muted uppercase mb-1">Prize Pool</div>
                  <div className="text-xl font-display text-text-primary">
                    {(duel.entryFee * 2).toFixed(2)} ETH
                  </div>
                </div>

                {/* Action Button */}
                {duel.status === 'waiting' ? (
                  <Link
                    href={`/duel/${duel.id}`}
                    className="btn-primary w-full text-center block"
                  >
                    JOIN DUEL
                  </Link>
                ) : (
                  <Link
                    href={`/duel/${duel.id}`}
                    className="btn-secondary w-full text-center block"
                  >
                    WATCH LIVE
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredDuels.length === 0 && (
            <div className="text-center py-16">
              <div className="retro-frame inline-block p-8">
                <div className="w-24 h-24 mx-auto mb-4 opacity-30">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="20" y="30" width="60" height="40" rx="5" className="fill-none stroke-border" strokeWidth="4" />
                    <circle cx="40" cy="50" r="8" className="fill-border" />
                    <circle cx="60" cy="50" r="8" className="fill-border" />
                  </svg>
                </div>
                <h3 className="retro-heading text-2xl mb-2">NO DUELS FOUND</h3>
                <p className="text-text-muted mb-6">
                  No duels match your filters. Try adjusting them or create a new duel!
                </p>
                <Link href="/create" className="btn-primary">
                  CREATE DUEL
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  )
}
