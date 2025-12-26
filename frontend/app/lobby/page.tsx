'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Duel {
  id: string
  creator: string
  entryFee: number // Entry fee in CSPR
  tradingToken: string // Token that will be traded during the duel (NFT or crypto)
  duration: number
  status: 'waiting' | 'active'
  createdAt: string
}

const MOCK_DUELS: Duel[] = [
  {
    id: '1',
    creator: '0x7a3f...9d2c',
    entryFee: 100,
    tradingToken: 'ETH',
    duration: 15,
    status: 'waiting',
    createdAt: '2 min ago'
  },
  {
    id: '2',
    creator: '0x4b8e...1a5f',
    entryFee: 50,
    tradingToken: 'BTC',
    duration: 30,
    status: 'waiting',
    createdAt: '5 min ago'
  },
  {
    id: '3',
    creator: '0x9c2d...7e4b',
    entryFee: 200,
    tradingToken: 'NFT-Dragons',
    duration: 10,
    status: 'waiting',
    createdAt: '8 min ago'
  },
  {
    id: '4',
    creator: '0x1f6a...3c9e',
    entryFee: 150,
    tradingToken: 'SOL',
    duration: 20,
    status: 'waiting',
    createdAt: '12 min ago'
  },
  {
    id: '5',
    creator: '0x5d3b...8f2a',
    entryFee: 500,
    tradingToken: 'NFT-Apes',
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
    if (selectedToken !== 'all' && duel.tradingToken !== selectedToken) return false
    return true
  })

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />

      <main className="pt-32 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="retro-heading text-2xl md:text-3xl mb-2">
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
                  <div className="text-2xl font-bold text-retro-cherry">
                    {MOCK_DUELS.filter(d => d.status === 'waiting').length}
                  </div>
                  <div className="text-sm text-text-muted uppercase">Open Duels</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-retro-cherry-light">
                    {MOCK_DUELS.filter(d => d.status === 'active').length}
                  </div>
                  <div className="text-sm text-text-muted uppercase">Active Now</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-light-gray">247</div>
                  <div className="text-sm text-text-muted uppercase">Online</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-retro-cherry">$12.4K</div>
                  <div className="text-sm text-text-muted uppercase">Prize Pool</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="card bg-surface p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Status Filter */}
                <div className="flex-1">
                  <label className="retro-subheading text-sm mb-2 block">
                    STATUS
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('waiting')}
                      className={`px-4 py-2 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        filter === 'waiting'
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      Waiting
                    </button>
                    <button
                      onClick={() => setFilter('active')}
                      className={`px-4 py-2 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        filter === 'active'
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        filter === 'all'
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
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
                      className={`px-4 py-2 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        selectedToken === 'all'
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedToken('ETH')}
                      className={`px-4 py-2 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        selectedToken === 'ETH'
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      ETH
                    </button>
                    <button
                      onClick={() => setSelectedToken('BTC')}
                      className={`px-4 py-2 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        selectedToken === 'BTC'
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      BTC
                    </button>
                    <button
                      onClick={() => setSelectedToken('SOL')}
                      className={`px-4 py-2 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        selectedToken === 'SOL'
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      SOL
                    </button>
                    <button
                      onClick={() => setSelectedToken('NFT-Dragons')}
                      className={`px-4 py-2 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        selectedToken === 'NFT-Dragons'
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      NFT Dragons
                    </button>
                    <button
                      onClick={() => setSelectedToken('NFT-Apes')}
                      className={`px-4 py-2 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        selectedToken === 'NFT-Apes'
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      NFT Apes
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
                        ? 'bg-accent-light-gray border-accent-gray'
                        : 'bg-retro-cherry border-retro-cherry-light'
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
                    <span className="text-2xl font-retro text-retro-cherry">
                      {duel.entryFee} CSPR
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted uppercase">Trading</span>
                    <span className="retro-badge bg-accent-light-gray text-text-primary border-2 border-accent-gray">
                      {duel.tradingToken}
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
                <div className="bg-accent-gray border-2 border-accent-light-gray p-3 mb-4 shadow-retro-inset rounded-lg">
                  <div className="text-xs text-text-muted uppercase mb-1">Prize Pool</div>
                  <div className="text-xl font-retro text-text-primary">
                    {(duel.entryFee * 2).toFixed(0)} CSPR
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
                    <rect x="20" y="30" width="60" height="40" rx="5" className="fill-none stroke-retro-charcoal" strokeWidth="4" />
                    <circle cx="40" cy="50" r="8" className="fill-retro-charcoal" />
                    <circle cx="60" cy="50" r="8" className="fill-retro-charcoal" />
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
