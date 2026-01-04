#[cfg(test)]
mod tests {
    use odra::host::{Deployer, HostEnv};
    use flipdule_contracts::liquid_stake::{LiquidStake, LiquidStakeHostRef};
    use odra::casper_types::{U512, PublicKey};
    use std::str::FromStr;

    #[test]
    fn test_payable_stake() {
        let env = odra::test_env();
        let owner = env.get_account(0);
        let staker = env.get_account(1);

        // Deploy LiquidStake
        env.set_caller(owner);
        let mut liquid_stake = LiquidStakeHostRef::deploy(&env);
        liquid_stake.init(owner);

        // Add a validator
        let validator_pk = PublicKey::from_str("01360af61b50cdcb7b92cffe2c99315d413d34ef77fadee0c105cc4f1d4120f986").unwrap();
        liquid_stake.add_validator(validator_pk);

        // Test staking with attached value
        env.set_caller(staker);
        let stake_amount = U512::from(10_000_000_000u64); // 10 CSPR

        // Call stake with attached tokens
        let stcspr_minted = liquid_stake
            .with_tokens(stake_amount)
            .stake(validator_pk);

        println!("✅ Stake successful!");
        println!("📊 CSPR staked: {}", stake_amount);
        println!("🪙 stCSPR minted: {}", stcspr_minted);

        // Verify the staker received stCSPR
        assert!(stcspr_minted > odra::casper_types::U256::zero(), "Should have minted stCSPR");
    }
}
