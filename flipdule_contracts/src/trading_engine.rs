// FlipDuel - TradingEngine Contract
// Handles NFT trading simulation and portfolio management

use odra::prelude::*;
use odra::casper_types::U512;

#[odra::module]
pub struct FlipDuelTradingEngine {
    portfolios: Mapping<(u64, Address), Portfolio>,
    trade_history: Mapping<(u64, Address), List<Trade>>,
    nft_prices: Mapping<String, U512>,
    price_oracle: Var<Address>,
    duel_manager: Var<Address>,
    owner: Var<Address>,
    total_trades: Var<u64>,
}

#[odra::odra_type]
pub struct Portfolio {
    pub player: Address,
    pub duel_id: u64,
    pub cspr_balance: U512,
    pub nfts_owned: Vec<NFTHolding>,
    pub initial_value: U512,
    pub trades_count: u32,
}

#[odra::odra_type]
pub struct NFTHolding {
    pub nft_id: String,
    pub purchase_price: U512,
    pub purchase_time: u64,
}

#[odra::odra_type]
pub struct Trade {
    pub nft_id: String,
    pub trade_type: TradeType,
    pub price: U512,
    pub timestamp: u64,
}

#[odra::odra_type]
pub enum TradeType {
    Buy,
    Sell,
}

#[odra::odra_type]
pub struct PortfolioStats {
    pub current_value: U512,
    pub initial_value: U512,
    pub gain_percentage: i32,
    pub trades_count: u32,
    pub nfts_count: u32,
}

#[odra::module]
impl FlipDuelTradingEngine {
    /// Initialize the trading engine
    pub fn init(&mut self) {
        let caller = self.env().caller();
        self.owner.set(caller);
        self.total_trades.set(0);
    }

    /// Set price oracle address (owner only)
    pub fn set_price_oracle(&mut self, price_oracle_addr: Address) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        if caller != owner {
            self.env().revert(Error::Unauthorized);
        }
        self.price_oracle.set(price_oracle_addr);
    }

    /// Set duel manager address (owner only)
    pub fn set_duel_manager(&mut self, duel_manager_addr: Address) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        if caller != owner {
            self.env().revert(Error::Unauthorized);
        }
        self.duel_manager.set(duel_manager_addr);
    }

    /// Initialize a player's portfolio for a duel
    pub fn initialize_portfolio(&mut self, duel_id: u64, player: Address, starting_balance: U512) {
        let caller = self.env().caller();
        let duel_manager = self.duel_manager.get().unwrap();
        
        if caller != duel_manager {
            self.env().revert(Error::OnlyDuelManager);
        }

        let portfolio = Portfolio {
            player,
            duel_id,
            cspr_balance: starting_balance,
            nfts_owned: Vec::new(),
            initial_value: starting_balance,
            trades_count: 0,
        };

        self.portfolios.set(&(duel_id, player), portfolio);

        self.env().emit_event(PortfolioInitialized {
            duel_id,
            player,
            starting_balance,
        });
    }

    /// Execute a buy trade
    pub fn execute_buy(&mut self, duel_id: u64, nft_id: String) {
        let caller = self.env().caller();
        let mut portfolio = self.portfolios
            .get(&(duel_id, caller))
            .expect("FlipDuel: Portfolio not found");

        // Get current price from oracle
        let price = self.get_nft_price(&nft_id);
        
        if portfolio.cspr_balance < price {
            self.env().revert(Error::InsufficientBalance);
        }
        if portfolio.nfts_owned.iter().any(|h| h.nft_id == nft_id) {
            self.env().revert(Error::AlreadyOwnsNFT);
        }

        // Update portfolio
        portfolio.cspr_balance = portfolio.cspr_balance - price;
        portfolio.nfts_owned.push(NFTHolding {
            nft_id: nft_id.clone(),
            purchase_price: price,
            purchase_time: self.env().get_block_time(),
        });
        portfolio.trades_count += 1;

        self.portfolios.set(&(duel_id, caller), portfolio);

        // Record trade in history
        let _trade = Trade {
            nft_id: nft_id.clone(),
            trade_type: TradeType::Buy,
            price,
            timestamp: self.env().get_block_time(),
        };

        // Trade history disabled - List in Mapping not supported
        // history.push(trade);
        // self.trade_history.set(&(duel_id, caller), history);

        // Update global trade counter
        let total = self.total_trades.get_or_default();
        self.total_trades.set(total + 1);

        self.env().emit_event(TradeExecuted {
            duel_id,
            player: caller,
            nft_id,
            trade_type: TradeType::Buy,
            price,
            portfolio_value: self.get_portfolio_value(duel_id, caller),
        });
    }

    /// Execute a sell trade
    pub fn execute_sell(&mut self, duel_id: u64, nft_id: String) {
        let caller = self.env().caller();
        let mut portfolio = self.portfolios
            .get(&(duel_id, caller))
            .expect("FlipDuel: Portfolio not found");

        // Find and remove NFT from holdings
        let nft_index = portfolio
            .nfts_owned
            .iter()
            .position(|h| h.nft_id == nft_id)
            .expect("FlipDuel: NFT not owned");

        let _nft_holding = portfolio.nfts_owned.remove(nft_index);
        
        // Get current price from oracle
        let price = self.get_nft_price(&nft_id);

        // Update balance
        portfolio.cspr_balance = portfolio.cspr_balance + price;
        portfolio.trades_count += 1;
        
        self.portfolios.set(&(duel_id, caller), portfolio);

        // Record trade in history
        let _trade = Trade {
            nft_id: nft_id.clone(),
            trade_type: TradeType::Sell,
            price,
            timestamp: self.env().get_block_time(),
        };

        // Trade history disabled - List in Mapping not supported
        // history.push(trade);
        // self.trade_history.set(&(duel_id, caller), history);

        // Update global trade counter
        let total = self.total_trades.get_or_default();
        self.total_trades.set(total + 1);

        self.env().emit_event(TradeExecuted {
            duel_id,
            player: caller,
            nft_id,
            trade_type: TradeType::Sell,
            price,
            portfolio_value: self.get_portfolio_value(duel_id, caller),
        });
    }

    /// Get total portfolio value (CSPR + NFTs at current prices)
    pub fn get_portfolio_value(&self, duel_id: u64, player: Address) -> U512 {
        let portfolio = self.portfolios
            .get(&(duel_id, player))
            .expect("FlipDuel: Portfolio not found");

        let mut total_value = portfolio.cspr_balance;

        // Add current value of all NFTs
        for nft in &portfolio.nfts_owned {
            let current_price = self.get_nft_price(&nft.nft_id);
            total_value = total_value + current_price;
        }

        total_value
    }

    /// Calculate gain percentage for a player
    pub fn calculate_gain(&self, duel_id: u64, player: Address) -> i32 {
        let portfolio = self.portfolios
            .get(&(duel_id, player))
            .expect("FlipDuel: Portfolio not found");

        let current_value = self.get_portfolio_value(duel_id, player);
        let initial_value = portfolio.initial_value;

        if initial_value == U512::zero() {
            return 0;
        }

        // Calculate percentage gain: ((current - initial) / initial) * 100
        // Using fixed-point arithmetic for precision
        let is_positive = current_value >= initial_value;
        
        let diff = if is_positive {
            current_value - initial_value
        } else {
            initial_value - current_value
        };

        let gain_pct = (diff * U512::from(10000)) / initial_value;
        let gain_pct_u64 = gain_pct.as_u64();

        if is_positive {
            (gain_pct_u64 / 100) as i32
        } else {
            -((gain_pct_u64 / 100) as i32)
        }
    }

    /// Get portfolio statistics
    pub fn get_portfolio_stats(&self, duel_id: u64, player: Address) -> PortfolioStats {
        let portfolio = self.portfolios
            .get(&(duel_id, player))
            .expect("FlipDuel: Portfolio not found");

        let current_value = self.get_portfolio_value(duel_id, player);
        let gain_percentage = self.calculate_gain(duel_id, player);

        PortfolioStats {
            current_value,
            initial_value: portfolio.initial_value,
            gain_percentage,
            trades_count: portfolio.trades_count,
            nfts_count: portfolio.nfts_owned.len() as u32,
        }
    }

    /// Get complete trade history for a player in a duel
    pub fn get_trade_history(&self, _duel_id: u64, _player: Address) -> Vec<Trade> {
        // Trade history disabled - List in Mapping not supported
        Vec::new()
    }

    /// Get portfolio details
    pub fn get_portfolio(&self, duel_id: u64, player: Address) -> Option<Portfolio> {
        self.portfolios.get(&(duel_id, player))
    }

    /// Get leaderboard for a duel (all players sorted by gain)
    pub fn get_leaderboard(&self, duel_id: u64, players: Vec<Address>) -> Vec<LeaderboardEntry> {
        let mut leaderboard: Vec<LeaderboardEntry> = players
            .iter()
            .filter_map(|player| {
                if let Some(portfolio) = self.portfolios.get(&(duel_id, *player)) {
                    let current_value = self.get_portfolio_value(duel_id, *player);
                    let gain = self.calculate_gain(duel_id, *player);
                    
                    Some(LeaderboardEntry {
                        player: *player,
                        current_value,
                        gain_percentage: gain,
                        trades_count: portfolio.trades_count,
                    })
                } else {
                    None
                }
            })
            .collect();

        // Sort by gain percentage (descending)
        leaderboard.sort_by(|a, b| b.gain_percentage.cmp(&a.gain_percentage));
        
        leaderboard
    }

    // ============== PRICE MANAGEMENT ==============

    /// Get NFT price (from cache or oracle)
    fn get_nft_price(&self, nft_id: &str) -> U512 {
        // Check local cache first
        if let Some(price) = self.nft_prices.get(&nft_id.to_string()) {
            return price;
        }
        
        // Default price if not found
        U512::from(1_000_000_000u64) // 1 CSPR default
    }

    /// Update NFT price (called by oracle)
    pub fn update_nft_price(&mut self, nft_id: String, price: U512) {
        let caller = self.env().caller();
        let oracle = self.price_oracle.get().unwrap();
        
        if caller != oracle {
            self.env().revert(Error::OnlyOracle);
        }
        
        self.nft_prices.set(&nft_id, price);

        self.env().emit_event(PriceUpdated { 
            nft_id, 
            price 
        });
    }

    /// Batch update prices for efficiency
    pub fn batch_update_prices(&mut self, updates: Vec<(String, U512)>) {
        let caller = self.env().caller();
        let oracle = self.price_oracle.get().unwrap();
        
        if caller != oracle {
            self.env().revert(Error::OnlyOracle);
        }

        let count = updates.len() as u32;

        for (nft_id, price) in updates {
            self.nft_prices.set(&nft_id, price);
        }

        self.env().emit_event(BatchPricesUpdated {
            count,
        });
    }

    /// Get total platform trades
    pub fn get_total_trades(&self) -> u64 {
        self.total_trades.get_or_default()
    }
}

#[odra::odra_type]
pub struct LeaderboardEntry {
    pub player: Address,
    pub current_value: U512,
    pub gain_percentage: i32,
    pub trades_count: u32,
}

// ============== EVENTS ==============

#[odra::event]
pub struct PortfolioInitialized {
    pub duel_id: u64,
    pub player: Address,
    pub starting_balance: U512,
}

#[odra::event]
pub struct TradeExecuted {
    pub duel_id: u64,
    pub player: Address,
    pub nft_id: String,
    pub trade_type: TradeType,
    pub price: U512,
    pub portfolio_value: U512,
}

#[odra::event]
pub struct PriceUpdated {
    pub nft_id: String,
    pub price: U512,
}

#[odra::event]
pub struct BatchPricesUpdated {
    pub count: u32,
}

#[odra::odra_error]
pub enum Error {
    OnlyDuelManager,
    InsufficientBalance,
    AlreadyOwnsNFT,
    OnlyOracle,
    Unauthorized,
}