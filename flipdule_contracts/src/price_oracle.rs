// FlipDuel - PriceOracle Contract
// Manages NFT price feeds for trading duels

use odra::prelude::*;
use odra::casper_types::U512;

#[odra::module]
pub struct FlipDuelPriceOracle {
    nft_prices: Mapping<String, PriceData>,
    authorized_updaters: List<Address>,
    owner: Var<Address>,
    min_update_interval: Var<u64>,
    total_price_updates: Var<u64>,
}

#[odra::odra_type]
pub struct PriceData {
    pub nft_id: String,
    pub price: U512,
    pub last_updated: u64,
    pub source: String,
    pub update_count: u32,
}

#[odra::module]
impl FlipDuelPriceOracle {
    /// Initialize the price oracle
    pub fn init(&mut self) {
        let caller = self.env().caller();
        self.owner.set(caller);
        self.min_update_interval.set(30000); // 30 seconds default
        self.total_price_updates.set(0);
        
        // Add owner as first authorized updater
        self.authorized_updaters.push(caller);

        self.env().emit_event(OracleInitialized { owner: caller });
    }

    /// Update a single NFT price
    pub fn update_price(&mut self, nft_id: String, price: U512, source: String) {
        let caller = self.env().caller();
        self.require_authorized(caller);

        if price == U512::zero() {
            self.env().revert(Error::InvalidPrice);
        }

        let current_time = self.env().get_block_time();
        
        // Check if update interval has passed
        if let Some(existing) = self.nft_prices.get(&nft_id) {
            let min_interval = self.min_update_interval.get_or_default();
            if current_time < existing.last_updated + min_interval {
                self.env().revert(Error::UpdateTooFrequent);
            }
        }

        let update_count = self.nft_prices
            .get(&nft_id)
            .map(|p| p.update_count + 1)
            .unwrap_or(1);

        let price_data = PriceData {
            nft_id: nft_id.clone(),
            price,
            last_updated: current_time,
            source: source.clone(),
            update_count,
        };

        self.nft_prices.set(&nft_id, price_data);

        // Increment global counter
        let total = self.total_price_updates.get_or_default();
        self.total_price_updates.set(total + 1);

        self.env().emit_event(PriceUpdated {
            nft_id,
            price,
            timestamp: current_time,
            source,
            updater: caller,
        });
    }

    /// Batch update multiple NFT prices
    pub fn batch_update_prices(&mut self, updates: Vec<(String, U512, String)>) {
        let caller = self.env().caller();
        self.require_authorized(caller);

        if updates.is_empty() {
            self.env().revert(Error::EmptyBatchUpdate);
        }
        if updates.len() > 50 {
            self.env().revert(Error::BatchTooLarge);
        }

        let current_time = self.env().get_block_time();
        let mut updated_count = 0u32;

        for (nft_id, price, source) in updates {
            if price == U512::zero() {
            self.env().revert(Error::InvalidPrice);
        }

            let update_count = self.nft_prices
                .get(&nft_id)
                .map(|p| p.update_count + 1)
                .unwrap_or(1);

            let price_data = PriceData {
                nft_id: nft_id.clone(),
                price,
                last_updated: current_time,
                source,
                update_count,
            };

            self.nft_prices.set(&nft_id, price_data);
            updated_count += 1;
        }

        // Update global counter
        let total = self.total_price_updates.get_or_default();
        self.total_price_updates.set(total + updated_count as u64);

        self.env().emit_event(BatchUpdateCompleted {
            count: updated_count,
            timestamp: current_time,
            updater: caller,
        });
    }

    /// Get current price for an NFT
    pub fn get_price(&self, nft_id: String) -> U512 {
        self.nft_prices
            .get(&nft_id)
            .map(|data| data.price)
            .unwrap_or(U512::zero())
    }

    /// Get complete price data for an NFT
    pub fn get_price_data(&self, nft_id: String) -> Option<PriceData> {
        self.nft_prices.get(&nft_id)
    }

    /// Get prices for multiple NFTs
    pub fn get_multiple_prices(&self, nft_ids: Vec<String>) -> Vec<(String, U512)> {
        nft_ids
            .into_iter()
            .map(|id| {
                let price = self.get_price(id.clone());
                (id, price)
            })
            .collect()
    }

    // ============== ADMIN FUNCTIONS ==============

    /// Add an authorized price updater
    pub fn add_authorized_updater(&mut self, updater: Address) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        
        if caller != owner {
            self.env().revert(Error::OnlyOwner);
        }

        // Check if already authorized
        let is_authorized = (0..self.authorized_updaters.len())
            .any(|i| self.authorized_updaters.get(i) == Some(updater));

        if is_authorized {
            self.env().revert(Error::AlreadyAuthorized);
        }

        self.authorized_updaters.push(updater);

        self.env().emit_event(UpdaterAdded { 
            updater,
            added_by: caller,
        });
    }

    /// Remove an authorized updater
    pub fn remove_authorized_updater(&mut self, updater: Address) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        
        if caller != owner {
            self.env().revert(Error::OnlyOwner);
        }

        // Find and remove updater
        let mut found = false;
        for i in 0..self.authorized_updaters.len() {
            if self.authorized_updaters.get(i) == Some(updater) {
                // Swap with last element and truncate
                let last_idx = self.authorized_updaters.len() - 1;
                if i != last_idx {
                    if let Some(last_val) = self.authorized_updaters.get(last_idx) {
                        self.authorized_updaters.replace(i, last_val);
                    }
                }
                found = true;
                break;
            }
        }

        if !found {
            self.env().revert(Error::UpdaterNotFound);
        }

        self.env().emit_event(UpdaterRemoved { 
            updater,
            removed_by: caller,
        });
    }

    /// Set minimum update interval
    pub fn set_min_update_interval(&mut self, interval_ms: u64) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        
        if caller != owner {
            self.env().revert(Error::OnlyOwner);
        }
        if interval_ms < 1000 {
            self.env().revert(Error::InvalidInterval);
        }
        if interval_ms > 300000 {
            self.env().revert(Error::InvalidInterval);
        }

        let old_interval = self.min_update_interval.get_or_default();
        self.min_update_interval.set(interval_ms);

        self.env().emit_event(IntervalUpdated {
            old_interval,
            new_interval: interval_ms,
        });
    }

    /// Transfer ownership
    pub fn transfer_ownership(&mut self, new_owner: Address) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        
        if caller != owner {
            self.env().revert(Error::OnlyOwner);
        }
        if new_owner == Address::new("0000000000000000000000000000000000000000000000000000000000000000").unwrap() {
            self.env().revert(Error::InvalidAddress);
        }

        self.owner.set(new_owner);

        // Add new owner as authorized updater
        self.authorized_updaters.push(new_owner);

        self.env().emit_event(OwnershipTransferred {
            previous_owner: owner,
            new_owner,
        });
    }

    // ============== VIEW FUNCTIONS ==============

    /// Check if an address is authorized
    pub fn is_authorized(&self, address: Address) -> bool {
        (0..self.authorized_updaters.len())
            .any(|i| self.authorized_updaters.get(i) == Some(address))
    }

    /// Get all authorized updaters
    pub fn get_authorized_updaters(&self) -> Vec<Address> {
        (0..self.authorized_updaters.len())
            .filter_map(|i| self.authorized_updaters.get(i))
            .collect()
    }

    /// Get oracle statistics
    pub fn get_oracle_stats(&self) -> OracleStats {
        OracleStats {
            total_updates: self.total_price_updates.get_or_default(),
            min_update_interval: self.min_update_interval.get_or_default(),
            authorized_updaters_count: self.authorized_updaters.len() as u32,
            owner: self.owner.get().unwrap(),
        }
    }

    /// Get owner address
    pub fn get_owner(&self) -> Address {
        self.owner.get().unwrap()
    }

    /// Get minimum update interval
    pub fn get_min_update_interval(&self) -> u64 {
        self.min_update_interval.get_or_default()
    }

    // ============== INTERNAL HELPERS ==============

    fn require_authorized(&self, address: Address) {
        if !self.is_authorized(address) {
            self.env().revert(Error::NotAuthorized);
        }
    }
}

#[odra::odra_type]
pub struct OracleStats {
    pub total_updates: u64,
    pub min_update_interval: u64,
    pub authorized_updaters_count: u32,
    pub owner: Address,
}

// ============== EVENTS ==============

#[odra::event]
pub struct OracleInitialized {
    pub owner: Address,
}

#[odra::event]
pub struct PriceUpdated {
    pub nft_id: String,
    pub price: U512,
    pub timestamp: u64,
    pub source: String,
    pub updater: Address,
}

#[odra::event]
pub struct BatchUpdateCompleted {
    pub count: u32,
    pub timestamp: u64,
    pub updater: Address,
}

#[odra::event]
pub struct UpdaterAdded {
    pub updater: Address,
    pub added_by: Address,
}

#[odra::event]
pub struct UpdaterRemoved {
    pub updater: Address,
    pub removed_by: Address,
}

#[odra::event]
pub struct IntervalUpdated {
    pub old_interval: u64,
    pub new_interval: u64,
}

#[odra::event]
pub struct OwnershipTransferred {
    pub previous_owner: Address,
    pub new_owner: Address,
}

#[odra::odra_error]
pub enum Error {
    InvalidPrice,
    UpdateTooFrequent,
    EmptyBatchUpdate,
    BatchTooLarge,
    OnlyOwner,
    AlreadyAuthorized,
    UpdaterNotFound,
    InvalidInterval,
    InvalidAddress,
    NotAuthorized,
}