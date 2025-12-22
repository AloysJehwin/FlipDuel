'use client'

import { useState } from 'react'
import { Menu, X, Settings, Wallet, User, ChevronDown } from 'lucide-react'
import Button from './ui/Button'
import clsx from 'clsx'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  const navLinks = [
    { name: 'Duel', href: '#duel', active: true },
    { name: 'History', href: '#history', active: false },
    { name: 'Leaderboard', href: '#leaderboard', active: false },
    { name: 'How to Play', href: '#guide', active: false },
  ]
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary-bg/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neon-green/10 rounded-lg flex items-center justify-center border border-neon-green/30">
              <span className="text-2xl">⚔️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold neon-text">FlipDuel</h1>
              <p className="text-xs text-text-muted">1v1 Arena</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={clsx(
                  'text-sm font-medium transition-colors duration-200',
                  link.active
                    ? 'text-neon-green'
                    : 'text-text-muted hover:text-neon-green'
                )}
              >
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {/* Wallet Balance */}
            <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg">
              <Wallet className="w-4 h-4 text-neon-green" />
              <span className="font-semibold text-text-primary">1,250.00</span>
              <span className="text-xs text-text-muted">CSPR</span>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg hover:border-neon-green/50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-neon-green" />
                </div>
                <ChevronDown className={clsx(
                  'w-4 h-4 text-text-muted transition-transform',
                  profileOpen && 'rotate-180'
                )} />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-xl animate-fadeIn">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-semibold text-text-primary">Player</p>
                    <p className="text-xs text-text-muted">Level 12</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-text-muted hover:text-neon-green hover:bg-surface-light rounded transition-colors">
                      Profile
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-text-muted hover:text-neon-green hover:bg-surface-light rounded transition-colors">
                      Wallet
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-text-muted hover:text-neon-green hover:bg-surface-light rounded transition-colors">
                      Settings
                    </button>
                    <div className="border-t border-border my-2"></div>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-surface-light rounded transition-colors">
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Settings */}
            <button className="p-2 bg-surface border border-border rounded-lg hover:border-neon-green/50 transition-all">
              <Settings className="w-5 h-5 text-text-muted hover:text-neon-green transition-colors" />
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-muted hover:text-neon-green"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-border animate-slideUp">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={clsx(
                  'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  link.active
                    ? 'bg-neon-green/10 text-neon-green'
                    : 'text-text-muted hover:text-neon-green hover:bg-surface-light'
                )}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-light border border-border rounded-lg">
                <Wallet className="w-4 h-4 text-neon-green" />
                <span className="font-semibold text-text-primary">1,250.00 CSPR</span>
              </div>
              <Button variant="secondary" className="w-full">Profile</Button>
              <Button variant="secondary" className="w-full">Settings</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
