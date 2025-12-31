// Real Casper Contract Service with Blockchain Integration
// Uses Casper JS SDK and Casper Wallet for actual on-chain transactions

import {
  HttpHandler,
  RpcClient,
  CLPublicKey,
  DeployUtil,
  RuntimeArgs,
  CLValueBuilder,
  decodeBase16
} from 'casper-js-sdk'

export const CONTRACT_ADDRESSES = {
  DUEL_MANAGER: process.env.NEXT_PUBLIC_DUEL_MANAGER_CONTRACT || '',
  TRADING_ENGINE: process.env.NEXT_PUBLIC_TRADING_ENGINE_CONTRACT || '',
  PRICE_ORACLE: process.env.NEXT_PUBLIC_PRICE_ORACLE_CONTRACT || '',
  LIQUID_STAKE: process.env.NEXT_PUBLIC_LIQUID_STAKE_CONTRACT || '',
}

const CASPER_TESTNET_RPC = process.env.NEXT_PUBLIC_CASPER_RPC || 'https://testnet.cspr.live/rpc'
const CHAIN_NAME = 'casper-test'
const DEFAULT_GAS_PAYMENT = '5000000000' // 5 CSPR
const DEFAULT_TTL = 1800000 // 30 minutes

export const csprToMotes = (cspr: number): string => {
  return (cspr * 1_000_000_000).toString()
}

export const motesToCspr = (motes: string | bigint): number => {
  return Number(BigInt(motes) / BigInt(1_000_000_000))
}

declare global {
  interface Window {
    CasperWalletProvider?: any
  }
}

interface SignatureResponse {
  cancelled: boolean
  signatureHex?: string
  signature?: Uint8Array
}

class RealCasperService {
  private rpcClient: RpcClient

  constructor() {
    const httpHandler = new HttpHandler(CASPER_TESTNET_RPC)
    this.rpcClient = new RpcClient(httpHandler)
  }

  private getWalletProvider() {
    if (typeof window === 'undefined' || !window.CasperWalletProvider) {
      throw new Error('Casper Wallet not available. Please install Casper Wallet extension.')
    }
    return window.CasperWalletProvider()
  }

  /**
   * Create and sign a contract call deploy
   */
  private async createAndSignDeploy(
    publicKeyHex: string,
    contractHash: string,
    entryPoint: string,
    args: RuntimeArgs,
    paymentAmount: string = DEFAULT_GAS_PAYMENT
  ): Promise<string> {
    const provider = this.getWalletProvider()
    const publicKey = CLPublicKey.fromHex(publicKeyHex)

    // Remove "hash-" prefix if present
    const cleanHash = contractHash.replace('hash-', '')

    // Create deploy parameters
    const deployParams = new DeployUtil.DeployParams(
      publicKey,
      CHAIN_NAME,
      1, // gas price
      DEFAULT_TTL
    )

    // Create session (contract call)
    const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      decodeBase16(cleanHash),
      entryPoint,
      args
    )

    // Create payment
    const payment = DeployUtil.standardPayment(paymentAmount)

    // Create deploy
    const deploy = DeployUtil.makeDeploy(deployParams, session, payment)

    // Convert deploy to JSON for wallet signing
    const deployJson = DeployUtil.deployToJson(deploy)

    console.log('🚀 Requesting signature from Casper Wallet...', {
      entryPoint,
      contractHash,
      args: deployJson.session
    })

    // Sign with Casper Wallet
    const signatureResponse: SignatureResponse = await provider.sign(
      JSON.stringify(deployJson),
      publicKeyHex
    )

    if (signatureResponse.cancelled) {
      throw new Error('Transaction was cancelled by user')
    }

    if (!signatureResponse.signature) {
      throw new Error('No signature returned from wallet')
    }

    // Add signature to deploy
    const signedDeploy = DeployUtil.setSignature(
      deploy,
      signatureResponse.signature,
      publicKey
    )

    // Submit to blockchain
    console.log('📤 Submitting deploy to blockchain...')
    const deployHash = await this.rpcClient.putDeploy(signedDeploy)

    console.log('✅ Deploy submitted successfully:', deployHash)
    return deployHash

  }

  /**
   * Create a duel - REAL BLOCKCHAIN TRANSACTION
   */
  async createDuel(
    publicKey: string,
    duration: number,
    nftCollection: string,
    maxParticipants: number,
    entryFee: number
  ): Promise<string> {
    console.log('🚀 Creating duel on blockchain', {
      publicKey,
      duration,
      nftCollection,
      maxParticipants,
      entryFee,
      contractHash: CONTRACT_ADDRESSES.DUEL_MANAGER
    })

    const args = RuntimeArgs.fromMap({
      duration_seconds: CLValueBuilder.u64(duration),
      nft_collection: CLValueBuilder.string(nftCollection),
      max_participants: CLValueBuilder.u8(maxParticipants),
      entry_fee: CLValueBuilder.u512(csprToMotes(entryFee))
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.DUEL_MANAGER,
      'create_duel',
      args,
      '10000000000' // 10 CSPR for duel creation
    )
  }

  /**
   * Join a duel - REAL BLOCKCHAIN TRANSACTION
   */
  async joinDuel(publicKey: string, duelId: number, entryFee: number): Promise<string> {
    console.log('🎮 Joining duel on blockchain', { publicKey, duelId, entryFee })

    const args = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.DUEL_MANAGER,
      'join_duel',
      args,
      csprToMotes(entryFee + 5).toString() // Entry fee + gas
    )
  }

  /**
   * Start a duel - REAL BLOCKCHAIN TRANSACTION
   */
  async startDuel(publicKey: string, duelId: number): Promise<string> {
    console.log('▶️  Starting duel on blockchain', { publicKey, duelId })

    const args = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.DUEL_MANAGER,
      'start_duel',
      args
    )
  }

  /**
   * Close a duel - REAL BLOCKCHAIN TRANSACTION
   */
  async closeDuel(publicKey: string, duelId: number): Promise<string> {
    console.log('🏁 Closing duel on blockchain', { publicKey, duelId })

    const args = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.DUEL_MANAGER,
      'close_duel',
      args
    )
  }

  /**
   * Claim rewards - REAL BLOCKCHAIN TRANSACTION
   */
  async claimRewards(publicKey: string, duelId: number): Promise<string> {
    console.log('💰 Claiming rewards on blockchain', { publicKey, duelId })

    const args = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.DUEL_MANAGER,
      'claim_rewards',
      args
    )
  }

  /**
   * Cancel a duel - REAL BLOCKCHAIN TRANSACTION
   */
  async cancelDuel(publicKey: string, duelId: number): Promise<string> {
    console.log('❌ Cancelling duel on blockchain', { publicKey, duelId })

    const args = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.DUEL_MANAGER,
      'cancel_duel',
      args
    )
  }

  /**
   * Claim refund - REAL BLOCKCHAIN TRANSACTION
   */
  async claimRefund(publicKey: string, duelId: number): Promise<string> {
    console.log('💸 Claiming refund on blockchain', { publicKey, duelId })

    const args = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.DUEL_MANAGER,
      'claim_refund',
      args
    )
  }

  /**
   * Execute buy trade - REAL BLOCKCHAIN TRANSACTION
   */
  async executeBuy(publicKey: string, duelId: number, nftId: string): Promise<string> {
    console.log('📈 Executing BUY on blockchain', { publicKey, duelId, nftId })

    const args = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId),
      nft_id: CLValueBuilder.string(nftId)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.TRADING_ENGINE,
      'execute_buy',
      args
    )
  }

  /**
   * Execute sell trade - REAL BLOCKCHAIN TRANSACTION
   */
  async executeSell(publicKey: string, duelId: number, nftId: string): Promise<string> {
    console.log('📉 Executing SELL on blockchain', { publicKey, duelId, nftId })

    const args = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId),
      nft_id: CLValueBuilder.string(nftId)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.TRADING_ENGINE,
      'execute_sell',
      args
    )
  }

  /**
   * Wait for deploy to be processed on blockchain
   */
  async waitForDeploy(deployHash: string, timeout: number = 180000): Promise<any> {
    console.log('⏳ Waiting for deploy to be processed:', deployHash)

    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        const deployResult = await this.rpcClient.getDeploy(deployHash)

        if (deployResult.executionInfo && deployResult.executionInfo.length > 0) {
          const execInfo = deployResult.executionInfo[0]

          if (execInfo.result.Success) {
            console.log('✅ Deploy executed successfully')
            return { success: true, deployResult }
          } else if (execInfo.result.Failure) {
            console.error('❌ Deploy failed:', execInfo.result.Failure)
            throw new Error(`Deploy failed: ${JSON.stringify(execInfo.result.Failure)}`)
          }
        }
      } catch (err: any) {
        // Deploy might not be found yet, keep waiting
        if (!err.message?.includes('not known')) {
          throw err
        }
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    throw new Error('Deploy timeout - transaction took too long to process')
  }

  /**
   * Get deploy status
   */
  async getDeployStatus(deployHash: string): Promise<'pending' | 'success' | 'failed'> {
    try {
      const deployResult = await this.rpcClient.getDeploy(deployHash)

      if (!deployResult.executionInfo || deployResult.executionInfo.length === 0) {
        return 'pending'
      }

      const result = deployResult.executionInfo[0].result

      if (result.Success) {
        return 'success'
      } else if (result.Failure) {
        return 'failed'
      }

      return 'pending'
    } catch {
      return 'pending'
    }
  }

  // ============== READ-ONLY METHODS (No wallet needed) ==============

  /**
   * Get duel information from blockchain state
   */
  async getDuel(duelId: number): Promise<any> {
    // TODO: Query contract state
    console.log('📖 Querying duel from blockchain:', duelId)
    return null
  }

  /**
   * Get active duels
   */
  async getActiveDuels(): Promise<number[]> {
    // TODO: Query contract state
    console.log('📖 Querying active duels from blockchain')
    return []
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<any> {
    // TODO: Query contract state
    console.log('📖 Querying platform stats from blockchain')
    return {
      total_duels: 0,
      total_prize_distributed: '0',
      platform_fee_percentage: 5
    }
  }

  /**
   * Get portfolio value
   */
  async getPortfolioValue(duelId: number, playerAddress: string): Promise<bigint> {
    // TODO: Query contract state
    console.log('📖 Querying portfolio value from blockchain:', { duelId, playerAddress })
    return BigInt(0)
  }

  /**
   * Get portfolio statistics
   */
  async getPortfolioStats(duelId: number, playerAddress: string): Promise<any> {
    // TODO: Query contract state
    console.log('📖 Querying portfolio stats from blockchain:', { duelId, playerAddress })
    return null
  }

  /**
   * Get portfolio
   */
  async getPortfolio(duelId: number, playerAddress: string): Promise<any> {
    // TODO: Query contract state
    console.log('📖 Querying portfolio from blockchain:', { duelId, playerAddress })
    return null
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(duelId: number, players: string[]): Promise<any[]> {
    // TODO: Query contract state
    console.log('📖 Querying leaderboard from blockchain:', { duelId, players })
    return []
  }

  /**
   * Get NFT price
   */
  async getNFTPrice(nftId: string): Promise<bigint> {
    // TODO: Query price oracle contract state
    console.log('📖 Querying NFT price from blockchain:', nftId)
    return BigInt(1000000000) // 1 CSPR default
  }

  /**
   * Get multiple NFT prices
   */
  async getMultiplePrices(nftIds: string[]): Promise<Array<{ id: string; price: bigint }>> {
    // TODO: Query price oracle contract state
    console.log('📖 Querying multiple NFT prices from blockchain:', nftIds)
    return nftIds.map(id => ({ id, price: BigInt(1000000000) }))
  }

  /**
   * Get price data
   */
  async getPriceData(nftId: string): Promise<any> {
    // TODO: Query price oracle contract state
    console.log('📖 Querying price data from blockchain:', nftId)
    return null
  }

  /**
   * Update price - REAL BLOCKCHAIN TRANSACTION
   */
  async updatePrice(publicKey: string, nftId: string, price: number, source: string): Promise<string> {
    console.log('💱 Updating price on blockchain', { publicKey, nftId, price, source })

    const args = RuntimeArgs.fromMap({
      nft_id: CLValueBuilder.string(nftId),
      price: CLValueBuilder.u512(csprToMotes(price)),
      source: CLValueBuilder.string(source)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.PRICE_ORACLE,
      'update_price',
      args
    )
  }

  /**
   * Batch update prices - REAL BLOCKCHAIN TRANSACTION
   */
  async batchUpdatePrices(
    publicKey: string,
    updates: Array<{ nftId: string; price: number; source: string }>
  ): Promise<string> {
    console.log('💱 Batch updating prices on blockchain', { publicKey, count: updates.length })

    // Convert updates to the format expected by the contract
    const updatesVector = updates.map(u =>
      CLValueBuilder.tuple3(
        CLValueBuilder.string(u.nftId),
        CLValueBuilder.u512(csprToMotes(u.price)),
        CLValueBuilder.string(u.source)
      )
    )

    const args = RuntimeArgs.fromMap({
      updates: CLValueBuilder.list(updatesVector)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.PRICE_ORACLE,
      'batch_update_prices',
      args
    )
  }
}

export const casperContracts = new RealCasperService()
