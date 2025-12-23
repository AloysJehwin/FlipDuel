'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface TradeAction {
  type: 'BUY' | 'SELL'
  amount: number
  price: number
  timestamp: string
}

interface PlayerStats {
  address: string
  holdings: number
  cash: number
  totalValue: number
  pnl: number
  pnlPercent: number
  trades: TradeAction[]
}

export default function DuelArenaPage() {
  const params = useParams()
  const router = useRouter()
  const [timeRemaining, setTimeRemaining] = useState(15 * 60) // 15 minutes in seconds
  const [currentPrice, setCurrentPrice] = useState(3245.67)
  const [tradeAmount, setTradeAmount] = useState('')
  const [duelStatus, setDuelStatus] = useState<'waiting' | 'active' | 'finished'>('active')

  // Mock player data
  const [player1, setPlayer1] = useState<PlayerStats>({
    address: '0x7a3f...9d2c (You)',
    holdings: 0.5,
    cash: 0.838,
    totalValue: 2.46,
    pnl: 0.36,
    pnlPercent: 17.14,
    trades: [],
  })

  const [player2, setPlayer2] = useState<PlayerStats>({
    address: '0x4b8e...1a5f',
    holdings: 0.3,
    cash: 1.02,
    totalValue: 1.99,
    pnl: -0.11,
    pnlPercent: -5.24,
    trades: [],
  })

  // Simulate price changes
  useEffect(() => {
    const priceInterval = setInterval(() => {
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.5) * 10
        return Math.max(prev + change, 3000)
      })
    }, 2000)

    return () => clearInterval(priceInterval)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (duelStatus !== 'active') return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setDuelStatus('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [duelStatus])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleBuy = () => {
    const amount = parseFloat(tradeAmount)
    if (!amount || amount <= 0) return

    // TODO: Execute buy transaction
    console.log('Buying', amount, 'at', currentPrice)
    setTradeAmount('')
  }

  const handleSell = () => {
    const amount = parseFloat(tradeAmount)
    if (!amount || amount <= 0 || amount > player1.holdings) return

    // TODO: Execute sell transaction
    console.log('Selling', amount, 'at', currentPrice)
    setTradeAmount('')
  }

  const isWinning = player1.pnlPercent > player2.pnlPercent

  if (duelStatus === 'finished') {
    router.push(`/results/${params.id}`)
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Timer Header */}
          <div className="retro-frame bg-retro-gradient mb-6 p-6 text-center">
            <div className="text-sm retro-subheading text-text-light mb-2">
              TIME REMAINING
            </div>
            <div className="text-6xl font-retro text-text-light mb-2 tracking-wider">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-text-light">
              Trading ETH • Entry Fee: 0.1 ETH
            </div>
          </div>

          {/* Players Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Player 1 (You) */}
            <div className={`card-retro ${isWinning ? 'bg-retro-green' : 'bg-retro-coral'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="retro-badge bg-retro-yellow mb-2">YOU</div>
                  <div className="font-mono text-sm text-text-primary">
                    {player1.address}
                  </div>
                </div>
                <div className={`text-3xl font-display ${
                  player1.pnlPercent >= 0 ? 'text-text-primary' : 'text-text-light'
                }`}>
                  {player1.pnlPercent > 0 ? '+' : ''}{player1.pnlPercent.toFixed(2)}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface/80 border-[3px] border-border p-3">
                  <div className="text-xs text-text-muted uppercase">Holdings</div>
                  <div className="font-bold text-text-primary">{player1.holdings.toFixed(4)} ETH</div>
                </div>
                <div className="bg-surface/80 border-[3px] border-border p-3">
                  <div className="text-xs text-text-muted uppercase">Cash</div>
                  <div className="font-bold text-text-primary">{player1.cash.toFixed(4)} ETH</div>
                </div>
                <div className="bg-surface/80 border-[3px] border-border p-3">
                  <div className="text-xs text-text-muted uppercase">Total Value</div>
                  <div className="font-bold text-retro-blue">{player1.totalValue.toFixed(4)} ETH</div>
                </div>
                <div className="bg-surface/80 border-[3px] border-border p-3">
                  <div className="text-xs text-text-muted uppercase">P&L</div>
                  <div className={`font-bold ${player1.pnl >= 0 ? 'text-retro-green' : 'text-retro-coral'}`}>
                    {player1.pnl > 0 ? '+' : ''}{player1.pnl.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            </div>

            {/* Player 2 (Opponent) */}
            <div className={`card-retro ${!isWinning ? 'bg-retro-green' : 'bg-retro-coral'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="retro-badge bg-retro-blue text-text-light mb-2">OPPONENT</div>
                  <div className="font-mono text-sm text-text-primary">
                    {player2.address}
                  </div>
                </div>
                <div className={`text-3xl font-display ${
                  player2.pnlPercent >= 0 ? 'text-text-primary' : 'text-text-light'
                }`}>
                  {player2.pnlPercent > 0 ? '+' : ''}{player2.pnlPercent.toFixed(2)}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface/80 border-[3px] border-border p-3">
                  <div className="text-xs text-text-muted uppercase">Holdings</div>
                  <div className="font-bold text-text-primary">{player2.holdings.toFixed(4)} ETH</div>
                </div>
                <div className="bg-surface/80 border-[3px] border-border p-3">
                  <div className="text-xs text-text-muted uppercase">Cash</div>
                  <div className="font-bold text-text-primary">{player2.cash.toFixed(4)} ETH</div>
                </div>
                <div className="bg-surface/80 border-[3px] border-border p-3">
                  <div className="text-xs text-text-muted uppercase">Total Value</div>
                  <div className="font-bold text-retro-blue">{player2.totalValue.toFixed(4)} ETH</div>
                </div>
                <div className="bg-surface/80 border-[3px] border-border p-3">
                  <div className="text-xs text-text-muted uppercase">P&L</div>
                  <div className={`font-bold ${player2.pnl >= 0 ? 'text-retro-green' : 'text-retro-coral'}`}>
                    {player2.pnl > 0 ? '+' : ''}{player2.pnl.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Chart Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Price */}
              <div className="card-retro bg-retro-blue text-text-light">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm uppercase mb-1">ETH Current Price</div>
                    <div className="text-4xl font-display">${currentPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase mb-1">24h Change</div>
                    <div className="text-xl font-bold text-retro-green">+2.34%</div>
                  </div>
                </div>
              </div>

              {/* Mock Chart */}
              <div className="card-retro">
                <div className="retro-subheading mb-4">PRICE CHART</div>
                <div className="bg-win95-light border-4 border-border p-8 h-64 flex items-center justify-center">
                  <div className="text-center text-text-muted">
                    <div className="w-16 h-16 mx-auto mb-4 opacity-30">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <polyline points="10,90 30,60 50,70 70,30 90,50" fill="none" stroke="currentColor" strokeWidth="4" className="text-text-primary" />
                        <circle cx="30" cy="60" r="4" className="fill-border" />
                        <circle cx="50" cy="70" r="4" className="fill-border" />
                        <circle cx="70" cy="30" r="4" className="fill-border" />
                      </svg>
                    </div>
                    <div className="text-sm">Live price chart will display here</div>
                    <div className="text-xs">(Real-time candlestick chart)</div>
                  </div>
                </div>
              </div>

              {/* Trade History */}
              <div className="card-retro">
                <div className="retro-subheading mb-4">YOUR TRADES</div>
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-retro">
                  {player1.trades.length === 0 ? (
                    <div className="text-center py-8 text-text-muted text-sm">
                      No trades yet. Make your first move!
                    </div>
                  ) : (
                    player1.trades.map((trade, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-surface border-2 border-border p-2">
                        <div className={`retro-badge ${trade.type === 'BUY' ? 'bg-retro-green' : 'bg-retro-coral'}`}>
                          {trade.type}
                        </div>
                        <div className="font-mono text-sm">{trade.amount.toFixed(4)} ETH</div>
                        <div className="font-mono text-sm">${trade.price.toFixed(2)}</div>
                        <div className="text-xs text-text-muted">{trade.timestamp}</div>
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
                <div className="card-retro">
                  <h3 className="retro-subheading mb-4">TRADE</h3>

                  <div className="mb-4">
                    <label className="text-xs text-text-muted uppercase mb-2 block">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="0.0000"
                      className="w-full px-4 py-3 border-4 border-border bg-surface text-text-primary font-bold text-lg focus:outline-none focus:border-retro-blue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={handleBuy}
                      disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                      className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      BUY
                    </button>
                    <button
                      onClick={handleSell}
                      disabled={!tradeAmount || parseFloat(tradeAmount) > player1.holdings}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      SELL
                    </button>
                  </div>

                  <div className="text-xs text-text-muted">
                    Available: {player1.holdings.toFixed(4)} ETH
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={`retro-frame p-4 text-center ${
                  isWinning ? 'bg-retro-green' : 'bg-retro-coral'
                }`}>
                  <div className="text-sm uppercase mb-2 text-text-primary font-bold">
                    {isWinning ? 'YOU ARE WINNING!' : 'YOU ARE LOSING'}
                  </div>
                  <div className="text-xs text-text-primary">
                    {isWinning
                      ? 'Keep up the great trading!'
                      : 'Make smart moves to turn it around!'}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="card bg-win95-light">
                  <div className="retro-subheading text-sm mb-3">QUICK STATS</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Current Rank</span>
                      <span className="font-bold text-text-primary">
                        {isWinning ? '1st' : '2nd'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Lead/Deficit</span>
                      <span className={`font-bold ${
                        player1.pnlPercent > player2.pnlPercent ? 'text-retro-green' : 'text-retro-coral'
                      }`}>
                        {Math.abs(player1.pnlPercent - player2.pnlPercent).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Prize Pool</span>
                      <span className="font-bold text-retro-blue">0.2 ETH</span>
                    </div>
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
