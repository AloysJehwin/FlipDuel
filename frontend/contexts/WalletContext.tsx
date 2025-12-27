'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { casperWallet } from '@/lib/casper-wallet'

interface WalletContextType {
  walletConnected: boolean
  walletAddress: string | null
  walletBalance: string | null
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Restore wallet connection on mount (only once)
  useEffect(() => {
    restoreWalletConnection()
  }, [])

  const restoreWalletConnection = async () => {
    try {
      console.log('🔄 [Context] Attempting to restore wallet connection...')
      const wallet = await casperWallet.restoreConnection()
      console.log('🔄 [Context] Restore result:', wallet)

      if (wallet && wallet.isConnected) {
        console.log('✅ [Context] Wallet restored successfully')
        console.log('📍 [Context] Public Key:', wallet.publicKey)
        console.log('💰 [Context] Balance:', wallet.balance)

        setWalletConnected(true)
        setWalletAddress(wallet.publicKey)
        setWalletBalance(wallet.balance)
      } else {
        console.log('ℹ️ [Context] No wallet connection to restore')
      }
    } catch (error) {
      console.error('❌ [Context] Error restoring wallet connection:', error)
    }
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      if (!casperWallet.isInstalled()) {
        alert('CASPER.click wallet is not installed.\n\nPlease install it from:\nhttps://casper.click')
        window.open('https://casper.click', '_blank')
        setIsConnecting(false)
        return
      }

      const wallet = await casperWallet.connect()
      console.log('✅ [Context] Wallet connected:', wallet)
      console.log('📍 [Context] Connected:', wallet.isConnected)
      console.log('🔑 [Context] Public Key:', wallet.publicKey)
      console.log('💰 [Context] Balance:', wallet.balance)

      setWalletConnected(wallet.isConnected)
      setWalletAddress(wallet.publicKey)
      setWalletBalance(wallet.balance)
    } catch (error: any) {
      console.error('❌ [Context] Error connecting wallet:', error)
      alert(error.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    await casperWallet.disconnect()
    setWalletConnected(false)
    setWalletAddress(null)
    setWalletBalance(null)
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
