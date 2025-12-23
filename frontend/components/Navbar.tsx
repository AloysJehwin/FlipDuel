'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Wallet, User, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Lobby', href: '/lobby' },
    { name: 'Create', href: '/create' },
    { name: 'History', href: '/history' },
  ]

  const handleConnectWallet = () => {
    // TODO: Implement wallet connection logic
    setWalletConnected(true)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-win95-light border-b-4 border-border shadow-retro">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-retro-coral border-4 border-border flex items-center justify-center shadow-retro">
              <span className="text-2xl">⚔️</span>
            </div>
            <div>
              <h1 className="retro-heading text-xl leading-none mb-1">FLIP DUEL</h1>
              <p className="text-xs text-text-muted uppercase font-bold">Trading Arena</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 border-[3px] border-border bg-surface text-text-primary font-bold uppercase text-sm hover:bg-retro-tan hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-retro transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {walletConnected ? (
              <>
                {/* Wallet Balance */}
                <div className="flex items-center gap-2 px-4 py-2 bg-retro-yellow border-[3px] border-border shadow-retro-inset">
                  <Wallet className="w-4 h-4 text-text-primary" />
                  <span className="font-bold text-text-primary">2.45</span>
                  <span className="text-xs text-text-muted font-bold">ETH</span>
                </div>

                {/* Wallet Address */}
                <button className="px-4 py-2 bg-retro-blue border-[3px] border-border text-text-light font-mono text-sm font-bold shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  0x7a3f...9d2c
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="btn-primary"
              >
                CONNECT WALLET
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border-[3px] border-border bg-retro-coral text-text-light shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-retro-tan border-t-4 border-border animate-slideDown">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-3 border-[3px] border-border bg-surface text-text-primary font-bold uppercase text-sm hover:bg-win95-light shadow-retro transition-all"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t-3 border-border space-y-2">
              {walletConnected ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-3 bg-retro-yellow border-[3px] border-border shadow-retro-inset">
                    <Wallet className="w-4 h-4 text-text-primary" />
                    <span className="font-bold text-text-primary">2.45 ETH</span>
                  </div>
                  <div className="px-4 py-3 bg-retro-blue border-[3px] border-border text-text-light font-mono text-sm font-bold text-center shadow-retro">
                    0x7a3f...9d2c
                  </div>
                </>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="btn-primary w-full"
                >
                  CONNECT WALLET
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
