'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TradingChart from '@/components/TradingChart'
import { useWallet } from '@/contexts/WalletContext'
import { getDuelById, getDuelParticipants, joinDuel, getDuelTrades, recordTrade, completeDuel, claimRewards } from '@/lib/duel-api'
import { casperContracts } from '@/lib/casper-contracts'
import { priceOracle } from '@/lib/price-oracle'
import type { Duel, DuelParticipant, DuelTrade } from '@/lib/supabase'

export default function DuelArenaPage() {
  const params = useParams()
  const router = useRouter()
  const { walletAddress } = useWallet()

  const [duel, setDuel] = useState<Duel | null>(null)
  const [participants, setParticipants] = useState<DuelParticipant[]>([])
  const [trades, setTrades] = useState<DuelTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isTrading, setIsTrading] = useState(false)

  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceHistory, setPriceHistory] = useState<Array<{ time: number; price: number }>>([])
  const [tradeAmount, setTradeAmount] = useState('')
  const [startingBalance] = useState(100) // Starting balance in test tokens (e.g., 100 USDT equivalent)

  // Refs for tracking P&L changes
  const prevUserPnL = useRef<number>(0)
  const prevOpponentPnL = useRef<number>(0)

  // Load duel data
  useEffect(() => {
    if (params.id) {
      loadDuel()
    }
  }, [params.id])

  const loadDuel = async () => {
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

      // Calculate time remaining if duel is active
      if (duelData.status === 'active' && duelData.started_at) {
        const started = new Date(duelData.started_at).getTime()
        const duration = duelData.duration * 60 * 1000 // Convert minutes to ms
        const elapsed = Date.now() - started
        const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000))

        console.log('⏰ Timer calculation:', {
          started: duelData.started_at,
          duration: duelData.duration,
          elapsed: Math.floor(elapsed / 1000) + 's',
          remaining: remaining + 's'
        })

        setTimeRemaining(remaining)
      } else if (duelData.status === 'waiting') {
        // Duel hasn't started yet
        setTimeRemaining(duelData.duration * 60)
      }
    } catch (error) {
      console.error('Error loading duel:', error)
    } finally {
      setLoading(false)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (duel?.status !== 'active' || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => clearInterval(timer)
  }, [duel?.status])

  // Handle timer expiry - only redirect if timer was previously > 0
  useEffect(() => {
    if (duel?.status === 'active' && timeRemaining === 0 && duel.started_at) {
      // Check if duel actually expired (not just initialized)
      const started = new Date(duel.started_at).getTime()
      const duration = duel.duration * 60 * 1000
      const hasExpired = Date.now() - started >= duration

      if (hasExpired) {
        console.log('⏱️ Duel time expired, redirecting to results...')
        router.push(`/results/${params.id}`)
      }
    }
  }, [timeRemaining, duel?.status, duel?.started_at, duel?.duration, router, params.id])

  // Load real-time price data
  useEffect(() => {
    if (!duel) return

    const loadPriceData = async () => {
      try {
        // Get historical chart data
        const chartData = await priceOracle.getChartData(duel.trading_token, 1)
        setPriceHistory(chartData)

        // Get current price
        const price = await priceOracle.getCurrentPrice(duel.trading_token)
        setCurrentPrice(price)

        console.log(`💹 Loaded price data for ${duel.trading_token}:`, {
          current: price,
          dataPoints: chartData.length
        })
      } catch (error) {
        console.error('Error loading price data:', error)
      }
    }

    loadPriceData()

    // Start live price updates (every 5 seconds)
    const cleanup = priceOracle.startLivePriceUpdates(
      duel.trading_token,
      (price) => {
        console.log(`📈 Price update: ${duel.trading_token} = $${price.toFixed(2)}`)
        setCurrentPrice(price)
        setPriceHistory(prev => [...prev, { time: Date.now(), price }])
      },
      5000
    )

    return cleanup
  }, [duel?.trading_token])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleJoinDuel = async () => {
    if (!walletAddress || !duel) return

    setIsJoining(true)
    try {
      // 1. Execute blockchain transaction
      const joinTxHash = await casperContracts.joinDuel(
        walletAddress,
        duel.blockchain_id || 0,
        Number(duel.entry_fee)
      )

      console.log('✅ Join transaction sent:', joinTxHash)

      // 2. Update database
      const success = await joinDuel(duel.id, walletAddress, joinTxHash)

      if (success) {
        alert(`Joined duel! Transaction: ${joinTxHash}`)
        await loadDuel() // Reload to show updated participants
      }
    } catch (error: any) {
      console.error('Error joining duel:', error)
      alert(error.message || 'Failed to join duel')
    } finally {
      setIsJoining(false)
    }
  }

  const handleBuy = async () => {
    const amount = parseFloat(tradeAmount)
    if (!amount || amount <= 0 || !walletAddress || !duel) return

    setIsTrading(true)
    try {
      // 1. Execute blockchain buy transaction
      const txHash = await casperContracts.executeBuy(
        walletAddress,
        duel.blockchain_id || 0,
        duel.trading_token
      )

      console.log('✅ Buy transaction sent:', txHash)

      // 2. Record trade in database
      const participant = participants.find(p => p.wallet_address === walletAddress)
      if (participant) {
        await recordTrade(
          duel.id,
          participant.id,
          walletAddress,
          'buy',
          duel.trading_token,
          amount,
          currentPrice,
          txHash
        )

        await loadDuel() // Reload trades
        setTradeAmount('')
        alert(`Buy order executed! TX: ${txHash}`)
      }
    } catch (error: any) {
      console.error('Error executing buy:', error)
      alert(error.message || 'Failed to execute buy')
    } finally {
      setIsTrading(false)
    }
  }

  const handleSell = async () => {
    const amount = parseFloat(tradeAmount)
    if (!amount || amount <= 0 || !walletAddress || !duel) return

    setIsTrading(false)
    try {
      // 1. Execute blockchain sell transaction
      const txHash = await casperContracts.executeSell(
        walletAddress,
        duel.blockchain_id || 0,
        duel.trading_token
      )

      console.log('✅ Sell transaction sent:', txHash)

      // 2. Record trade in database
      const participant = participants.find(p => p.wallet_address === walletAddress)
      if (participant) {
        await recordTrade(
          duel.id,
          participant.id,
          walletAddress,
          'sell',
          duel.trading_token,
          amount,
          currentPrice,
          txHash
        )

        await loadDuel() // Reload trades
        setTradeAmount('')
        alert(`Sell order executed! TX: ${txHash}`)
      }
    } catch (error: any) {
      console.error('Error executing sell:', error)
      alert(error.message || 'Failed to execute sell')
    } finally {
      setIsTrading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-retro-cherry"></div>
            <p className="mt-4 text-text-muted">Loading duel...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!duel) {
    return null
  }

  // Check if user needs to join
  const userParticipant = participants.find(p => p.wallet_address === walletAddress)
  const isParticipant = !!userParticipant
  const needsToJoin = duel.status === 'waiting' && participants.length < 2 && !isParticipant

  // Determine which participant is which based on current user
  const currentUser = participants.find(p => p.wallet_address === walletAddress)
  const opponent = participants.find(p => p.wallet_address !== walletAddress)

  // Calculate stats for current user
  const userTrades = trades.filter(t => t.wallet_address === walletAddress)
  const userHoldings = userTrades.reduce((sum, t) => {
    return t.action === 'buy' ? sum + Number(t.amount) : sum - Number(t.amount)
  }, 0)

  // Calculate stats for opponent
  const opponentTrades = opponent ? trades.filter(t => t.wallet_address === opponent.wallet_address) : []
  const opponentHoldings = opponentTrades.reduce((sum, t) => {
    return t.action === 'buy' ? sum + Number(t.amount) : sum - Number(t.amount)
  }, 0)

  // Calculate P&L for both players based on current price
  const initialCash = startingBalance // Use starting balance instead of entry fee

  // Calculate user's cash spent/received from trades
  const userCashSpent = userTrades.reduce((sum, t) => {
    return t.action === 'buy' ? sum + (Number(t.amount) * Number(t.price)) : sum - (Number(t.amount) * Number(t.price))
  }, 0)

  const userCashRemaining = initialCash - userCashSpent
  const userPortfolioValue = userHoldings * currentPrice
  const userTotalValue = userCashRemaining + userPortfolioValue
  const userPnL = userTotalValue - initialCash
  const userPnLPercent = initialCash > 0 ? (userPnL / initialCash) * 100 : 0

  // Calculate opponent's cash spent/received from trades
  const opponentCashSpent = opponent ? opponentTrades.reduce((sum, t) => {
    return t.action === 'buy' ? sum + (Number(t.amount) * Number(t.price)) : sum - (Number(t.amount) * Number(t.price))
  }, 0) : 0

  const opponentCashRemaining = opponent ? initialCash - opponentCashSpent : 0
  const opponentPortfolioValue = opponent ? opponentHoldings * currentPrice : 0
  const opponentTotalValue = opponent ? opponentCashRemaining + opponentPortfolioValue : 0
  const opponentPnL = opponentTotalValue - initialCash
  const opponentPnLPercent = initialCash > 0 ? (opponentPnL / initialCash) * 100 : 0

  // Log P&L changes when they occur
  if (currentPrice > 0 && (Math.abs(userPnL - prevUserPnL.current) > 0.01 || Math.abs(opponentPnL - prevOpponentPnL.current) > 0.01)) {
    console.log(`💰 P&L Update:`)
    console.log(`  YOU: $${userPnL.toFixed(2)} (${userPnLPercent.toFixed(2)}%) - Cash: $${userCashRemaining.toFixed(2)}, Holdings: ${userHoldings.toFixed(4)} worth $${userPortfolioValue.toFixed(2)}`)
    if (opponent) {
      console.log(`  OPPONENT: $${opponentPnL.toFixed(2)} (${opponentPnLPercent.toFixed(2)}%) - Cash: $${opponentCashRemaining.toFixed(2)}, Holdings: ${opponentHoldings.toFixed(4)} worth $${opponentPortfolioValue.toFixed(2)}`)
    }
    prevUserPnL.current = userPnL
    prevOpponentPnL.current = opponentPnL
  }

  const handleCloseDuel = async () => {
    if (!duel || !walletAddress || participants.length < 2) return

    try {
      console.log('🏁 Closing duel...')
      console.log('Participants:', participants.length)
      console.log('Current price:', currentPrice)

      // Calculate final stats for EACH participant
      const participantStats = participants.map(p => {
        const pTrades = trades.filter(t => t.wallet_address === p.wallet_address)
        const pHoldings = pTrades.reduce((sum, t) => {
          return t.action === 'buy' ? sum + Number(t.amount) : sum - Number(t.amount)
        }, 0)
        const initialCash = Number(duel.entry_fee || 0)
        const tradeCost = pTrades.reduce((sum, t) => {
          return t.action === 'buy' ? sum + (Number(t.amount) * Number(t.price)) : sum - (Number(t.amount) * Number(t.price))
        }, 0)
        const totalValue = initialCash + (pHoldings * currentPrice) - tradeCost
        const pnl = totalValue - initialCash
        const pnlPercent = initialCash > 0 ? (pnl / initialCash) * 100 : 0

        console.log(`📊 ${p.wallet_address}: P&L ${pnlPercent.toFixed(2)}%, Holdings: ${pHoldings}, Total Value: ${totalValue}`)

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

      console.log('🏆 Winner:', winner.walletAddress, 'with', winner.pnlPercent.toFixed(2), '%', tiedParticipants.length > 1 ? '(tie - random winner)' : '')

      // Close duel on blockchain
      const closeTxHash = await casperContracts.closeDuel(
        walletAddress,
        duel.blockchain_id || 0
      )

      console.log('✅ Duel closed:', closeTxHash)

      // Update database
      await completeDuel(
        duel.id,
        winner.walletAddress,
        participantStats.map(p => ({
          participantId: p.participantId,
          finalBalance: p.finalBalance,
          pnl: p.pnl,
          pnlPercent: p.pnlPercent
        })),
        closeTxHash
      )

      console.log('✅ Database updated')

      // If current user is the winner, claim rewards
      if (winner.walletAddress === walletAddress) {
        console.log('🏆 You won! Claiming rewards...')
        try {
          const claimTxHash = await casperContracts.claimRewards(
            walletAddress,
            duel.blockchain_id || 0
          )
          console.log('✅ Rewards claimed:', claimTxHash)

          // Update database with claim transaction
          await claimRewards(winner.participantId, claimTxHash)
        } catch (claimError) {
          console.error('❌ Error claiming rewards:', claimError)
          // Don't block redirect if claim fails
        }
      }

      // Redirect to results
      router.push(`/results/${duel.id}`)
    } catch (error) {
      console.error('Error closing duel:', error)
      alert('Failed to close duel: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />

      <main className="pt-32 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Timer Header */}
          <div className="retro-frame bg-surface mb-6 p-6 text-center">
            <div className="text-sm retro-subheading text-text-primary mb-2">
              {duel.status === 'waiting' ? 'WAITING FOR OPPONENT' : 'TIME REMAINING'}
            </div>
            <div className="text-6xl font-retro text-retro-cherry mb-2 tracking-wider">
              {duel.status === 'waiting' ? '--:--' : formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-text-muted">
              Trading {duel.trading_token} • Entry Fee: {duel.entry_fee} CSPR
            </div>
          </div>

          {/* Join Duel Card (if user needs to join) */}
          {needsToJoin && (
            <div className="card-retro mb-6 bg-retro-cherry/20 border-retro-cherry text-center">
              <h3 className="retro-subheading text-xl mb-4">JOIN THIS DUEL</h3>
              <p className="text-text-muted mb-6">
                Entry Fee: <span className="font-bold text-retro-cherry">{duel.entry_fee} CSPR</span>
              </p>
              <button
                onClick={handleJoinDuel}
                disabled={isJoining || !walletAddress}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'JOINING...' : 'JOIN DUEL'}
              </button>
              {!walletAddress && (
                <p className="mt-4 text-xs text-retro-cherry">Please connect your wallet first</p>
              )}
            </div>
          )}

          {/* Players Comparison */}
          {participants.length >= 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Current User */}
              {currentUser && (
                <div className={`card-retro ${userPnLPercent >= opponentPnLPercent ? 'bg-accent-light-gray/20 border-accent-light-gray' : 'bg-retro-cherry/20 border-retro-cherry'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="retro-badge bg-retro-cherry mb-2">YOU</div>
                      <div className="font-mono text-sm text-text-primary">
                        {currentUser.wallet_address.slice(0, 8)}...{currentUser.wallet_address.slice(-6)}
                      </div>
                    </div>
                    <div className={`text-3xl font-retro ${userPnLPercent >= 0 ? 'text-accent-light-gray' : 'text-retro-cherry'}`}>
                      {userPnLPercent > 0 ? '+' : ''}{userPnLPercent.toFixed(2)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-surface-light border-2 border-accent-gray p-2 rounded-lg">
                      <div className="text-xs text-text-muted uppercase">Cash</div>
                      <div className="font-bold text-text-primary text-sm">${userCashRemaining.toFixed(2)}</div>
                    </div>
                    <div className="bg-surface-light border-2 border-accent-gray p-2 rounded-lg">
                      <div className="text-xs text-text-muted uppercase">Holdings</div>
                      <div className="font-bold text-text-primary text-sm">{userHoldings.toFixed(4)}</div>
                      <div className="text-xs text-text-muted">${userPortfolioValue.toFixed(2)}</div>
                    </div>
                    <div className="bg-surface-light border-2 border-accent-gray p-2 rounded-lg">
                      <div className="text-xs text-text-muted uppercase">P&L</div>
                      <div className={`font-bold text-sm ${userPnL >= 0 ? 'text-accent-light-gray' : 'text-retro-cherry'}`}>
                        {userPnL > 0 ? '+' : ''}${userPnL.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Opponent */}
              {opponent ? (
                <div className={`card-retro ${opponentPnLPercent > userPnLPercent ? 'bg-accent-light-gray/20 border-accent-light-gray' : 'bg-retro-cherry/20 border-retro-cherry'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="retro-badge bg-accent-gray text-text-primary mb-2">OPPONENT</div>
                      <div className="font-mono text-sm text-text-primary">
                        {opponent.wallet_address.slice(0, 8)}...{opponent.wallet_address.slice(-6)}
                      </div>
                    </div>
                    <div className={`text-3xl font-retro ${opponentPnLPercent >= 0 ? 'text-accent-light-gray' : 'text-retro-cherry'}`}>
                      {opponentPnLPercent > 0 ? '+' : ''}{opponentPnLPercent.toFixed(2)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-surface-light border-2 border-accent-gray p-2 rounded-lg">
                      <div className="text-xs text-text-muted uppercase">Cash</div>
                      <div className="font-bold text-text-primary text-sm">${opponentCashRemaining.toFixed(2)}</div>
                    </div>
                    <div className="bg-surface-light border-2 border-accent-gray p-2 rounded-lg">
                      <div className="text-xs text-text-muted uppercase">Holdings</div>
                      <div className="font-bold text-text-primary text-sm">{opponentHoldings.toFixed(4)}</div>
                      <div className="text-xs text-text-muted">${opponentPortfolioValue.toFixed(2)}</div>
                    </div>
                    <div className="bg-surface-light border-2 border-accent-gray p-2 rounded-lg">
                      <div className="text-xs text-text-muted uppercase">P&L</div>
                      <div className={`font-bold text-sm ${opponentPnL >= 0 ? 'text-accent-light-gray' : 'text-retro-cherry'}`}>
                        {opponentPnL > 0 ? '+' : ''}${opponentPnL.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-retro bg-surface-light/50 border-accent-gray border-dashed">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⏳</div>
                    <div className="retro-subheading mb-2">WAITING FOR OPPONENT</div>
                    <div className="text-text-muted text-sm">Duel will start when another player joins</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Chart Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trading Chart */}
              {priceHistory.length > 0 && (
                <div className="card-retro">
                  <div className="retro-subheading mb-4">PRICE CHART - {duel.trading_token}</div>
                  <TradingChart
                    data={priceHistory}
                    trades={trades.map(t => ({
                      time: new Date(t.timestamp).getTime(),
                      price: Number(t.price),
                      action: t.action as 'buy' | 'sell',
                      amount: Number(t.amount)
                    }))}
                    currentPrice={currentPrice}
                    tokenSymbol={duel.trading_token}
                  />
                </div>
              )}

              {/* Trade History */}
              <div className="card-retro">
                <div className="retro-subheading mb-4">TRADE HISTORY ({trades.length})</div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {trades.length === 0 ? (
                    <div className="text-center py-8 text-text-muted text-sm">
                      No trades yet. Make your first move!
                    </div>
                  ) : (
                    trades.map((trade) => (
                      <div key={trade.id} className="flex justify-between items-center bg-surface border-2 border-accent-gray p-3 rounded-lg">
                        <div className={`retro-badge ${trade.action === 'buy' ? 'bg-accent-light-gray' : 'bg-retro-cherry'}`}>
                          {trade.action.toUpperCase()}
                        </div>
                        <div className="font-mono text-sm text-text-primary">
                          {trade.wallet_address.slice(0, 6)}...{trade.wallet_address.slice(-4)}
                        </div>
                        <div className="font-mono text-sm text-text-primary">
                          {Number(trade.amount).toFixed(4)} {trade.token}
                        </div>
                        <div className="font-mono text-sm text-text-primary">${Number(trade.price).toFixed(2)}</div>
                        {trade.tx_hash && (
                          <a
                            href={`https://testnet.cspr.live/deploy/${trade.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-retro-cherry hover:underline"
                          >
                            View TX
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Trading Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Trade Input */}
                {isParticipant && duel.status === 'active' ? (
                  <div className="card-retro">
                    <h3 className="retro-subheading mb-4">TRADE</h3>

                    <div className="mb-4">
                      <label className="text-xs text-text-muted uppercase mb-2 block">
                        Amount ({duel.trading_token})
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                        placeholder="0.0000"
                        className="w-full px-4 py-3 border-2 border-accent-gray bg-surface text-text-primary font-bold text-lg focus:outline-none focus:border-retro-cherry rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={handleBuy}
                        disabled={
                          !tradeAmount ||
                          parseFloat(tradeAmount) <= 0 ||
                          parseFloat(tradeAmount) * currentPrice > userCashRemaining ||
                          isTrading ||
                          currentPrice === 0
                        }
                        className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTrading ? 'BUYING...' : 'BUY'}
                      </button>
                      <button
                        onClick={handleSell}
                        disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || parseFloat(tradeAmount) > userHoldings || isTrading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTrading ? 'SELLING...' : 'SELL'}
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-text-muted">
                      <div className="flex justify-between">
                        <span>Available Cash:</span>
                        <span className="font-bold text-text-primary">${userCashRemaining.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Holdings:</span>
                        <span className="font-bold text-text-primary">{userHoldings.toFixed(4)} {duel.trading_token}</span>
                      </div>
                      {tradeAmount && parseFloat(tradeAmount) > 0 && (
                        <div className="flex justify-between border-t border-accent-gray pt-1 mt-1">
                          <span>Est. Cost:</span>
                          <span className="font-bold text-retro-cherry">${(parseFloat(tradeAmount) * currentPrice).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card-retro bg-surface-light text-center py-8">
                    <div className="text-text-muted">
                      {duel.status === 'waiting' ? 'Trading will start when duel begins' : 'Spectator mode'}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="card bg-surface">
                  <div className="retro-subheading text-sm mb-3">DUEL INFO</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Status</span>
                      <span className="font-bold text-retro-cherry uppercase">{duel.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Duration</span>
                      <span className="font-bold text-text-primary">{duel.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Prize Pool</span>
                      <span className="font-bold text-retro-cherry">{duel.prize_pool} CSPR</span>
                    </div>
                    {duel.create_tx_hash && (
                      <div className="pt-2 border-t border-accent-gray">
                        <a
                          href={`https://testnet.cspr.live/deploy/${duel.create_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-retro-cherry hover:underline break-all"
                        >
                          View Create TX
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
