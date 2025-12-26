'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const TRADING_TOKENS = ['ETH', 'BTC', 'SOL', 'MATIC', 'AVAX', 'NFT-Dragons', 'NFT-Apes', 'NFT-Punks']
const DURATIONS = [5, 10, 15, 20, 30, 60]
const ENTRY_PRESETS = [10, 50, 100, 250, 500, 1000]

export default function CreateDuelPage() {
  const router = useRouter()
  const [entryFee, setEntryFee] = useState(100) // Entry fee in CSPR
  const [customEntry, setCustomEntry] = useState('')
  const [selectedToken, setSelectedToken] = useState('ETH') // Token to trade during duel
  const [duration, setDuration] = useState(15)
  const [isPrivate, setIsPrivate] = useState(false)
  const [walletBalance] = useState(2450) // Mock wallet balance in CSPR

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

      <main className="pt-32 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="retro-heading text-2xl md:text-3xl mb-4">
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
                      className={`py-3 border-2 border-accent-gray font-bold uppercase transition-all rounded-lg ${
                        entryFee === preset && !customEntry
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      {preset} CSPR
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
                      className="flex-1 px-4 py-3 border-2 border-accent-gray bg-surface text-text-primary font-bold text-lg focus:outline-none focus:border-retro-cherry rounded-lg"
                    />
                    <div className="px-4 py-3 bg-accent-gray border-2 border-accent-light-gray font-bold text-text-primary rounded-lg">
                      CSPR
                    </div>
                  </div>
                  <div className="text-xs text-text-muted mt-2">
                    Wallet Balance: {walletBalance} CSPR
                  </div>
                </div>
              </div>

              {/* Token Selection */}
              <div className="card-retro">
                <h3 className="retro-subheading text-xl mb-4">
                  2. SELECT TRADING TOKEN
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  Choose which token/NFT you'll trade during the duel
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TRADING_TOKENS.map((token) => (
                    <button
                      key={token}
                      onClick={() => setSelectedToken(token)}
                      className={`py-4 border-2 border-accent-gray font-bold text-sm uppercase transition-all rounded-lg ${
                        selectedToken === token
                          ? 'bg-retro-cherry text-text-primary shadow-retro scale-105 border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                      }`}
                    >
                      {token.replace('NFT-', 'NFT ')}
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
                      className={`py-3 border-2 border-accent-gray font-bold uppercase transition-all rounded-lg ${
                        duration === dur
                          ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                          : 'bg-surface-light text-text-primary hover:bg-accent-gray'
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
                    className={`w-full p-4 border-2 border-accent-gray text-left transition-all rounded-lg ${
                      !isPrivate
                        ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                        : 'bg-surface-light text-text-primary hover:bg-accent-gray'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1">PUBLIC</div>
                    <div className="text-sm opacity-90">
                      Anyone can join this duel from the lobby
                    </div>
                  </button>

                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`w-full p-4 border-2 border-accent-gray text-left transition-all rounded-lg ${
                      isPrivate
                        ? 'bg-retro-cherry text-text-primary shadow-retro border-retro-cherry-light'
                        : 'bg-surface-light text-text-primary hover:bg-accent-gray'
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
                <div className="retro-frame bg-surface p-6">
                  <h3 className="retro-subheading text-lg mb-4 text-text-primary">
                    DUEL SUMMARY
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="bg-surface-light border-2 border-accent-gray p-3 rounded-lg">
                      <div className="text-xs text-text-muted uppercase mb-1">
                        Your Entry Fee
                      </div>
                      <div className="text-2xl font-retro text-retro-cherry">
                        {entryFee.toFixed(3)} CSPR
                      </div>
                    </div>

                    <div className="bg-surface-light border-2 border-accent-gray p-3 rounded-lg">
                      <div className="text-xs text-text-muted uppercase mb-1">
                        Trading Token
                      </div>
                      <div className="text-xl font-bold text-retro-cherry">
                        {selectedToken}
                      </div>
                    </div>

                    <div className="bg-surface-light border-2 border-accent-gray p-3 rounded-lg">
                      <div className="text-xs text-text-muted uppercase mb-1">
                        Duration
                      </div>
                      <div className="text-xl font-bold text-accent-light-gray">
                        {duration} Minutes
                      </div>
                    </div>

                    <div className="bg-accent-gray border-2 border-accent-light-gray p-3 shadow-retro-inset rounded-lg">
                      <div className="text-xs text-text-muted uppercase mb-1">
                        Total Prize Pool
                      </div>
                      <div className="text-2xl font-retro text-text-primary">
                        {potentialWinnings.toFixed(3)} CSPR
                      </div>
                    </div>

                    <div className="text-xs text-text-muted space-y-1">
                      <div className="flex justify-between">
                        <span>Platform Fee (5%)</span>
                        <span>{platformFee.toFixed(4)} CSPR</span>
                      </div>
                      <div className="flex justify-between font-bold text-text-primary">
                        <span>Net Winnings</span>
                        <span>{netWinnings.toFixed(3)} CSPR</span>
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
                    <div className="mt-3 text-xs text-retro-cherry font-bold text-center">
                      Insufficient balance
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="card mt-6 bg-surface">
                  <div className="text-sm space-y-2">
                    <div className="font-bold text-text-primary">💡 Quick Tips</div>
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
