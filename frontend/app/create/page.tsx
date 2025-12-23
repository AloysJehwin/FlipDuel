'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const TOKENS = ['ETH', 'BTC', 'SOL', 'MATIC', 'AVAX', 'DOT']
const DURATIONS = [5, 10, 15, 20, 30, 60]
const ENTRY_PRESETS = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0]

export default function CreateDuelPage() {
  const router = useRouter()
  const [entryFee, setEntryFee] = useState(0.1)
  const [customEntry, setCustomEntry] = useState('')
  const [selectedToken, setSelectedToken] = useState('ETH')
  const [duration, setDuration] = useState(15)
  const [isPrivate, setIsPrivate] = useState(false)
  const [walletBalance] = useState(2.45) // Mock wallet balance

  const handleCreateDuel = () => {
    // TODO: Connect to smart contract and create duel
    console.log('Creating duel:', {
      entryFee,
      selectedToken,
      duration,
      isPrivate,
    })

    // Redirect to lobby or duel page
    router.push('/lobby')
  }

  const potentialWinnings = entryFee * 2
  const platformFee = entryFee * 0.05 // 5% fee
  const netWinnings = potentialWinnings - platformFee

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="retro-heading text-4xl md:text-5xl mb-4">
              CREATE DUEL
            </h1>
            <p className="text-text-muted">
              Set up your trading duel and wait for an opponent
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Entry Fee Section */}
              <div className="card-retro">
                <h3 className="retro-subheading text-xl mb-4">
                  1. SET ENTRY FEE
                </h3>

                {/* Preset Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {ENTRY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setEntryFee(preset)
                        setCustomEntry('')
                      }}
                      className={`py-3 border-[3px] border-retro-charcoal font-bold uppercase transition-all ${
                        entryFee === preset && !customEntry
                          ? 'bg-retro-coral text-retro-cream shadow-retro'
                          : 'bg-surface text-retro-charcoal hover:bg-retro-tan'
                      }`}
                    >
                      {preset} ETH
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="text-sm text-text-muted uppercase mb-2 block">
                    Or enter custom amount
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={walletBalance}
                      value={customEntry}
                      onChange={(e) => {
                        setCustomEntry(e.target.value)
                        setEntryFee(parseFloat(e.target.value) || 0)
                      }}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 border-4 border-retro-charcoal bg-surface text-retro-charcoal font-bold text-lg focus:outline-none focus:border-retro-blue"
                    />
                    <div className="px-4 py-3 bg-retro-beige border-4 border-retro-charcoal font-bold">
                      ETH
                    </div>
                  </div>
                  <div className="text-xs text-text-muted mt-2">
                    Wallet Balance: {walletBalance} ETH
                  </div>
                </div>
              </div>

              {/* Token Selection */}
              <div className="card-retro">
                <h3 className="retro-subheading text-xl mb-4">
                  2. SELECT TOKEN
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  Choose which crypto token you'll trade during the duel
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TOKENS.map((token) => (
                    <button
                      key={token}
                      onClick={() => setSelectedToken(token)}
                      className={`py-4 border-4 border-retro-charcoal font-bold text-lg uppercase transition-all ${
                        selectedToken === token
                          ? 'bg-retro-blue text-retro-cream shadow-retro scale-105'
                          : 'bg-surface text-retro-charcoal hover:bg-retro-tan'
                      }`}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="card-retro">
                <h3 className="retro-subheading text-xl mb-4">
                  3. DUEL DURATION
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  How long will the trading battle last?
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDuration(dur)}
                      className={`py-3 border-[3px] border-retro-charcoal font-bold uppercase transition-all ${
                        duration === dur
                          ? 'bg-retro-green text-retro-cream shadow-retro'
                          : 'bg-surface text-retro-charcoal hover:bg-retro-tan'
                      }`}
                    >
                      {dur} MIN
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Option */}
              <div className="card-retro">
                <h3 className="retro-subheading text-xl mb-4">
                  4. VISIBILITY
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={`w-full p-4 border-4 border-retro-charcoal text-left transition-all ${
                      !isPrivate
                        ? 'bg-retro-blue text-retro-cream shadow-retro'
                        : 'bg-surface text-retro-charcoal hover:bg-retro-tan'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1">PUBLIC</div>
                    <div className="text-sm opacity-90">
                      Anyone can join this duel from the lobby
                    </div>
                  </button>

                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`w-full p-4 border-4 border-retro-charcoal text-left transition-all ${
                      isPrivate
                        ? 'bg-retro-blue text-retro-cream shadow-retro'
                        : 'bg-surface text-retro-charcoal hover:bg-retro-tan'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1">PRIVATE</div>
                    <div className="text-sm opacity-90">
                      Only people with your invite link can join
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="retro-frame bg-retro-gradient p-6">
                  <h3 className="retro-subheading text-lg mb-4 text-retro-cream">
                    DUEL SUMMARY
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="bg-surface/90 border-[3px] border-retro-charcoal p-3">
                      <div className="text-xs text-text-muted uppercase mb-1">
                        Your Entry Fee
                      </div>
                      <div className="text-2xl font-display text-retro-coral">
                        {entryFee.toFixed(3)} ETH
                      </div>
                    </div>

                    <div className="bg-surface/90 border-[3px] border-retro-charcoal p-3">
                      <div className="text-xs text-text-muted uppercase mb-1">
                        Trading Token
                      </div>
                      <div className="text-xl font-bold text-retro-blue">
                        {selectedToken}
                      </div>
                    </div>

                    <div className="bg-surface/90 border-[3px] border-retro-charcoal p-3">
                      <div className="text-xs text-text-muted uppercase mb-1">
                        Duration
                      </div>
                      <div className="text-xl font-bold text-retro-green">
                        {duration} Minutes
                      </div>
                    </div>

                    <div className="bg-retro-yellow border-[3px] border-retro-charcoal p-3 shadow-retro-inset">
                      <div className="text-xs text-text-muted uppercase mb-1">
                        Total Prize Pool
                      </div>
                      <div className="text-2xl font-display text-retro-charcoal">
                        {potentialWinnings.toFixed(3)} ETH
                      </div>
                    </div>

                    <div className="text-xs text-text-muted space-y-1">
                      <div className="flex justify-between">
                        <span>Platform Fee (5%)</span>
                        <span>{platformFee.toFixed(4)} ETH</span>
                      </div>
                      <div className="flex justify-between font-bold text-retro-charcoal">
                        <span>Net Winnings</span>
                        <span>{netWinnings.toFixed(3)} ETH</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateDuel}
                    disabled={entryFee <= 0 || entryFee > walletBalance}
                    className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    CREATE DUEL
                  </button>

                  {entryFee > walletBalance && (
                    <div className="mt-3 text-xs text-retro-coral font-bold text-center">
                      Insufficient balance
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="card mt-6 bg-retro-beige">
                  <div className="text-sm space-y-2">
                    <div className="font-bold text-retro-charcoal">💡 Quick Tips</div>
                    <ul className="text-text-muted space-y-1 text-xs">
                      <li>• Higher entry fees attract experienced traders</li>
                      <li>• Shorter duels = faster action</li>
                      <li>• Choose tokens you know well</li>
                      <li>• Private duels let you challenge friends</li>
                    </ul>
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
