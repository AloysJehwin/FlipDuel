#![cfg_attr(not(test), no_std)]
#![cfg_attr(not(test), no_main)]
extern crate alloc;

pub mod price_oracle;
pub mod trading_engine;
pub mod duel_manager;

pub use price_oracle::FlipDuelPriceOracle;
pub use trading_engine::FlipDuelTradingEngine;
pub use duel_manager::FlipDuelManager;
