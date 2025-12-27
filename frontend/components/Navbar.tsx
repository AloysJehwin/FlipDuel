'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Wallet } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { casperWallet } from '@/lib/casper-wallet'

interface NavbarProps {
  visible?: boolean
}

export default function Navbar({ visible = true }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { walletConnected, walletAddress, walletBalance, isConnecting, connectWallet, disconnectWallet } = useWallet()

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Lobby', href: '/lobby' },
    { name: 'Create', href: '/create' },
    { name: 'History', href: '/history' },
  ]

  if (!visible) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b-2 border-border shadow-retro backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300">
            <div className="w-12 h-12 bg-retro-cherry border-2 border-retro-cherry-light flex items-center justify-center transition-all duration-300 hover:bg-retro-cherry-light rounded-lg">
              <span className="text-2xl">⚔️</span>
            </div>
            <div>
              <h1 className="text-xl leading-none mb-1 uppercase tracking-wide" style={{
                fontFamily: 'Corptic, Impact, Arial Black, sans-serif',
                color: '#DC143C',
                textShadow: '2px 2px 0 #FF1744, -1px -1px 0 #B71C1C',
                transform: 'skewY(-2deg)'
              }}>
                FLIPDUEL
              </h1>
              <p className="text-xs text-text-muted uppercase font-bold">Trading Arena</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 border-2 border-accent-gray bg-surface-light text-text-primary font-bold uppercase text-sm hover:bg-retro-cherry hover:border-retro-cherry-light shadow-retro transition-all duration-300 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {walletConnected ? (
              <>
                {/* Testnet Badge */}
                <div className="px-3 py-1 bg-accent-gray border-2 border-accent-light-gray text-text-primary text-xs font-bold uppercase transition-all duration-300 hover:bg-accent-light-gray rounded-md">
                  TESTNET
                </div>

                {/* Wallet Balance */}
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-light border-2 border-accent-gray shadow-retro-inset transition-all duration-300 hover:border-retro-cherry hover:shadow-retro rounded-lg">
                  <Wallet className="w-4 h-4 text-text-primary" />
                  <span className="font-bold text-text-primary">{walletBalance || '0.0'}</span>
                  <span className="text-xs text-text-muted font-bold">CSPR</span>
                </div>

                {/* Wallet Address */}
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-retro-cherry border-2 border-retro-cherry-light text-text-primary font-mono text-sm font-bold shadow-retro hover:bg-retro-cherry-light hover:shadow-retro-lg transition-all duration-300 hover:-translate-y-0.5 rounded-lg"
                  title="Click to disconnect"
                >
                  {walletAddress ? casperWallet.formatAddress(walletAddress) : '0x...'}
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border-2 border-retro-cherry-light bg-retro-cherry text-text-primary shadow-retro hover:bg-retro-cherry-light transition-colors duration-300 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-light border-t-2 border-accent-gray">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-3 border-2 border-accent-gray bg-surface text-text-primary font-bold uppercase text-sm hover:bg-retro-cherry shadow-retro transition-colors duration-300 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t-2 border-accent-gray space-y-2">
              {walletConnected ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface-light border-2 border-accent-gray shadow-retro-inset rounded-lg">
                    <Wallet className="w-4 h-4 text-text-primary" />
                    <span className="font-bold text-text-primary">{walletBalance || '0'} CSPR</span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-3 bg-retro-cherry border-2 border-retro-cherry-light text-text-primary font-mono text-sm font-bold text-center shadow-retro w-full hover:bg-retro-cherry-light transition-colors duration-300 rounded-lg"
                  >
                    {walletAddress ? casperWallet.formatAddress(walletAddress) : '0x...'}
                  </button>
                  <button
                    onClick={disconnectWallet}
                    className="btn-outline w-full text-sm"
                  >
                    DISCONNECT
                  </button>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
