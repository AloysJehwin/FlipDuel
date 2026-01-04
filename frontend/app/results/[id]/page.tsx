'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useWallet } from '@/contexts/WalletContext'
import { getDuelById, getDuelParticipants, getDuelTrades, completeDuel, claimRewards } from '@/lib/duel-api'
import { casperContracts } from '@/lib/casper-contracts'
import type { Duel, DuelParticipant, DuelTrade } from '@/lib/supabase'

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
  const { walletAddress } = useWallet()

  const [duel, setDuel] = useState<Duel | null>(null)
  const [participants, setParticipants] = useState<DuelParticipant[]>([])
  const [trades, setTrades] = useState<DuelTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [currentPrice] = useState(3245.67) // Final price snapshot

  useEffect(() => {
    loadDuelResults()
  }, [params.id])

  const loadDuelResults = async () => {
    if (!params.id) return

    try {
      const duelData = await getDuelById(params.id as string)
      if (!duelData) {
        router.push('/lobby')
        return
      }

      setDuel(duelData)

      const participantsData = await getDuelParticipants(params.id as string)
      setParticipants(participantsData)

      const tradesData = await getDuelTrades(params.id as string)
      setTrades(tradesData)

      // If duel is still active, close it now
      if (duelData.status === 'active' && walletAddress && participantsData.length >= 2) {
        await closeDuelNow(duelData, participantsData, tradesData)
      }
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeDuelNow = async (duelData: Duel, participantsData: DuelParticipant[], tradesData: DuelTrade[]) => {
    if (processing || !walletAddress) return

    setProcessing(true)
    try {
      console.log('🏁 Auto-closing duel...')

      // Calculate final stats for EACH participant
      const participantStats = participantsData.map(p => {
        const pTrades = tradesData.filter(t => t.wallet_address === p.wallet_address)
        const pHoldings = pTrades.reduce((sum, t) => {
          return t.action === 'buy' ? sum + Number(t.amount) : sum - Number(t.amount)
        }, 0)
        const initialCash = Number(duelData.entry_fee || 0)
        const tradeCost = pTrades.reduce((sum, t) => {
          return t.action === 'buy' ? sum + (Number(t.amount) * Number(t.price)) : sum - (Number(t.amount) * Number(t.price))
        }, 0)
        const totalValue = initialCash + (pHoldings * currentPrice) - tradeCost
        const pnl = totalValue - initialCash
        const pnlPercent = initialCash > 0 ? (pnl / initialCash) * 100 : 0

        return {
          participantId: p.id,
          walletAddress: p.wallet_address,
          finalBalance: totalValue,
          pnl: pnl,
          pnlPercent: pnlPercent
        }
      })

      // Determine winner (highest P&L%)
      // If tie, winner is randomly chosen
      const sortedByPnL = [...participantStats].sort((a, b) => b.pnlPercent - a.pnlPercent)

      // Check if it's a tie
      const topPnL = sortedByPnL[0].pnlPercent
      const tiedParticipants = sortedByPnL.filter(p => p.pnlPercent === topPnL)

      const winner = tiedParticipants.length > 1
        ? tiedParticipants[Math.floor(Math.random() * tiedParticipants.length)]
        : sortedByPnL[0]

      console.log('📊 Final Stats:', participantStats.map(p => ({
        address: p.walletAddress.slice(0, 8),
        pnl: p.pnlPercent.toFixed(2) + '%'
      })))
      console.log('🏆 Winner:', winner.walletAddress, 'with', winner.pnlPercent.toFixed(2) + '%')

      // Close duel on blockchain
      const closeTxHash = await casperContracts.closeDuel(
        walletAddress,
        duelData.blockchain_id || 0
      )

      // Update database
      await completeDuel(
        duelData.id,
        winner.walletAddress,
        participantStats.map(p => ({
          participantId: p.participantId,
          finalBalance: p.finalBalance,
          pnl: p.pnl,
          pnlPercent: p.pnlPercent
        })),
        closeTxHash
      )

      // If current user is winner, claim rewards
      if (winner.walletAddress === walletAddress) {
        try {
          const claimTxHash = await casperContracts.claimRewards(
            walletAddress,
            duelData.blockchain_id || 0
          )
          await claimRewards(winner.participantId, claimTxHash)
        } catch (err) {
          console.error('Claim failed:', err)
        }
      }

      // Reload data
      await loadDuelResults()
    } catch (error) {
      console.error('Error closing duel:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-retro-cherry text-2xl mb-4">Loading results...</div>
        </div>
      </div>
    )
  }

  if (!duel || participants.length < 2) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-retro-cherry text-2xl mb-4">Duel not found or incomplete</div>
          <Link href="/lobby" className="btn-primary">Back to Lobby</Link>
        </div>
      </div>
    )
  }

  const myParticipant = participants.find(p => p.wallet_address === walletAddress)
  const opponent = participants.find(p => p.wallet_address !== walletAddress)

  if (!myParticipant || !opponent) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-retro-cherry text-2xl">You were not a participant in this duel</div>
          <Link href="/lobby" className="btn-primary mt-4">Back to Lobby</Link>
        </div>
      </div>
    )
  }

  const isWinner = duel.winner_address === walletAddress
  const myPnLPercent = myParticipant.pnl_percent || 0
  const opponentPnLPercent = opponent.pnl_percent || 0
  const prizeAmount = Number(duel.prize_pool || 0)

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
                <h1 className="retro-heading text-5xl md:text-7xl mb-4 text-retro-cream"
                    style={{textShadow: '5px 5px 0px rgba(44,44,44,0.5)'}}>
                  VICTORY!
                </h1>
                <div className="card-retro inline-block px-6 py-2 mb-4">
                  <div className="font-mono font-bold text-retro-charcoal">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}</div>
                </div>
                <p className="text-2xl text-retro-cream mb-6">
                  You won the duel!
                </p>
                <div className="card-retro bg-retro-yellow inline-block px-8 py-4">
                  <div className="text-sm text-text-muted uppercase mb-1">Prize Won</div>
                  <div className="text-4xl font-retro text-retro-charcoal">
                    +{prizeAmount.toFixed(3)} CSPR
                  </div>
                </div>
              </div>
            ) : (
              <div className="retro-frame bg-retro-coral p-12 animate-fadeIn">
                <div className="w-20 h-20 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-retro-cream" />
                    <line x1="35" y1="35" x2="65" y2="65" stroke="currentColor" strokeWidth="8" className="text-retro-cream" />
                    <line x1="65" y1="35" x2="35" y2="65" stroke="currentColor" strokeWidth="8" className="text-retro-cream" />
                  </svg>
                </div>
                <h1 className="retro-heading text-5xl md:text-7xl mb-4 text-retro-cream"
                    style={{textShadow: '5px 5px 0px rgba(44,44,44,0.5)'}}>
                  DEFEAT
                </h1>
                <div className="card-retro inline-block px-6 py-2 mb-4">
                  <div className="font-mono font-bold text-retro-charcoal">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}</div>
                </div>
                <p className="text-2xl text-retro-cream mb-6">
                  Better luck next time!
                </p>
                <div className="text-lg text-retro-cream">
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
                  <div className="font-mono text-lg font-bold text-retro-charcoal mb-1">
                    {duel.winner_address?.slice(0, 8)}...{duel.winner_address?.slice(-6)}
                  </div>
                  {isWinner && (
                    <div className="text-xs text-retro-charcoal uppercase font-bold">
                      ★ This is you ★
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface/80 border-[3px] border-retro-charcoal p-3">
                    <div className="text-xs text-text-muted uppercase">Starting</div>
                    <div className="font-bold text-retro-charcoal">
                      {Number(duel.entry_fee).toFixed(3)} CSPR
                    </div>
                  </div>
                  <div className="bg-surface/80 border-[3px] border-retro-charcoal p-3">
                    <div className="text-xs text-text-muted uppercase">Final</div>
                    <div className="font-bold text-retro-blue">
                      {(isWinner ? myParticipant.final_balance : opponent.final_balance || 0).toFixed(3)} CSPR
                    </div>
                  </div>
                </div>

                <div className="bg-retro-yellow border-[3px] border-retro-charcoal p-4 shadow-retro-inset">
                  <div className="text-xs text-text-muted uppercase mb-1">Total P&L</div>
                  <div className="text-3xl font-retro text-retro-charcoal">
                    +{(isWinner ? myPnLPercent : opponentPnLPercent).toFixed(2)}%
                  </div>
                  <div className="text-sm font-bold text-retro-green">
                    +{(isWinner ? myParticipant.pnl : opponent.pnl || 0).toFixed(4)} CSPR
                  </div>
                </div>
              </div>

              {/* Loser Card */}
              <div className="card-retro bg-retro-coral">
                <div className="mb-4">
                  <div className="retro-badge bg-surface mb-2">
                    2ND PLACE
                  </div>
                  <div className="font-mono text-lg font-bold text-retro-cream mb-1">
                    {(isWinner ? opponent.wallet_address : myParticipant.wallet_address).slice(0, 8)}...{(isWinner ? opponent.wallet_address : myParticipant.wallet_address).slice(-6)}
                  </div>
                  {!isWinner && (
                    <div className="text-xs text-retro-cream uppercase font-bold">
                      ★ This is you ★
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface/80 border-[3px] border-retro-charcoal p-3">
                    <div className="text-xs text-text-muted uppercase">Starting</div>
                    <div className="font-bold text-retro-charcoal">
                      {Number(duel.entry_fee).toFixed(3)} CSPR
                    </div>
                  </div>
                  <div className="bg-surface/80 border-[3px] border-retro-charcoal p-3">
                    <div className="text-xs text-text-muted uppercase">Final</div>
                    <div className="font-bold text-retro-blue">
                      {(isWinner ? opponent.final_balance : myParticipant.final_balance || 0).toFixed(3)} CSPR
                    </div>
                  </div>
                </div>

                <div className="bg-surface border-[3px] border-retro-charcoal p-4 shadow-retro-inset">
                  <div className="text-xs text-text-muted uppercase mb-1">Total P&L</div>
                  <div className="text-3xl font-retro text-retro-charcoal">
                    {(isWinner ? opponentPnLPercent : myPnLPercent).toFixed(2)}%
                  </div>
                  <div className="text-sm font-bold text-retro-coral">
                    {(isWinner ? opponent.pnl : myParticipant.pnl || 0).toFixed(4)} CSPR
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trade History */}
          <section className="mb-12">
            <h2 className="retro-heading text-2xl mb-6">YOUR TRADE HISTORY</h2>

            <div className="card-retro">
              {trades.filter(t => t.wallet_address === walletAddress).length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-4 border-retro-charcoal">
                          <th className="text-left py-3 px-4 retro-subheading text-sm">Type</th>
                          <th className="text-left py-3 px-4 retro-subheading text-sm">Amount</th>
                          <th className="text-left py-3 px-4 retro-subheading text-sm">Price</th>
                          <th className="text-left py-3 px-4 retro-subheading text-sm">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.filter(t => t.wallet_address === walletAddress).map((trade) => (
                          <tr key={trade.id} className="border-b-2 border-retro-charcoal/20">
                            <td className="py-3 px-4">
                              <span className={`retro-badge ${
                                trade.action === 'buy' ? 'bg-retro-green' : 'bg-retro-coral'
                              }`}>
                                {trade.action.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono">{Number(trade.amount).toFixed(4)} {trade.token}</td>
                            <td className="py-3 px-4 font-mono">${Number(trade.price).toFixed(2)}</td>
                            <td className="py-3 px-4 text-text-muted">
                              {new Date(trade.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 pt-4 border-t-4 border-retro-charcoal flex justify-between items-center">
                    <span className="retro-subheading">TOTAL P&L</span>
                    <span className={`text-2xl font-retro ${
                      myPnLPercent >= 0 ? 'text-retro-green' : 'text-retro-coral'
                    }`}>
                      {myPnLPercent > 0 ? '+' : ''}{myPnLPercent.toFixed(2)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  No trades were made during this duel
                </div>
              )}
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
