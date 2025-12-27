// CASPER.click Wallet Integration (TESTNET)
// Documentation: https://docs.casper.click
// Network: Casper Testnet

export interface CasperWallet {
  isConnected: boolean
  publicKey: string | null
  balance: string | null
}

declare global {
  interface Window {
    CasperWalletProvider?: any
  }
}

// Casper Network Configuration
const CASPER_NETWORK = 'casper-test' // Using testnet
const CASPER_TESTNET_RPC = 'https://testnet.cspr.live/rpc'

class CasperWalletService {
  private provider: any = null
  private network: string = CASPER_NETWORK
  private balanceCache: { [key: string]: { balance: string; timestamp: number } } = {}
  private CACHE_DURATION = 30000 // 30 seconds cache

  /**
   * Check if CASPER.click wallet extension is installed
   */
  isInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.CasperWalletProvider
  }

  /**
   * Connect to CASPER.click wallet
   * Opens the wallet popup for user to approve connection
   */
  async connect(): Promise<CasperWallet> {
    if (!this.isInstalled()) {
      throw new Error('CASPER.click wallet is not installed. Please install it from https://casper.click')
    }

    try {
      this.provider = window.CasperWalletProvider()

      // Request connection to TESTNET
      const isConnected = await this.provider.requestConnection()

      console.log('🔌 Connection result:', isConnected)

      // Get the active public key
      const publicKey = await this.provider.getActivePublicKey()

      console.log('🔗 Connected to Casper TESTNET')
      console.log('📍 Network:', this.network)
      console.log('🔑 Public Key:', publicKey)

      if (!publicKey) {
        throw new Error('No public key found. Please make sure you have an account in CASPER.click wallet.')
      }

      // Fetch balance from RPC
      const balance = await this.getBalance(publicKey)

      // Store connection in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('casper_wallet_connected', 'true')
        localStorage.setItem('casper_wallet_address', publicKey)
        localStorage.setItem('casper_wallet_balance', balance)
      }

      return {
        isConnected: true,
        publicKey,
        balance
      }
    } catch (error: any) {
      console.error('Error connecting to CASPER wallet:', error)
      throw new Error(error.message || 'Failed to connect to CASPER wallet. Make sure you are on Testnet.')
    }
  }

  /**
   * Disconnect from wallet
   */
  async disconnect(): Promise<void> {
    this.provider = null
    // Clear cache
    this.balanceCache = {}
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('casper_wallet_connected')
      localStorage.removeItem('casper_wallet_address')
      localStorage.removeItem('casper_wallet_balance')
    }
  }

  /**
   * Get wallet balance using Casper RPC with caching
   */
  async getBalance(publicKey: string, forceRefresh: boolean = false): Promise<string> {
    try {
      // Check cache first
      if (!forceRefresh && this.balanceCache[publicKey]) {
        const cached = this.balanceCache[publicKey]
        const now = Date.now()

        if (now - cached.timestamp < this.CACHE_DURATION) {
          console.log('💾 Using cached balance:', cached.balance, 'CSPR')
          return cached.balance
        }
      }

      console.log('🔍 Fetching fresh balance for:', publicKey)

      // First get state root hash
      const stateRootHash = await this.getStateRootHash()
      console.log('📦 State root hash:', stateRootHash)

      // Then get main purse
      const mainPurse = await this.getMainPurseUref(publicKey)
      console.log('👛 Main purse:', mainPurse)

      // Finally get balance
      const response = await fetch(CASPER_TESTNET_RPC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'state_get_balance',
          params: {
            state_root_hash: stateRootHash,
            purse_uref: mainPurse
          },
          id: 1
        })
      })

      const data = await response.json()
      console.log('💵 Balance response:', data)

      if (data.error) {
        console.error('❌ RPC Error:', data.error)
        return '0'
      }

      if (data.result && data.result.balance_value) {
        // Convert motes to CSPR (1 CSPR = 1,000,000,000 motes)
        const balanceInMotes = BigInt(data.result.balance_value)
        const balanceInCSPR = Number(balanceInMotes) / 1000000000
        const formattedBalance = balanceInCSPR.toFixed(2)

        // Cache the balance
        this.balanceCache[publicKey] = {
          balance: formattedBalance,
          timestamp: Date.now()
        }

        console.log('✅ Balance fetched and cached:', formattedBalance, 'CSPR')
        return formattedBalance
      }

      console.log('⚠️ No balance found, returning 0')
      return '0'
    } catch (error) {
      console.error('❌ Error fetching balance:', error)
      return '0'
    }
  }

  /**
   * Get the latest state root hash
   */
  private async getStateRootHash(): Promise<string> {
    try {
      const response = await fetch(CASPER_TESTNET_RPC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'chain_get_state_root_hash',
          params: [],
          id: 1
        })
      })

      const data = await response.json()
      return data.result.state_root_hash
    } catch (error) {
      console.error('Error getting state root hash:', error)
      throw error
    }
  }

  /**
   * Get the main purse URef for a public key
   */
  private async getMainPurseUref(publicKey: string): Promise<string> {
    try {
      const stateRootHash = await this.getStateRootHash()

      const response = await fetch(CASPER_TESTNET_RPC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'state_get_account_info',
          params: {
            state_root_hash: stateRootHash,
            public_key: publicKey
          },
          id: 1
        })
      })

      const data = await response.json()

      if (data.error) {
        console.error('Error getting account info:', data.error)
        throw new Error('Account not found on testnet')
      }

      return data.result.account.main_purse
    } catch (error) {
      console.error('Error getting main purse:', error)
      throw error
    }
  }

  /**
   * Get current connected account
   */
  async getActiveAccount(): Promise<string | null> {
    try {
      if (!this.provider) {
        // Try to reconnect from localStorage
        if (typeof window !== 'undefined') {
          const connected = localStorage.getItem('casper_wallet_connected')
          const address = localStorage.getItem('casper_wallet_address')
          if (connected === 'true' && address) {
            // Reinitialize provider
            this.provider = window.CasperWalletProvider()
            return address
          }
        }
        return null
      }

      const accounts = await this.provider.getActiveAccount()
      return accounts && accounts.length > 0 ? accounts[0] : null
    } catch (error) {
      console.error('Error getting active account:', error)
      return null
    }
  }

  /**
   * Restore wallet connection from localStorage
   */
  async restoreConnection(): Promise<CasperWallet | null> {
    try {
      if (typeof window === 'undefined') return null

      const connected = localStorage.getItem('casper_wallet_connected')
      const address = localStorage.getItem('casper_wallet_address')
      const storedBalance = localStorage.getItem('casper_wallet_balance')

      if (connected !== 'true' || !address) {
        return null
      }

      if (!this.isInstalled()) {
        return null
      }

      this.provider = window.CasperWalletProvider()

      // Get fresh balance
      const balance = await this.getBalance(address)

      // Update stored balance
      if (balance) {
        localStorage.setItem('casper_wallet_balance', balance)
      }

      console.log('🔄 Restored wallet connection')
      console.log('🔑 Address:', address)
      console.log('💰 Balance:', balance, 'CSPR')

      return {
        isConnected: true,
        publicKey: address,
        balance: balance || storedBalance
      }
    } catch (error) {
      console.error('Error restoring connection:', error)
      return null
    }
  }

  /**
   * Sign and send a transaction
   */
  async signAndSendTransaction(
    recipientPublicKey: string,
    amount: string,
    transferId?: number
  ): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Wallet not connected')
      }

      // Convert CSPR to motes
      const amountInMotes = (BigInt(amount) * BigInt(1000000000)).toString()

      const deploy = await this.provider.sign({
        deploy: {
          payment: { amount: '100000000' }, // 0.1 CSPR gas fee
          session: {
            transfer: {
              amount: amountInMotes,
              target: recipientPublicKey,
              id: transferId
            }
          }
        }
      })

      // Send the signed deploy
      const deployHash = await this.provider.send(deploy)
      return deployHash
    } catch (error: any) {
      console.error('Error signing transaction:', error)
      throw new Error(error.message || 'Failed to sign transaction')
    }
  }

  /**
   * Format public key for display (show first 6 and last 4 characters)
   */
  formatAddress(address: string): string {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
}

// Export singleton instance
export const casperWallet = new CasperWalletService()

// Export utility function for easy component usage
export function useCasperWallet() {
  return {
    isInstalled: () => casperWallet.isInstalled(),
    connect: () => casperWallet.connect(),
    disconnect: () => casperWallet.disconnect(),
    getBalance: (publicKey: string) => casperWallet.getBalance(publicKey),
    getActiveAccount: () => casperWallet.getActiveAccount(),
    signAndSendTransaction: (recipient: string, amount: string, id?: number) =>
      casperWallet.signAndSendTransaction(recipient, amount, id),
    formatAddress: (address: string) => casperWallet.formatAddress(address)
  }
}
