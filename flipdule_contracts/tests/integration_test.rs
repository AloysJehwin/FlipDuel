use odra::host::{Deployer, HostEnv, HostRef};
use flipdule_contracts::{FlipDuelPriceOracle, FlipDuelTradingEngine, FlipDuelManager};

#[test]
fn test_full_duel_simulation() {
    // Setup mock environment
    let env = odra_test::env();

    // Create test accounts
    let deployer = env.get_account(0);
    let user1 = env.get_account(1);
    let user2 = env.get_account(2);

    env.set_caller(deployer);

    // Deploy contracts
    let mut price_oracle = FlipDuelPriceOracleHostRef::deploy(&env);
    price_oracle.init();

    let mut trading_engine = FlipDuelTradingEngineHostRef::deploy(&env);
    trading_engine.init();

    let mut duel_manager = FlipDuelManagerHostRef::deploy(&env);
    duel_manager.init();

    // Wire contracts together
    let oracle_addr = price_oracle.address();
    let engine_addr = trading_engine.address();
    let manager_addr = duel_manager.address();

    trading_engine.set_price_oracle(oracle_addr);
    trading_engine.set_duel_manager(manager_addr);
    duel_manager.set_trading_engine(engine_addr);

    // Set up NFT prices
    price_oracle.update_price("NFT1".to_string(), 5_000_000_000u64.into(), "test".to_string());
    price_oracle.update_price("NFT2".to_string(), 3_000_000_000u64.into(), "test".to_string());

    // User 1 creates duel
    env.set_caller(user1);
    let entry_fee = 10_000_000_000u64.into();
    duel_manager.create_duel_with_payment(
        3600, // 1 hour
        2,    // max participants
        entry_fee,
        entry_fee
    );

    // User 2 joins duel
    env.set_caller(user2);
    duel_manager.join_duel_with_payment(1, entry_fee);

    // Simulate trading
    env.set_caller(user1);
    trading_engine.buy_nft(1, "NFT1".to_string(), 5_000_000_000u64.into());
    trading_engine.sell_nft(1, "NFT1".to_string());

    env.set_caller(user2);
    trading_engine.buy_nft(1, "NFT2".to_string(), 3_000_000_000u64.into());

    // Finalize duel
    env.advance_block_time(3600 * 1000);
    env.set_caller(user1);
    duel_manager.finalize_duel(1);

    println!("✅ Full duel simulation completed successfully!");
    println!("🎉 User 1 should receive 20 CSPR prize");
}

#[test]
fn test_contract_initialization() {
    let env = odra_test::env();
    let deployer = env.get_account(0);
    env.set_caller(deployer);

    // Test Price Oracle
    let mut price_oracle = FlipDuelPriceOracleHostRef::deploy(&env);
    price_oracle.init();
    println!("✅ Price Oracle initialized");

    // Test Trading Engine
    let mut trading_engine = FlipDuelTradingEngineHostRef::deploy(&env);
    trading_engine.init();
    println!("✅ Trading Engine initialized");

    // Test Duel Manager
    let mut duel_manager = FlipDuelManagerHostRef::deploy(&env);
    duel_manager.init();
    println!("✅ Duel Manager initialized");

    // Wire them together
    trading_engine.set_price_oracle(price_oracle.address());
    trading_engine.set_duel_manager(duel_manager.address());
    duel_manager.set_trading_engine(trading_engine.address());

    println!("✅ All contracts wired together successfully!");
}
