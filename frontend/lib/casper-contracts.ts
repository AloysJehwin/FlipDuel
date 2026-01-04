// Casper Contract Service using Casper Wallet

import {
  CLPublicKey,
  CLValueBuilder,
  RuntimeArgs,
  DeployUtil
} from 'casper-js-sdk'

export const CONTRACT_ADDRESSES = {
  DUEL_MANAGER: process.env.NEXT_PUBLIC_DUEL_MANAGER_CONTRACT || '',
  TRADING_ENGINE: process.env.NEXT_PUBLIC_TRADING_ENGINE_CONTRACT || '',
  PRICE_ORACLE: process.env.NEXT_PUBLIC_PRICE_ORACLE_CONTRACT || '',
  LIQUID_STAKE: process.env.NEXT_PUBLIC_LIQUID_STAKE_CONTRACT || '',
}

const CHAIN_NAME = 'casper-test'
const DEFAULT_GAS_PAYMENT = '5000000000'
const DEFAULT_TTL = 1800000

export const csprToMotes = (cspr: number): string => {
  return (cspr * 1_000_000_000).toString()
}

export const motesToCspr = (motes: string | bigint): number => {
  return Number(BigInt(motes) / BigInt(1_000_000_000))
}

class CasperContractService {
  private getWalletProvider() {
    if (typeof window === 'undefined' || !(window as any).CasperWalletProvider) {
      throw new Error('Casper Wallet not found. Please install the extension.')
    }
    return (window as any).CasperWalletProvider()
  }

  private async createAndSignDeploy(
    publicKeyHex: string,
    contractHash: string,
    entryPoint: string,
    runtimeArgs: RuntimeArgs,
    paymentAmount: string = DEFAULT_GAS_PAYMENT,
    attachedValue?: string
  ): Promise<string> {
    const provider = this.getWalletProvider()

    console.log('🚀 Creating deploy for contract call...')
    console.log('📋 Contract Details:', {
      entryPoint,
      contractHash,
      chainName: CHAIN_NAME,
      paymentAmount,
      attachedValue: attachedValue || 'none'
    })

    try {
      const cleanHash = contractHash.replace('hash-', '')
      console.log('🔑 Sender Public Key:', publicKeyHex)

      if (attachedValue) {
        const argsMap = Object.fromEntries(runtimeArgs.args)
        argsMap['attached_value'] = CLValueBuilder.u512(attachedValue)
        runtimeArgs = RuntimeArgs.fromMap(argsMap)
        console.log('💰 Added attached_value to args:', attachedValue)
      }

      console.log('📦 Runtime Args:', JSON.stringify(Array.from(runtimeArgs.args.entries())))

      const senderPublicKey = CLPublicKey.fromHex(publicKeyHex)
      const deployParams = new DeployUtil.DeployParams(senderPublicKey, CHAIN_NAME)

      const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
        Uint8Array.from(Buffer.from(cleanHash, 'hex')),
        entryPoint,
        runtimeArgs
      )

      const payment = DeployUtil.standardPayment(paymentAmount)
      const deploy = DeployUtil.makeDeploy(deployParams, session, payment)
      const deployJson = DeployUtil.deployToJson(deploy)

      console.log('📝 Deploy JSON created, size:', JSON.stringify(deployJson).length, 'bytes')
      console.log('🔐 Requesting signature from Casper Wallet...')

      // Casper Wallet expects deploy as JSON STRING
      const deployJsonString = JSON.stringify(deployJson)
      const result = await provider.sign(deployJsonString, publicKeyHex)

      console.log('✅ Wallet signed the deploy')

      // Wallet returns signature, we need to add it to deploy and send it
      if (!result || result.cancelled) {
        throw new Error('User cancelled signing')
      }

      // Add signature to deploy
      const signedDeploy = DeployUtil.setSignature(
        deploy,
        result.signature,
        CLPublicKey.fromHex(publicKeyHex)
      )

      // Get the deploy hash from the signed deploy
      const deployHash = Buffer.from(signedDeploy.hash).toString('hex')

      console.log('✅ Deploy signed successfully!')
      console.log('🔗 Deploy Hash:', deployHash)
      console.log('🌐 View on explorer: https://testnet.cspr.live/deploy/' + deployHash)
      console.log('⚠️ Note: Casper Wallet should handle sending the deploy to the network')

      // Return the hash immediately
      // The wallet extension should handle sending the deploy to the network
      return deployHash
    } catch (error: any) {
      console.error('❌ Error creating/signing deploy:')
      console.error('Error message:', error.message)
      console.error('Error details:', error)
      throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`)
    }
  }

  async createDuel(publicKey: string, entryFee: number, duration: number, nftCollection: string, maxParticipants: number): Promise<string> {
    const entryFeeInMotes = csprToMotes(entryFee)
    const runtimeArgs = RuntimeArgs.fromMap({
      entry_fee: CLValueBuilder.u512(entryFeeInMotes),
      duration: CLValueBuilder.u64(duration),
      nft_collection: CLValueBuilder.string(nftCollection),
      max_participants: CLValueBuilder.u8(maxParticipants)
    })

    return await this.createAndSignDeploy(
      publicKey,
      CONTRACT_ADDRESSES.DUEL_MANAGER,
      'create_duel',
      runtimeArgs,
      '10000000000',
      entryFeeInMotes
    )
  }

  async joinDuel(publicKey: string, duelId: number, entryFee: number): Promise<string> {
    const runtimeArgs = RuntimeArgs.fromMap({ duel_id: CLValueBuilder.u64(duelId) })
    return await this.createAndSignDeploy(publicKey, CONTRACT_ADDRESSES.DUEL_MANAGER, 'join_duel', runtimeArgs, '5000000000', csprToMotes(entryFee))
  }

  async startDuel(publicKey: string, duelId: number): Promise<string> {
    const runtimeArgs = RuntimeArgs.fromMap({ duel_id: CLValueBuilder.u64(duelId) })
    return await this.createAndSignDeploy(publicKey, CONTRACT_ADDRESSES.DUEL_MANAGER, 'start_duel', runtimeArgs)
  }

  async closeDuel(publicKey: string, duelId: number): Promise<string> {
    const runtimeArgs = RuntimeArgs.fromMap({ duel_id: CLValueBuilder.u64(duelId) })
    return await this.createAndSignDeploy(publicKey, CONTRACT_ADDRESSES.DUEL_MANAGER, 'close_duel', runtimeArgs)
  }

  async claimRewards(publicKey: string, duelId: number): Promise<string> {
    const runtimeArgs = RuntimeArgs.fromMap({ duel_id: CLValueBuilder.u64(duelId) })
    return await this.createAndSignDeploy(publicKey, CONTRACT_ADDRESSES.DUEL_MANAGER, 'claim_rewards', runtimeArgs)
  }

  async cancelDuel(publicKey: string, duelId: number): Promise<string> {
    const runtimeArgs = RuntimeArgs.fromMap({ duel_id: CLValueBuilder.u64(duelId) })
    return await this.createAndSignDeploy(publicKey, CONTRACT_ADDRESSES.DUEL_MANAGER, 'cancel_duel', runtimeArgs)
  }

  async claimRefund(publicKey: string, duelId: number): Promise<string> {
    const runtimeArgs = RuntimeArgs.fromMap({ duel_id: CLValueBuilder.u64(duelId) })
    return await this.createAndSignDeploy(publicKey, CONTRACT_ADDRESSES.DUEL_MANAGER, 'claim_refund', runtimeArgs)
  }

  async executeBuy(publicKey: string, duelId: number, nftId: string): Promise<string> {
    const runtimeArgs = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId),
      nft_id: CLValueBuilder.string(nftId)
    })
    return await this.createAndSignDeploy(publicKey, CONTRACT_ADDRESSES.TRADING_ENGINE, 'execute_buy', runtimeArgs)
  }

  async executeSell(publicKey: string, duelId: number, nftId: string): Promise<string> {
    const runtimeArgs = RuntimeArgs.fromMap({
      duel_id: CLValueBuilder.u64(duelId),
      nft_id: CLValueBuilder.string(nftId)
    })
    return await this.createAndSignDeploy(publicKey, CONTRACT_ADDRESSES.TRADING_ENGINE, 'execute_sell', runtimeArgs)
  }

  async waitForDeploy(deployHash: string, timeout: number = 60000): Promise<any> {
    const startTime = Date.now()

    console.log(`⏳ Waiting for deploy ${deployHash} to finalize...`)

    while (Date.now() - startTime < timeout) {
      try {
        // Use API proxy to avoid CORS
        const response = await fetch('/api/casper-rpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'info_get_deploy',
            params: { deploy_hash: deployHash },
            id: 1
          })
        })

        const data = await response.json()

        if (data.result?.execution_results?.[0]) {
          const result = data.result.execution_results[0].result
          if (result.Success) {
            console.log('✅ Deploy finalized successfully')
            return data.result
          } else if (result.Failure) {
            throw new Error(`Deploy failed: ${JSON.stringify(result.Failure)}`)
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error('Error checking deploy status:', error)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    throw new Error('Deploy timeout')
  }

  async getDuelInfo(duelId: number): Promise<any> { return null }
  async getUserDuels(publicKey: string): Promise<any[]> { return [] }
  async getActiveDuels(): Promise<any[]> { return [] }
}

export const casperContracts = new CasperContractService()
