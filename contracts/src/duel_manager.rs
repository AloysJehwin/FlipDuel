// FlipDuel - DuelManager Contract
// Manages competitive NFT trading duels on Casper Network

use odra::prelude::*;
use odra::casper_types::U512;

#[odra::module]
pub struct FlipDuelManager {
    duels: Mapping<u64, Duel>,
    active_duels: List<u64>,
    user_duels: Mapping<Address, List<u64>>,
    next_duel_id: Var<u64>,
    trading_engine: Var<Address>,
    platform_fee_percentage: Var<u8>,
    total_duels_created: Var<u64>,
    total_prize_distributed: Var<U512>,
}

#[odra::odra_type]
pub struct Duel {
    pub id: u64,
    pub creator: Address,
    pub participants: Vec<Address>,
    pub entry_fee: U512,
    pub prize_pool: U512,
    pub start_time: u64,
    pub end_time: u64,
    pub duration_seconds: u64,
    pub status: DuelStatus,
    pub nft_collection: String,
    pub max_participants: u8,
    pub winner: Option<Address>,
    pub claimed: bool,
}

#[odra::odra_type]
pub enum DuelStatus {
    Open,      // Accepting players
    Active,    // Trading in progress
    Closed,    // Completed, winner determined
    Cancelled, // Cancelled before starting
}

#[odra::module]
impl FlipDuelManager {
    /// Initialize the FlipDuel contract
    pub fn init(&mut self, trading_engine_addr: Address) {
        self.next_duel_id.set(1);
        self.trading_engine.set(trading_engine_addr);
        self.platform_fee_percentage.set(5); // 5% platform fee
        self.total_duels_created.set(0);
        self.total_prize_distributed.set(U512::zero());
    }

    /// Create a new trading duel
    #[odra(payable)]
    pub fn create_duel(
        &mut self,
        duration_seconds: u64,
        nft_collection: String,
        max_participants: u8,
    ) -> u64 {
        let entry_fee = self.env().attached_value();
        if entry_fee == U512::zero() {
            self.env().revert(Error::InvalidEntryFee);
        }
        if duration_seconds < 60 {
            self.env().revert(Error::InvalidDuration);
        }
        if duration_seconds > 600 {
            self.env().revert(Error::InvalidDuration);
        }
        if max_participants < 2 {
            self.env().revert(Error::InvalidParticipantCount);
        }
        if max_participants > 10 {
            self.env().revert(Error::InvalidParticipantCount);
        }

        let duel_id = self.next_duel_id.get_or_default();
        let creator = self.env().caller();

        let mut participants = Vec::new();
        participants.push(creator);

        let duel = Duel {
            id: duel_id,
            creator,
            participants,
            entry_fee,
            prize_pool: entry_fee,
            start_time: 0,
            end_time: 0,
            duration_seconds,
            status: DuelStatus::Open,
            nft_collection,
            max_participants,
            winner: None,
            claimed: false,
        };

        self.duels.set(&duel_id, duel);
        self.active_duels.push(duel_id);
        
        let mut user_duels = self.user_duels.get(&creator).unwrap_or_default();
        user_duels.push(duel_id);
        self.user_duels.set(&creator, user_duels);

        self.next_duel_id.set(duel_id + 1);
        let total = self.total_duels_created.get_or_default();
        self.total_duels_created.set(total + 1);

        self.env().emit_event(DuelCreated {
            duel_id,
            creator,
            entry_fee,
            duration_seconds,
            max_participants,
        });

        duel_id
    }

    /// Join an existing duel
    #[odra(payable)]
    pub fn join_duel(&mut self, duel_id: u64) {
        let mut duel = self.duels.get(&duel_id).expect("FlipDuel: Duel not found");
        let caller = self.env().caller();
        let attached_value = self.env().attached_value();

        if !matches!(duel.status, DuelStatus::Open) {
            self.env().revert(Error::DuelNotOpen);
        }
        if attached_value != duel.entry_fee {
            self.env().revert(Error::IncorrectFee);
        }
        if duel.participants.contains(&caller) {
            self.env().revert(Error::AlreadyParticipant);
        }
        if duel.participants.len() >= duel.max_participants as usize {
            self.env().revert(Error::DuelFull);
        }

        duel.participants.push(caller);
        duel.prize_pool = duel.prize_pool + attached_value;

        // Auto-start if max participants reached
        if duel.participants.len() == duel.max_participants as usize {
            self.start_duel_internal(&mut duel);
        }

        self.duels.set(&duel_id, duel);

        let mut user_duels = self.user_duels.get(&caller).unwrap_or_default();
        user_duels.push(duel_id);
        self.user_duels.set(&caller, user_duels);

        self.env().emit_event(PlayerJoined {
            duel_id,
            player: caller,
            participants_count: duel.participants.len() as u8,
        });
    }

    /// Manually start a duel (if minimum players met)
    pub fn start_duel(&mut self, duel_id: u64) {
        let mut duel = self.duels.get(&duel_id).expect("FlipDuel: Duel not found");
        let caller = self.env().caller();
        
        if caller != duel.creator {
            self.env().revert(Error::OnlyCreator);
        }
        if !matches!(duel.status, DuelStatus::Open) {
            self.env().revert(Error::DuelNotOpen);
        }
        if duel.participants.len() < 2 {
            self.env().revert(Error::NotEnoughParticipants);
        }
        
        self.start_duel_internal(&mut duel);
        self.duels.set(&duel_id, duel);
    }

    fn start_duel_internal(&self, duel: &mut Duel) {
        let current_time = self.env().get_block_time();
        duel.start_time = current_time;
        duel.end_time = current_time + (duel.duration_seconds * 1000); // Convert to ms
        duel.status = DuelStatus::Active;

        // Initialize trading portfolios for all participants
        let starting_balance = duel.entry_fee;
        
        // Note: In production, call trading engine to initialize each portfolio
        // For now, this is a placeholder for the integration point

        self.env().emit_event(DuelStarted {
            duel_id: duel.id,
            start_time: duel.start_time,
            end_time: duel.end_time,
            participants_count: duel.participants.len() as u8,
        });
    }

    /// Close a duel and determine winner
    pub fn close_duel(&mut self, duel_id: u64) {
        let mut duel = self.duels.get(&duel_id).expect("FlipDuel: Duel not found");
        let current_time = self.env().get_block_time();

        if !matches!(duel.status, DuelStatus::Active) {
            self.env().revert(Error::DuelNotActive);
        }
        if current_time < duel.end_time {
            self.env().revert(Error::DuelNotEnded);
        }

        // Calculate winner (highest gain percentage)
        // In production: Query TradingEngine for each participant's gain
        let mut max_gain: i32 = i32::MIN;
        let mut winner: Option<Address> = None;

        // TODO: Replace with actual trading engine query
        // For now, first participant wins (placeholder)
        if !duel.participants.is_empty() {
            winner = Some(duel.participants[0]);
            max_gain = 0;
        }

        duel.winner = winner;
        duel.status = DuelStatus::Closed;
        self.duels.set(&duel_id, duel);

        self.env().emit_event(DuelClosed {
            duel_id,
            winner: winner.unwrap(),
            gain_percentage: max_gain,
            prize_pool: duel.prize_pool,
        });
    }

    /// Winner claims their prize
    pub fn claim_rewards(&mut self, duel_id: u64) {
        let mut duel = self.duels.get(&duel_id).expect("FlipDuel: Duel not found");
        let caller = self.env().caller();

        if !matches!(duel.status, DuelStatus::Closed) {
            self.env().revert(Error::DuelNotClosed);
        }
        if duel.winner != Some(caller) {
            self.env().revert(Error::NotWinner);
        }
        if duel.claimed {
            self.env().revert(Error::AlreadyClaimed);
        }

        let platform_fee_pct = self.platform_fee_percentage.get_or_default();
        let platform_fee = (duel.prize_pool * U512::from(platform_fee_pct)) / U512::from(100);
        let winner_amount = duel.prize_pool - platform_fee;

        duel.claimed = true;
        self.duels.set(&duel_id, duel);

        // Update total distributed
        let total_distributed = self.total_prize_distributed.get_or_default();
        self.total_prize_distributed.set(total_distributed + winner_amount);

        // Transfer prize to winner
        self.env().transfer_tokens(&caller, &winner_amount);

        // Transfer platform fee (could be to treasury address)
        if platform_fee > U512::zero() {
            // In production: transfer to designated treasury address
            // For now, keeps in contract
        }

        self.env().emit_event(RewardsClaimed {
            duel_id,
            winner: caller,
            amount: winner_amount,
            platform_fee,
        });
    }

    /// Cancel a duel (only if less than 2 players)
    pub fn cancel_duel(&mut self, duel_id: u64) {
        let mut duel = self.duels.get(&duel_id).expect("FlipDuel: Duel not found");
        let caller = self.env().caller();

        if caller != duel.creator {
            self.env().revert(Error::OnlyCreator);
        }
        if !matches!(duel.status, DuelStatus::Open) {
            self.env().revert(Error::DuelNotOpen);
        }
        if duel.participants.len() >= 2 {
            self.env().revert(Error::CannotCancel);
        }

        duel.status = DuelStatus::Cancelled;
        self.duels.set(&duel_id, duel);

        // Refund all participants
        for participant in &duel.participants {
            self.env().transfer_tokens(participant, &duel.entry_fee);
        }

        self.env().emit_event(DuelCancelled { 
            duel_id,
            refunded_players: duel.participants.len() as u8,
        });
    }

    // ============== VIEW FUNCTIONS ==============

    /// Get duel details by ID
    pub fn get_duel(&self, duel_id: u64) -> Option<Duel> {
        self.duels.get(&duel_id)
    }

    /// Get all active duels (Open or Active status)
    pub fn get_active_duels(&self) -> Vec<u64> {
        let mut result = Vec::new();
        for i in 0..self.active_duels.len() {
            if let Some(duel_id) = self.active_duels.get(i) {
                if let Some(duel) = self.duels.get(&duel_id) {
                    if matches!(duel.status, DuelStatus::Open | DuelStatus::Active) {
                        result.push(duel_id);
                    }
                }
            }
        }
        result
    }

    /// Get all duels for a specific user
    pub fn get_user_duels(&self, user: Address) -> Vec<u64> {
        self.user_duels
            .get(&user)
            .unwrap_or_default()
            .iter()
            .collect()
    }

    /// Get platform statistics
    pub fn get_platform_stats(&self) -> PlatformStats {
        PlatformStats {
            total_duels: self.total_duels_created.get_or_default(),
            total_prize_distributed: self.total_prize_distributed.get_or_default(),
            platform_fee_percentage: self.platform_fee_percentage.get_or_default(),
        }
    }

    /// Update platform fee (admin only)
    pub fn set_platform_fee(&mut self, new_fee_percentage: u8) {
        if new_fee_percentage > 10 {
            self.env().revert(Error::InvalidFeePercentage);
        }
        self.platform_fee_percentage.set(new_fee_percentage);
    }
}

#[odra::odra_type]
pub struct PlatformStats {
    pub total_duels: u64,
    pub total_prize_distributed: U512,
    pub platform_fee_percentage: u8,
}

// ============== EVENTS ==============

#[odra::event]
pub struct DuelCreated {
    pub duel_id: u64,
    pub creator: Address,
    pub entry_fee: U512,
    pub duration_seconds: u64,
    pub max_participants: u8,
}

#[odra::event]
pub struct PlayerJoined {
    pub duel_id: u64,
    pub player: Address,
    pub participants_count: u8,
}

#[odra::event]
pub struct DuelStarted {
    pub duel_id: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub participants_count: u8,
}

#[odra::event]
pub struct DuelClosed {
    pub duel_id: u64,
    pub winner: Address,
    pub gain_percentage: i32,
    pub prize_pool: U512,
}

#[odra::event]
pub struct RewardsClaimed {
    pub duel_id: u64,
    pub winner: Address,
    pub amount: U512,
    pub platform_fee: U512,
}

#[odra::event]
pub struct DuelCancelled {
    pub duel_id: u64,
    pub refunded_players: u8,
}

#[odra::odra_error]
pub enum Error {
    InvalidEntryFee,
    InvalidDuration,
    InvalidParticipantCount,
    DuelNotOpen,
    IncorrectFee,
    AlreadyParticipant,
    DuelFull,
    OnlyCreator,
    NotEnoughParticipants,
    DuelNotActive,
    DuelNotEnded,
    DuelNotClosed,
    NotWinner,
    AlreadyClaimed,
    CannotCancel,
    InvalidFeePercentage,
}