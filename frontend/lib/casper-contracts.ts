// Casper Contract Integration Service
// Simplified version using Casper Wallet for all interactions

// Note: casper-js-sdk v5 is not fully browser-compatible
// We'll construct arguments manually as byte arrays

// Contract addresses (update after deployment)
export const CONTRACT_ADDRESSES = {
  DUEL_MANAGER: process.env.NEXT_PUBLIC_DUEL_MANAGER_CONTRACT || '',
  TRADING_ENGINE: process.env.NEXT_PUBLIC_TRADING_ENGINE_CONTRACT || '',
  PRICE_ORACLE: process.env.NEXT_PUBLIC_PRICE_ORACLE_CONTRACT || '',
  LIQUID_STAKE: process.env.NEXT_PUBLIC_LIQUID_STAKE_CONTRACT || '',
}

// Network configuration
const CASPER_TESTNET_RPC = process.env.NEXT_PUBLIC_CASPER_RPC || 'https://testnet.cspr.live/rpc'
const NETWORK_NAME = 'casper-test'

// Helper to convert CSPR to motes (1 CSPR = 10^9 motes)
export const csprToMotes = (cspr: number): string => {
  return (cspr * 1_000_000_000).toString()
}

// Helper to convert motes to CSPR
export const motesToCspr = (motes: string | bigint): number => {
  return Number(BigInt(motes) / BigInt(1_000_000_000))
}

// Declare wallet provider type
declare global {
  interface Window {
    CasperWalletProvider?: any
  }
}

// Manual CLValue serialization helpers for browser compatibility
// Returns CLValue object with bytes and cl_type
function createCLU64(value: number) {
  const bytes = new Uint8Array(8)
  const view = new DataView(bytes.buffer)
  view.setBigUint64(0, BigInt(value), true) // little-endian
  return {
    bytes: Array.from(bytes),
    cl_type: 'U64',
    parsed: value.toString()
  }
}

function createCLU8(value: number) {
  return {
    bytes: [value],
    cl_type: 'U8',
    parsed: value.toString()
  }
}

function createCLU512(value: bigint) {
  // U512 is variable-length encoded
  let hex = value.toString(16)
  if (hex.length % 2) hex = '0' + hex
  const bytes = hex.match(/.{2}/g)?.map(b => parseInt(b, 16)) || []
  bytes.reverse() // little-endian
  const withLength = [bytes.length, ...bytes]
  return {
    bytes: withLength,
    cl_type: 'U512',
    parsed: value.toString()
  }
}

function createCLString(value: string) {
  const strBytes = Array.from(new TextEncoder().encode(value))
  const length = strBytes.length
  const lengthBytes = [
    length & 0xff,
    (length >> 8) & 0xff,
    (length >> 16) & 0xff,
    (length >> 24) & 0xff
  ]
  return {
    bytes: [...lengthBytes, ...strBytes],
    cl_type: 'String',
    parsed: value
  }
}

// Create RuntimeArgs in the format Casper Wallet expects
// The wallet expects a simple key-value object where each value has cl_type and bytes
function createRuntimeArgs(args: Record<string, any>) {
  const result: any = {}
  for (const [name, clValue] of Object.entries(args)) {
    result[name] = clValue
  }
  return result
}

class CasperContractService {
  private rpcUrl: string

  constructor() {
    this.rpcUrl = CASPER_TESTNET_RPC
  }

  // Get wallet provider
  private getWalletProvider() {
    if (typeof window === 'undefined' || !window.CasperWalletProvider) {
      throw new Error('Casper Wallet not available. Please install Casper Wallet extension.')
    }
    return window.CasperWalletProvider()
  }

  // ============================================
  // DUEL MANAGER CONTRACT METHODS
  // ============================================

  /**
   * Create a new duel
   * Initiates a real blockchain transaction through Casper Wallet
   */
  async createDuel(
    publicKey: string,
    duration: number,
    nftCollection: string,
    maxParticipants: number,
    entryFee: number
  ): Promise<string> {
    console.log('🚀 Creating duel on blockchain...', {
      publicKey,
      duration,
      nftCollection,
      maxParticipants,
      entryFee,
      contractHash: CONTRACT_ADDRESSES.DUEL_MANAGER
    })

    if (!CONTRACT_ADDRESSES.DUEL_MANAGER) {
      throw new Error('Duel Manager contract address not configured. Please set NEXT_PUBLIC_DUEL_MANAGER_CONTRACT in .env.local')
    }

    try {
      const provider = this.getWalletProvider()
      const contractHash = CONTRACT_ADDRESSES.DUEL_MANAGER.replace('hash-', '')

      // Create runtime args with CLType information
      const runtimeArgs = createRuntimeArgs({
        duration_seconds: createCLU64(duration),
        nft_collection: createCLString(nftCollection),
        max_participants: createCLU8(maxParticipants),
        odra_cfg_amount: createCLU512(BigInt(csprToMotes(entryFee)))
      })

      // Create payment args
      const paymentArgs = createRuntimeArgs({
        amount: createCLU512(BigInt(csprToMotes(500)))
      })

      // Construct deploy JSON for Casper Wallet
      const deployJSON = {
        deploy: {
          hash: '', // Wallet will compute this
          header: {
            account: publicKey,
            timestamp: new Date().toISOString(),
            ttl: '30m',
            gas_price: 1,
            body_hash: '', // Wallet will compute this
            dependencies: [],
            chain_name: NETWORK_NAME
          },
          payment: {
            ModuleBytes: {
              module_bytes: '',
              args: paymentArgs
            }
          },
          session: {
            StoredContractByHash: {
              hash: contractHash,
              entry_point: 'create_duel',
              args: runtimeArgs
            }
          },
          approvals: []
        }
      }

      console.log('📝 Sending to wallet:', deployJSON)

      // Sign through wallet
      const signResult = await provider.sign(JSON.stringify(deployJSON), publicKey)

      if (signResult.cancelled) {
        throw new Error('User cancelled transaction')
      }

      console.log('✅ Transaction signed:', signResult)

      // Extract deploy hash from result
      const deployHash = typeof signResult === 'string' ? signResult : signResult.deployHash || signResult.deploy_hash
      return deployHash
    } catch (error: any) {
      console.error('❌ Error creating duel:', error)
      throw new Error(error.message || 'Failed to create duel transaction')
    }
  }

  /**
   * Join an existing duel
   */
  async joinDuel(publicKey: string, duelId: number, entryFee: number): Promise<string> {
    console.log('🎮 Joining duel...', { publicKey, duelId, entryFee })

    if (!CONTRACT_ADDRESSES.DUEL_MANAGER) {
      throw new Error('Duel Manager contract address not configured')
    }

    try {
      const provider = this.getWalletProvider()
      const contractHash = CONTRACT_ADDRESSES.DUEL_MANAGER.replace('hash-', '')

      const runtimeArgs = createRuntimeArgs({
        duel_id: createCLU64(duelId),
        odra_cfg_amount: createCLU512(BigInt(csprToMotes(entryFee)))
      })

      const paymentArgs = createRuntimeArgs({
        amount: createCLU512(BigInt(csprToMotes(500)))
      })

      const deployJSON = {
        deploy: {
          hash: '',
          header: {
            account: publicKey,
            timestamp: new Date().toISOString(),
            ttl: '30m',
            gas_price: 1,
            body_hash: '',
            dependencies: [],
            chain_name: NETWORK_NAME
          },
          payment: {
            ModuleBytes: {
              module_bytes: '',
              args: paymentArgs
            }
          },
          session: {
            StoredContractByHash: {
              hash: contractHash,
              entry_point: 'join_duel',
              args: runtimeArgs
            }
          },
          approvals: []
        }
      }

      const signResult = await provider.sign(JSON.stringify(deployJSON), publicKey)

      if (signResult.cancelled) {
        throw new Error('User cancelled transaction')
      }

      const deployHash = typeof signResult === 'string' ? signResult : signResult.deployHash || signResult.deploy_hash
      console.log('✅ Join duel deploy hash:', deployHash)
      return deployHash
    } catch (error: any) {
      console.error('❌ Error joining duel:', error)
      throw new Error(error.message || 'Failed to join duel')
    }
  }

  /**
   * Start a duel (creator only)
   */
  async startDuel(publicKey: string, duelId: number): Promise<string> {
    console.log('▶️ Starting duel...', { publicKey, duelId })

    if (!CONTRACT_ADDRESSES.DUEL_MANAGER) {
      throw new Error('Duel Manager contract address not configured')
    }

    try {
      const provider = this.getWalletProvider()
      const packageHash = CONTRACT_ADDRESSES.DUEL_MANAGER.replace('hash-', 'package-')

      const txParams = {
        packageHash,
        entryPoint: 'start_duel',
        runtimeArgs: {
          duel_id: duelId.toString()
        },
        paymentAmount: csprToMotes(500),
        ttl: '30m'
      }

      const txHash = await provider.sign(JSON.stringify(txParams), publicKey)
      console.log('✅ Start duel transaction sent:', txHash)
      return txHash
    } catch (error: any) {
      console.error('❌ Error starting duel:', error)
      throw new Error(error.message || 'Failed to start duel')
    }
  }

  /**
   * Close a duel (after time expires)
   */
  async closeDuel(publicKey: string, duelId: number): Promise<string> {
    console.log('🏁 Closing duel...', { publicKey, duelId })

    if (!CONTRACT_ADDRESSES.DUEL_MANAGER) {
      throw new Error('Duel Manager contract address not configured')
    }

    try {
      const provider = this.getWalletProvider()
      const contractHash = CONTRACT_ADDRESSES.DUEL_MANAGER.replace('hash-', '')

      const runtimeArgs = createRuntimeArgs({
        duel_id: createCLU64(duelId)
      })

      const paymentArgs = createRuntimeArgs({
        amount: createCLU512(BigInt(csprToMotes(500)))
      })

      const deployJSON = {
        deploy: {
          hash: '',
          header: {
            account: publicKey,
            timestamp: new Date().toISOString(),
            ttl: '30m',
            gas_price: 1,
            body_hash: '',
            dependencies: [],
            chain_name: NETWORK_NAME
          },
          payment: {
            ModuleBytes: {
              module_bytes: '',
              args: paymentArgs
            }
          },
          session: {
            StoredContractByHash: {
              hash: contractHash,
              entry_point: 'close_duel',
              args: runtimeArgs
            }
          },
          approvals: []
        }
      }

      const signResult = await provider.sign(JSON.stringify(deployJSON), publicKey)

      if (signResult.cancelled) {
        throw new Error('User cancelled transaction')
      }

      const deployHash = typeof signResult === 'string' ? signResult : signResult.deployHash || signResult.deploy_hash
      console.log('✅ Close duel deploy hash:', deployHash)
      return deployHash
    } catch (error: any) {
      console.error('❌ Error closing duel:', error)
      throw new Error(error.message || 'Failed to close duel')
    }
  }

  /**
   * Claim rewards (winner only)
   */
  async claimRewards(publicKey: string, duelId: number): Promise<string> {
    console.log('💰 Claiming rewards...', { publicKey, duelId })

    if (!CONTRACT_ADDRESSES.DUEL_MANAGER) {
      throw new Error('Duel Manager contract address not configured')
    }

    try {
      const provider = this.getWalletProvider()
      const contractHash = CONTRACT_ADDRESSES.DUEL_MANAGER.replace('hash-', '')

      const runtimeArgs = createRuntimeArgs({
        duel_id: createCLU64(duelId)
      })

      const paymentArgs = createRuntimeArgs({
        amount: createCLU512(BigInt(csprToMotes(500)))
      })

      const deployJSON = {
        deploy: {
          hash: '',
          header: {
            account: publicKey,
            timestamp: new Date().toISOString(),
            ttl: '30m',
            gas_price: 1,
            body_hash: '',
            dependencies: [],
            chain_name: NETWORK_NAME
          },
          payment: {
            ModuleBytes: {
              module_bytes: '',
              args: paymentArgs
            }
          },
          session: {
            StoredContractByHash: {
              hash: contractHash,
              entry_point: 'claim_rewards',
              args: runtimeArgs
            }
          },
          approvals: []
        }
      }

      const signResult = await provider.sign(JSON.stringify(deployJSON), publicKey)

      if (signResult.cancelled) {
        throw new Error('User cancelled transaction')
      }

      const deployHash = typeof signResult === 'string' ? signResult : signResult.deployHash || signResult.deploy_hash
      console.log('✅ Claim rewards deploy hash:', deployHash)
      return deployHash
    } catch (error: any) {
      console.error('❌ Error claiming rewards:', error)
      throw new Error(error.message || 'Failed to claim rewards')
    }
  }

  /**
   * Cancel a duel (creator only, before it starts)
   */
  async cancelDuel(publicKey: string, duelId: number): Promise<string> {
    console.log('Cancelling duel...', { publicKey, duelId })
    return `mock-cancel-${Date.now()}`
  }

  /**
   * Claim refund for cancelled duel
   */
  async claimRefund(publicKey: string, duelId: number): Promise<string> {
    console.log('Claiming refund...', { publicKey, duelId })
    return `mock-refund-${Date.now()}`
  }

  /**
   * Get duel details
   */
  async getDuel(duelId: number): Promise<any> {
    console.log('Getting duel...', { duelId })
    return null
  }

  /**
   * Get all active duels
   */
  async getActiveDuels(): Promise<number[]> {
    console.log('Getting active duels...')
    return []
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<any> {
    console.log('Getting platform stats...')
    return {
      total_duels: 0,
      total_prize_distributed: '0',
      platform_fee_percentage: 5
    }
  }

  // ============================================
  // TRADING ENGINE CONTRACT METHODS
  // ============================================

  /**
   * Execute buy trade
   */
  async executeBuy(publicKey: string, duelId: number, nftId: string): Promise<string> {
    console.log('Executing buy...', { publicKey, duelId, nftId })
    return `mock-buy-${Date.now()}`
  }

  /**
   * Execute sell trade
   */
  async executeSell(publicKey: string, duelId: number, nftId: string): Promise<string> {
    console.log('Executing sell...', { publicKey, duelId, nftId })
    return `mock-sell-${Date.now()}`
  }

  /**
   * Get portfolio value
   */
  async getPortfolioValue(duelId: number, playerAddress: string): Promise<bigint> {
    console.log('Getting portfolio value...', { duelId, playerAddress })
    return BigInt(0)
  }

  /**
   * Get portfolio statistics
   */
  async getPortfolioStats(duelId: number, playerAddress: string): Promise<any> {
    console.log('Getting portfolio stats...', { duelId, playerAddress })
    return null
  }

  /**
   * Get portfolio details
   */
  async getPortfolio(duelId: number, playerAddress: string): Promise<any> {
    console.log('Getting portfolio...', { duelId, playerAddress })
    return null
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(duelId: number, players: string[]): Promise<any[]> {
    console.log('Getting leaderboard...', { duelId, players })
    return []
  }

  // ============================================
  // PRICE ORACLE CONTRACT METHODS
  // ============================================

  /**
   * Get NFT price
   */
  async getNFTPrice(nftId: string): Promise<bigint> {
    console.log('Getting NFT price...', { nftId })
    return BigInt(1000000000) // 1 CSPR
  }

  /**
   * Get multiple NFT prices
   */
  async getMultiplePrices(nftIds: string[]): Promise<Array<{ id: string; price: bigint }>> {
    console.log('Getting multiple prices...', { nftIds })
    return nftIds.map(id => ({ id, price: BigInt(1000000000) }))
  }

  /**
   * Get price data with metadata
   */
  async getPriceData(nftId: string): Promise<any> {
    console.log('Getting price data...', { nftId })
    return null
  }

  /**
   * Update NFT price (oracle only)
   */
  async updatePrice(
    publicKey: string,
    nftId: string,
    price: number,
    source: string
  ): Promise<string> {
    console.log('Updating price...', { publicKey, nftId, price, source })
    return `mock-update-price-${Date.now()}`
  }

  /**
   * Batch update prices (oracle only)
   */
  async batchUpdatePrices(
    publicKey: string,
    updates: Array<{ nftId: string; price: number; source: string }>
  ): Promise<string> {
    console.log('Batch updating prices...', { publicKey, updates })
    return `mock-batch-update-${Date.now()}`
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Wait for transaction to complete by polling the blockchain (Casper 2.0)
   */
  async waitForDeploy(txHash: string, timeout: number = 300000): Promise<any> {
    console.log(`⏳ Waiting for transaction to be included in a block: ${txHash}`)

    const startTime = Date.now()
    const pollInterval = 10000 // Check every 10 seconds (testnet is slower)

    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.getDeployStatus(txHash)

        if (status === 'success') {
          console.log('✅ Transaction successful:', txHash)
          return { success: true, txHash }
        } else if (status === 'failed') {
          throw new Error('Transaction failed on blockchain')
        }

        // Still pending, wait before next check
        console.log(`⏳ Transaction still pending, checking again in ${pollInterval / 1000}s...`)
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      } catch (error: any) {
        console.error('Error checking transaction status:', error)
        // Continue waiting unless it's a failure
        if (error.message.includes('failed')) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }

    throw new Error('Transaction timeout - took too long to confirm')
  }

  /**
   * Get transaction status from blockchain (Casper 2.0)
   */
  async getDeployStatus(txHash: string): Promise<'pending' | 'success' | 'failed'> {
    try {
      // Try the new method first (Casper 2.0)
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'info_get_deploy',
          params: {
            deploy_hash: txHash
          }
        })
      })

      const data = await response.json()

      if (data.error) {
        console.log('Deploy not found yet:', data.error.message)
        return 'pending'
      }

      // Check execution results
      if (data.result && data.result.execution_results && data.result.execution_results.length > 0) {
        const executionResult = data.result.execution_results[0].result

        if (executionResult.Success) {
          return 'success'
        } else if (executionResult.Failure) {
          console.error('Deploy failed:', executionResult.Failure)
          return 'failed'
        }
      }

      return 'pending'
    } catch (error) {
      console.error('Error fetching deploy status:', error)
      return 'pending'
    }
  }

  /**
   * Query contract state via RPC
   */
  private async queryContractRPC(contractHash: string, method: string, args: any): Promise<any> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'query_global_state',
          params: {
            state_identifier: {
              BlockHash: 'latest'
            },
            key: contractHash,
            path: [method]
          }
        })
      })

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error('RPC query error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const casperContracts = new CasperContractService()
