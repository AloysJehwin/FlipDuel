import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Duel {
  id: string
  creator_address: string
  entry_fee: number // in CSPR
  trading_token: string // ETH, BTC, NFT-Dragons, etc.
  duration: number // in minutes
  status: 'waiting' | 'active' | 'completed' | 'cancelled'
  created_at: string
  started_at?: string
  ended_at?: string
  winner_address?: string
  prize_pool: number // in CSPR
  // Web3 fields
  blockchain_id?: number
  create_tx_hash?: string
  create_tx_status?: 'pending' | 'success' | 'failed'
  start_tx_hash?: string
  close_tx_hash?: string
  contract_address?: string
}

export interface DuelParticipant {
  id: string
  duel_id: string
  wallet_address: string
  joined_at: string
  initial_balance: number
  final_balance: number
  pnl: number // Profit/Loss
  pnl_percent: number
  position: 1 | 2 // 1 = creator, 2 = challenger
  // Web3 fields
  join_tx_hash?: string
  join_tx_status?: 'pending' | 'success' | 'failed'
  claim_tx_hash?: string
  claim_tx_status?: 'pending' | 'success' | 'failed'
  claimed_at?: string
}

export interface DuelTrade {
  id: string
  duel_id: string
  participant_id: string
  wallet_address: string
  action: 'buy' | 'sell'
  token: string
  amount: number
  price: number
  timestamp: string
  // Web3 fields
  tx_hash?: string
  tx_status?: 'pending' | 'success' | 'failed'
  gas_fee?: number
}

export interface UserProfile {
  wallet_address: string
  username?: string
  total_duels: number
  duels_won: number
  duels_lost: number
  total_pnl: number
  created_at: string
  updated_at: string
}
