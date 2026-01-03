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

  // Setup CSPR.click event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkConnection = () => {
      const csprclick = (window as any).csprclick
      if (!csprclick) return

      // Check if already connected
      const account = csprclick.getActiveAccount?.()
      if (account) {
        console.log('✅ [Context] Wallet already connected:', account)
        setWalletConnected(true)
        setWalletAddress(account.public_key)
      }
    }

    // Check connection status after CSPR.click loads
    const checkInterval = setInterval(() => {
      if ((window as any).csprclick) {
        checkConnection()
        clearInterval(checkInterval)
      }
    }, 100)

    // Setup event listeners for connection changes
    const handleConnect = (account: any) => {
      console.log('✅ [Context] Wallet connected event:', account)
      const publicKey = account?.public_key || account?.publicKey
      if (publicKey) {
        setWalletConnected(true)
        setWalletAddress(publicKey)
        setIsConnecting(false)
      }
    }

    const handleDisconnect = () => {
      console.log('ℹ️ [Context] Wallet disconnected event')
      setWalletConnected(false)
      setWalletAddress(null)
      setWalletBalance(null)
    }

    // Listen for CSPR.click events (once it's loaded)
    const setupListeners = () => {
      const csprclick = (window as any).csprclick
      if (csprclick?.on) {
        console.log('📡 Setting up CSPR.click event listeners')
        csprclick.on('connected', handleConnect)
        csprclick.on('disconnected', handleDisconnect)
        csprclick.on('accountChanged', handleConnect)
      }
    }

    // Wait for CSPR.click to be ready
    const listenerInterval = setInterval(() => {
      if ((window as any).csprclick?.on) {
        setupListeners()
        clearInterval(listenerInterval)
      }
    }, 100)

    return () => {
      clearInterval(checkInterval)
      clearInterval(listenerInterval)
      // Cleanup event listeners
      const csprclick = (window as any).csprclick
      if (csprclick?.off) {
        csprclick.off('connected', handleConnect)
        csprclick.off('disconnected', handleDisconnect)
        csprclick.off('accountChanged', handleConnect)
      }
    }
  }, [])

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      const csprclick = (window as any).csprclick

      if (!csprclick) {
        throw new Error('CSPR.click not initialized. Please refresh the page.')
      }

      console.log('🔄 [Context] Connecting wallet via CSPR.click...')
      console.log('🔍 Available methods:', Object.keys(csprclick))

      await csprclick.signIn()

      // Check immediately after sign in if account is available
      setTimeout(() => {
        const account = csprclick.getActiveAccount?.()
        if (account) {
          const publicKey = account.public_key || account.publicKey
          console.log('✅ [Context] Account connected:', publicKey)
          setWalletConnected(true)
          setWalletAddress(publicKey)
        }
        setIsConnecting(false)
      }, 500)

      console.log('✅ [Context] Sign-in completed')
    } catch (error: any) {
      console.error('❌ [Context] Error connecting wallet:', error)
      alert(error.message || 'Failed to connect wallet')
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      const csprclick = (window as any).csprclick
      if (csprclick?.signOut) {
        await csprclick.signOut()
      }
      setWalletConnected(false)
      setWalletAddress(null)
      setWalletBalance(null)
    } catch (error) {
      console.error('❌ [Context] Error disconnecting wallet:', error)
    }
  }

  const switchAccount = async () => {
    setIsConnecting(true)
    try {
      const csprclick = (window as any).csprclick

      if (!csprclick) {
        throw new Error('CSPR.click not initialized. Please refresh the page.')
      }

      console.log('🔄 [Context] Switching account...')

      // Sign out first
      await csprclick.signOut()
      setWalletConnected(false)
      setWalletAddress(null)
      setWalletBalance(null)

      // Then sign in with a new account
      await csprclick.signIn()

      // Check after sign in
      setTimeout(() => {
        const account = csprclick.getActiveAccount?.()
        if (account) {
          const publicKey = account.public_key || account.publicKey
          console.log('✅ [Context] Switched to account:', publicKey)
          setWalletConnected(true)
          setWalletAddress(publicKey)
        }
        setIsConnecting(false)
      }, 500)

      console.log('✅ [Context] Account switch completed')
    } catch (error: any) {
      console.error('❌ [Context] Error switching account:', error)
      alert(error.message || 'Failed to switch account')
      setIsConnecting(false)
    }
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
