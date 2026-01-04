'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WalletContextType {
  walletConnected: boolean
  walletAddress: string | null
  walletBalance: string | null
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  switchAccount: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkConnection = async () => {
      try {
        const provider = (window as any).CasperWalletProvider
        if (!provider) return

        const isConnected = await provider().isConnected()
        if (isConnected) {
          const publicKey = await provider().getActivePublicKey()
          console.log('✅ Casper Wallet already connected:', publicKey)
          setWalletConnected(true)
          setWalletAddress(publicKey)
        }
      } catch (error) {
        console.log('No wallet connected yet')
      }
    }

    checkConnection()

    // Listen for account changes
    const handleAccountChange = () => {
      checkConnection()
    }

    window.addEventListener('casper-wallet:accountChanged', handleAccountChange)
    return () => window.removeEventListener('casper-wallet:accountChanged', handleAccountChange)
  }, [])

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      const provider = (window as any).CasperWalletProvider
      if (!provider) {
        throw new Error('Casper Wallet extension not found. Please install it from Chrome Web Store.')
      }

      await provider().requestConnection()
      const publicKey = await provider().getActivePublicKey()
      
      console.log('✅ Connected to Casper Wallet:', publicKey)
      setWalletConnected(true)
      setWalletAddress(publicKey)
    } catch (error: any) {
      console.error('❌ Error connecting wallet:', error)
      alert(error.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      const provider = (window as any).CasperWalletProvider
      if (provider) {
        await provider().disconnectFromSite()
      }
      setWalletConnected(false)
      setWalletAddress(null)
      setWalletBalance(null)
      console.log('✅ Wallet disconnected')
    } catch (error: any) {
      console.error('❌ Error disconnecting wallet:', error)
    }
  }

  const switchAccount = async () => {
    await disconnectWallet()
    await connectWallet()
  }

  return (
    <WalletContext.Provider
      value={{
        walletConnected,
        walletAddress,
        walletBalance,
        isConnecting,
        connectWallet,
        disconnectWallet,
        switchAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
