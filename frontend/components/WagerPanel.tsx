'use client'

import { useState } from 'react'
import Button from './ui/Button'
import { DollarSign } from 'lucide-react'
import clsx from 'clsx'

interface WagerPanelProps {
  onCreateDuel?: (amount: number) => void
  maxBalance?: number
}

export default function WagerPanel({ onCreateDuel, maxBalance = 10000 }: WagerPanelProps) {
  const [wagerAmount, setWagerAmount] = useState<string>('50')
  const presetAmounts = [25, 50, 100, 250]
  
  const handlePresetClick = (amount: number) => {
    setWagerAmount(amount.toString())
  }
  
  const handleMaxClick = () => {
    setWagerAmount(maxBalance.toString())
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setWagerAmount(value)
    }
  }
  
  const handleCreateDuel = () => {
    const amount = parseFloat(wagerAmount) || 0
    if (amount > 0 && amount <= maxBalance) {
      onCreateDuel?.(amount)
    }
  }
  
  const isValidAmount = () => {
    const amount = parseFloat(wagerAmount) || 0
    return amount > 0 && amount <= maxBalance
  }
  
  return (
    <div className="card">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-text-primary mb-1">Set Your Wager</h3>
          <p className="text-sm text-text-muted">Choose your battle amount</p>
        </div>
        
        {/* Amount Input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-neon-green" />
          </div>
          <input
            type="text"
            value={wagerAmount}
            onChange={handleInputChange}
            placeholder="0.00"
            className={clsx(
              'w-full pl-12 pr-16 py-4 bg-surface-light border-2 rounded-lg',
              'text-2xl font-bold text-center text-text-primary',
              'focus:outline-none focus:border-neon-green transition-colors',
              isValidAmount() ? 'border-border' : 'border-red-500/50'
            )}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="text-sm font-medium text-text-muted">CSPR</span>
          </div>
        </div>
        
        {/* Balance Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Available Balance</span>
          <span className="font-semibold text-text-primary">
            {maxBalance.toFixed(2)} CSPR
          </span>
        </div>
        
        {/* Preset Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handlePresetClick(amount)}
              className={clsx(
                'py-3 rounded-lg font-semibold text-sm transition-all duration-200',
                wagerAmount === amount.toString()
                  ? 'bg-neon-green/20 border-2 border-neon-green text-neon-green'
                  : 'bg-surface-light border border-border text-text-primary hover:border-neon-green hover:text-neon-green'
              )}
            >
              {amount}
            </button>
          ))}
        </div>
        
        {/* MAX Button */}
        <button
          onClick={handleMaxClick}
          className="w-full py-3 bg-surface-light border border-border rounded-lg font-semibold text-sm text-text-primary hover:border-neon-green hover:text-neon-green transition-all duration-200"
        >
          MAX
        </button>
        
        {/* Create Duel Button */}
        <Button
          onClick={handleCreateDuel}
          disabled={!isValidAmount()}
          className="w-full text-lg py-4"
        >
          <span className="flex items-center justify-center gap-2">
            <Swords className="w-5 h-5" />
            Create Duel
          </span>
        </Button>
        
        {/* Info Text */}
        <p className="text-xs text-text-muted text-center">
          Duels are provably fair and instant. Winner takes all.
        </p>
      </div>
    </div>
  )
}

function Swords({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 3l-6 6m0 0V4m0 5h5M3 21l6-6m0 0v5m0-5H4"
      />
    </svg>
  )
}
