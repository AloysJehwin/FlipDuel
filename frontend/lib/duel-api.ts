import { supabase } from './supabase'
import type { Duel, DuelParticipant, DuelTrade, UserProfile } from './supabase'

// =============================================
// USER PROFILE FUNCTIONS
// =============================================

export async function createOrGetUserProfile(walletAddress: string, username?: string): Promise<UserProfile | null> {
  try {
    // Check if profile exists
    const { data: existing, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (existing) return existing

    // Create new profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        wallet_address: walletAddress,
        username: username || `User_${walletAddress.slice(-6)}`
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating/fetching user profile:', error)
    return null
  }
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// =============================================
// DUEL FUNCTIONS
// =============================================

export async function createDuel(
  creatorAddress: string,
  entryFee: number,
  tradingToken: string,
  duration: number
): Promise<Duel | null> {
  try {
    // Ensure user profile exists
    await createOrGetUserProfile(creatorAddress)

    const { data, error } = await supabase
      .from('duels')
      .insert({
        creator_address: creatorAddress,
        entry_fee: entryFee,
        trading_token: tradingToken,
        duration: duration,
        prize_pool: entryFee * 2,
        status: 'waiting'
      })
      .select()
      .single()

    if (error) throw error

    // Add creator as participant
    await supabase
      .from('duel_participants')
      .insert({
        duel_id: data.id,
        wallet_address: creatorAddress,
        position: 1
      })

    return data
  } catch (error) {
    console.error('Error creating duel:', error)
    return null
  }
}

export async function getAllDuels(status?: 'waiting' | 'active' | 'completed'): Promise<Duel[]> {
  try {
    let query = supabase
      .from('duels')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching duels:', error)
    return []
  }
}

export async function getDuelById(duelId: string): Promise<Duel | null> {
  try {
    const { data, error } = await supabase
      .from('duels')
      .select('*')
      .eq('id', duelId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching duel:', error)
    return null
  }
}

export async function joinDuel(duelId: string, challengerAddress: string): Promise<boolean> {
  try {
    // Ensure user profile exists
    await createOrGetUserProfile(challengerAddress)

    // Check if duel is still waiting
    const duel = await getDuelById(duelId)
    if (!duel || duel.status !== 'waiting') {
      throw new Error('Duel is not available for joining')
    }

    // Add challenger as participant
    const { error: participantError } = await supabase
      .from('duel_participants')
      .insert({
        duel_id: duelId,
        wallet_address: challengerAddress,
        position: 2
      })

    if (participantError) throw participantError

    // Update duel status to active
    const { error: updateError } = await supabase
      .from('duels')
      .update({
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('id', duelId)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error('Error joining duel:', error)
    return false
  }
}

export async function getDuelParticipants(duelId: string): Promise<DuelParticipant[]> {
  try {
    const { data, error } = await supabase
      .from('duel_participants')
      .select('*')
      .eq('duel_id', duelId)
      .order('position', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching duel participants:', error)
    return []
  }
}

// =============================================
// TRADING FUNCTIONS
// =============================================

export async function recordTrade(
  duelId: string,
  participantId: string,
  walletAddress: string,
  action: 'buy' | 'sell',
  token: string,
  amount: number,
  price: number
): Promise<DuelTrade | null> {
  try {
    const { data, error } = await supabase
      .from('duel_trades')
      .insert({
        duel_id: duelId,
        participant_id: participantId,
        wallet_address: walletAddress,
        action: action,
        token: token,
        amount: amount,
        price: price
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error recording trade:', error)
    return null
  }
}

export async function getDuelTrades(duelId: string): Promise<DuelTrade[]> {
  try {
    const { data, error } = await supabase
      .from('duel_trades')
      .select('*')
      .eq('duel_id', duelId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching duel trades:', error)
    return []
  }
}

// =============================================
// DUEL COMPLETION
// =============================================

export async function completeDuel(
  duelId: string,
  winnerAddress: string,
  participants: Array<{
    participantId: string
    finalBalance: number
    pnl: number
    pnlPercent: number
  }>
): Promise<boolean> {
  try {
    // Update duel status
    const { error: duelError } = await supabase
      .from('duels')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        winner_address: winnerAddress
      })
      .eq('id', duelId)

    if (duelError) throw duelError

    // Update participant stats
    for (const p of participants) {
      const { error: participantError } = await supabase
        .from('duel_participants')
        .update({
          final_balance: p.finalBalance,
          pnl: p.pnl,
          pnl_percent: p.pnlPercent
        })
        .eq('id', p.participantId)

      if (participantError) throw participantError
    }

    return true
  } catch (error) {
    console.error('Error completing duel:', error)
    return false
  }
}

// =============================================
// HISTORY & STATS
// =============================================

export async function getUserDuelHistory(walletAddress: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('duel_participants')
      .select(`
        *,
        duels (
          id,
          trading_token,
          entry_fee,
          duration,
          status,
          created_at,
          ended_at,
          winner_address,
          prize_pool
        )
      `)
      .eq('wallet_address', walletAddress)
      .order('joined_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user duel history:', error)
    return []
  }
}

// =============================================
// REAL-TIME SUBSCRIPTIONS
// =============================================

export function subscribeToDuelUpdates(duelId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`duel:${duelId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'duels',
        filter: `id=eq.${duelId}`
      },
      callback
    )
    .subscribe()
}

export function subscribeToDuelTrades(duelId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`trades:${duelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'duel_trades',
        filter: `duel_id=eq.${duelId}`
      },
      callback
    )
    .subscribe()
}
