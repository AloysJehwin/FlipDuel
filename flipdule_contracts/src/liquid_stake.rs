#![allow(dead_code)]

use odra::prelude::*;
use odra::casper_types::{U512, U256, PublicKey};

// ============================================================================
// ERRORS
// ============================================================================

#[odra::odra_error]
pub enum Error {
    InsufficientBalance = 1,
    InsufficientStCsprBalance = 2,
    ZeroAmount = 3,
    InsufficientPoolBalance = 4,
    NoValidatorSet = 5,
    BelowMinimumDelegation = 6,
    ValidatorNotApproved = 7,
    ValidatorAlreadyExists = 8,
    WithdrawalNotReady = 9,
    WithdrawalNotFound = 10,
    WithdrawalAlreadyClaimed = 11,
    NotWithdrawalOwner = 12,
    MaxValidatorsReached = 13,
    NoDelegationFound = 14,
    UndelegateAmountExceedsDelegation = 15,
    InsufficientLiquidity = 16,
    NothingToDelegate = 17,
    NothingToUndelegate = 18,
    ContractPaused = 19,
    RewardsTooHigh = 20,
    ValueOverflow = 21,
    Unauthorized = 22,
}

// ============================================================================
// EVENTS
// ============================================================================

#[odra::event]
pub struct Staked {
    pub staker: Address,
    pub validator: PublicKey,
    pub cspr_amount: U512,
    pub stcspr_minted: U256,
}

#[odra::event]
pub struct UnstakeRequested {
    pub staker: Address,
    pub request_id: u64,
    pub stcspr_amount: U512,
    pub cspr_amount: U512,
}

#[odra::event]
pub struct Claimed {
    pub staker: Address,
    pub request_id: u64,
    pub cspr_amount: U512,
}

#[odra::event]
pub struct RewardsHarvested {
    pub amount: U512,
    pub new_exchange_rate: U512,
}

#[odra::event]
pub struct ValidatorAdded {
    pub validator: PublicKey,
}

#[odra::event]
pub struct AdminDelegated {
    pub validator: PublicKey,
    pub amount: U512,
}

#[odra::event]
pub struct AdminUndelegated {
    pub validator: PublicKey,
    pub amount: U512,
}

#[odra::event]
pub struct LiquidityAdded {
    pub amount: U512,
}

// ============================================================================
// WITHDRAWAL REQUEST
// ============================================================================

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct WithdrawalRequest {
    pub staker: Address,
    pub cspr_amount: U512,
    pub request_block: u64,
    pub claimed: bool,
}

impl odra::casper_types::bytesrepr::ToBytes for WithdrawalRequest {
    fn to_bytes(&self) -> Result<Vec<u8>, odra::casper_types::bytesrepr::Error> {
        let mut result = Vec::new();
        result.append(&mut self.staker.to_bytes()?);
        result.append(&mut self.cspr_amount.to_bytes()?);
        result.append(&mut self.request_block.to_bytes()?);
        result.append(&mut self.claimed.to_bytes()?);
        Ok(result)
    }
    fn serialized_length(&self) -> usize {
        self.staker.serialized_length()
            + self.cspr_amount.serialized_length()
            + self.request_block.serialized_length()
            + self.claimed.serialized_length()
    }
}

impl odra::casper_types::bytesrepr::FromBytes for WithdrawalRequest {
    fn from_bytes(bytes: &[u8]) -> Result<(Self, &[u8]), odra::casper_types::bytesrepr::Error> {
        let (staker, remainder) = Address::from_bytes(bytes)?;
        let (cspr_amount, remainder) = U512::from_bytes(remainder)?;
        let (request_block, remainder) = u64::from_bytes(remainder)?;
        let (claimed, remainder) = bool::from_bytes(remainder)?;
        Ok((
            WithdrawalRequest {
                staker,
                cspr_amount,
                request_block,
                claimed,
            },
            remainder,
        ))
    }
}

impl odra::casper_types::CLTyped for WithdrawalRequest {
    fn cl_type() -> odra::casper_types::CLType {
        odra::casper_types::CLType::Any
    }
}

// ============================================================================
// LIQUIDSTAKE CONTRACT - Pool-Based Liquid Staking
// ============================================================================

const RATE_PRECISION: u64 = 1_000_000_000;
const MIN_DELEGATION: u64 = 500_000_000_000;
const UNBONDING_BLOCKS: u64 = 5000;
const MAX_VALIDATORS: usize = 20;

#[odra::module(events = [Staked, UnstakeRequested, Claimed, RewardsHarvested, ValidatorAdded, AdminDelegated, AdminUndelegated, LiquidityAdded], errors = Error)]
pub struct LiquidStake {
    owner: Var<Address>,
    // Manual token tracking instead of CEP-18 SubModule
    balances: Mapping<Address, U256>,
    total_supply: Var<U256>,
    total_cspr_pool: Var<U512>,
    available_liquidity: Var<U512>,
    pending_withdrawals: Var<U512>,
    pending_undelegations: Var<U512>,
    validators: Mapping<u8, PublicKey>,
    validator_count: Var<u8>,
    validator_active: Mapping<PublicKey, bool>,
    validator_delegated: Mapping<PublicKey, U512>,
    withdrawal_requests: Mapping<u64, WithdrawalRequest>,
    next_request_id: Var<u64>,
    user_requests: Mapping<(Address, u64), u64>,
    user_request_count: Mapping<Address, u64>,
}

#[odra::module]
impl LiquidStake {
    pub fn init(&mut self, owner: Address) {
        self.owner.set(owner);
        self.total_supply.set(U256::zero());
        self.total_cspr_pool.set(U512::zero());
        self.available_liquidity.set(U512::zero());
        self.pending_withdrawals.set(U512::zero());
        self.pending_undelegations.set(U512::zero());
        self.validator_count.set(0);
        self.next_request_id.set(1);
    }

    /// Stake CSPR - ultra-simplified for cross-contract calls
    /// Simple 1:1 CSPR to stCSPR minting, no validations
    pub fn stake(&mut self, _validator: PublicKey, cspr_amount: U512) -> U256 {
        let staker = self.env().caller();

        // Simple 1:1 conversion
        let stcspr_to_mint = u512_to_u256(cspr_amount);

        // Mint stCSPR
        let balance = self.balances.get(&staker).unwrap_or(U256::zero());
        self.balances.set(&staker, balance + stcspr_to_mint);

        let supply = self.total_supply.get_or_default();
        self.total_supply.set(supply + stcspr_to_mint);

        let pool = self.total_cspr_pool.get_or_default();
        self.total_cspr_pool.set(pool + cspr_amount);

        stcspr_to_mint
    }

    pub fn request_unstake(&mut self, stcspr_amount: U512) -> u64 {
        let staker = self.env().caller();
        let stcspr_amount_u256 = u512_to_u256(stcspr_amount);

        if stcspr_amount_u256 == U256::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        let staker_balance = self.balances.get(&staker).unwrap_or(U256::zero());
        if stcspr_amount_u256 > staker_balance {
            self.env().revert(Error::InsufficientStCsprBalance);
        }

        let cspr_to_return = self.stcspr_to_cspr(stcspr_amount_u256);
        let pool = self.total_cspr_pool.get_or_default();
        if cspr_to_return > pool {
            self.env().revert(Error::InsufficientPoolBalance);
        }

        // Burn stCSPR manually
        self.balances.set(&staker, staker_balance - stcspr_amount_u256);
        let supply = self.total_supply.get_or_default();
        self.total_supply.set(supply - stcspr_amount_u256);

        self.total_cspr_pool.set(pool - cspr_to_return);

        let pending = self.pending_withdrawals.get_or_default();
        self.pending_withdrawals.set(pending + cspr_to_return);

        let pending_undel = self.pending_undelegations.get_or_default();
        self.pending_undelegations.set(pending_undel + cspr_to_return);

        let request_id = self.next_request_id.get_or_default();
        self.next_request_id.set(request_id + 1);

        let request = WithdrawalRequest {
            staker,
            cspr_amount: cspr_to_return,
            request_block: self.env().get_block_time(),
            claimed: false,
        };
        self.withdrawal_requests.set(&request_id, request);

        let user_count = self.user_request_count.get(&staker).unwrap_or(0);
        self.user_requests.set(&(staker, user_count), request_id);
        self.user_request_count.set(&staker, user_count + 1);

        self.env().emit_event(UnstakeRequested {
            staker,
            request_id,
            stcspr_amount,
            cspr_amount: cspr_to_return,
        });

        request_id
    }

    pub fn claim(&mut self, request_id: u64) {
        let caller = self.env().caller();
        let request = self.withdrawal_requests.get(&request_id);
        if request.is_none() {
            self.env().revert(Error::WithdrawalNotFound);
        }
        let mut request = request.unwrap();

        if request.staker != caller {
            self.env().revert(Error::NotWithdrawalOwner);
        }

        if request.claimed {
            self.env().revert(Error::WithdrawalAlreadyClaimed);
        }

        let current_block = self.env().get_block_time();
        if current_block < request.request_block + UNBONDING_BLOCKS {
            self.env().revert(Error::WithdrawalNotReady);
        }

        let liquidity = self.available_liquidity.get_or_default();
        if request.cspr_amount > liquidity {
            self.env().revert(Error::InsufficientLiquidity);
        }

        request.claimed = true;
        self.withdrawal_requests.set(&request_id, request.clone());

        let pending = self.pending_withdrawals.get_or_default();
        self.pending_withdrawals.set(pending - request.cspr_amount);

        self.available_liquidity.set(liquidity - request.cspr_amount);

        self.env().transfer_tokens(&caller, &request.cspr_amount);

        self.env().emit_event(Claimed {
            staker: caller,
            request_id,
            cspr_amount: request.cspr_amount,
        });
    }

    pub fn get_exchange_rate(&self) -> U512 {
        let total_cspr = self.total_cspr_pool.get_or_default();
        let total_stcspr = self.total_supply.get_or_default();

        if total_stcspr == U256::zero() {
            return U512::from(RATE_PRECISION);
        }

        let precision = U512::from(RATE_PRECISION);
        let total_stcspr_512 = u256_to_u512(total_stcspr);

        (total_cspr * precision) / total_stcspr_512
    }

    fn cspr_to_stcspr(&self, cspr_amount: U512) -> U256 {
        let total_cspr = self.total_cspr_pool.get_or_default();
        let total_stcspr = self.total_supply.get_or_default();

        if total_stcspr == U256::zero() || total_cspr == U512::zero() {
            return u512_to_u256(cspr_amount);
        }

        let total_stcspr_512 = u256_to_u512(total_stcspr);
        let result = (cspr_amount * total_stcspr_512) / total_cspr;
        u512_to_u256(result)
    }

    fn stcspr_to_cspr(&self, stcspr_amount: U256) -> U512 {
        let total_cspr = self.total_cspr_pool.get_or_default();
        let total_stcspr = self.total_supply.get_or_default();

        if total_stcspr == U256::zero() {
            return U512::zero();
        }

        let stcspr_512 = u256_to_u512(stcspr_amount);
        let total_stcspr_512 = u256_to_u512(total_stcspr);

        (stcspr_512 * total_cspr) / total_stcspr_512
    }

    pub fn admin_delegate(&mut self, validator: PublicKey, amount: U512) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        if caller != owner {
            self.env().revert(Error::Unauthorized);
        }

        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        if !self.validator_active.get(&validator).unwrap_or(false) {
            self.env().revert(Error::ValidatorNotApproved);
        }

        let liquidity = self.available_liquidity.get_or_default();
        if amount > liquidity {
            self.env().revert(Error::InsufficientLiquidity);
        }

        let current_delegated = self.validator_delegated.get(&validator).unwrap_or(U512::zero());
        if current_delegated == U512::zero() && amount < U512::from(MIN_DELEGATION) {
            self.env().revert(Error::BelowMinimumDelegation);
        }

        self.available_liquidity.set(liquidity - amount);
        self.validator_delegated.set(&validator, current_delegated + amount);

        #[cfg(not(test))]
        {
            self.env().delegate(validator.clone(), amount);
        }

        self.env().emit_event(AdminDelegated {
            validator,
            amount,
        });
    }

    pub fn admin_undelegate(&mut self, validator: PublicKey, amount: U512) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        if caller != owner {
            self.env().revert(Error::Unauthorized);
        }

        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        let delegated = self.validator_delegated.get(&validator).unwrap_or(U512::zero());
        if amount > delegated {
            self.env().revert(Error::UndelegateAmountExceedsDelegation);
        }

        self.validator_delegated.set(&validator, delegated - amount);

        let pending_undel = self.pending_undelegations.get_or_default();
        if amount <= pending_undel {
            self.pending_undelegations.set(pending_undel - amount);
        } else {
            self.pending_undelegations.set(U512::zero());
        }

        #[cfg(not(test))]
        {
            self.env().undelegate(validator.clone(), amount);
        }

        self.env().emit_event(AdminUndelegated {
            validator,
            amount,
        });
    }

    #[odra(payable)]
    pub fn admin_add_liquidity(&mut self) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        if caller != owner {
            self.env().revert(Error::Unauthorized);
        }

        let amount = self.env().attached_value();
        if amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        let liquidity = self.available_liquidity.get_or_default();
        self.available_liquidity.set(liquidity + amount);

        self.env().emit_event(LiquidityAdded { amount });
    }

    pub fn add_validator(&mut self, validator: PublicKey) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        if caller != owner {
            self.env().revert(Error::Unauthorized);
        }

        if self.validator_active.get(&validator).unwrap_or(false) {
            self.env().revert(Error::ValidatorAlreadyExists);
        }

        let count = self.validator_count.get_or_default();
        if count as usize >= MAX_VALIDATORS {
            self.env().revert(Error::MaxValidatorsReached);
        }

        self.validators.set(&count, validator.clone());
        self.validator_active.set(&validator, true);
        self.validator_delegated.set(&validator, U512::zero());
        self.validator_count.set(count + 1);

        self.env().emit_event(ValidatorAdded { validator });
    }

    #[odra(payable)]
    pub fn harvest_rewards(&mut self) {
        let caller = self.env().caller();
        let owner = self.owner.get().unwrap();
        if caller != owner {
            self.env().revert(Error::Unauthorized);
        }

        let reward_amount = self.env().attached_value();
        if reward_amount == U512::zero() {
            self.env().revert(Error::ZeroAmount);
        }

        let pool = self.total_cspr_pool.get_or_default();
        let max_reward = pool / U512::from(10);
        if reward_amount > max_reward && pool > U512::zero() {
            self.env().revert(Error::RewardsTooHigh);
        }

        self.total_cspr_pool.set(pool + reward_amount);

        let new_rate = self.get_exchange_rate();
        self.env().emit_event(RewardsHarvested {
            amount: reward_amount,
            new_exchange_rate: new_rate,
        });
    }

    // View functions
    pub fn get_stcspr_balance(&self, account: Address) -> U256 {
        self.balances.get(&account).unwrap_or(U256::zero())
    }

    pub fn get_total_supply(&self) -> U256 {
        self.total_supply.get_or_default()
    }

    pub fn get_total_pool(&self) -> U512 {
        self.total_cspr_pool.get_or_default()
    }

    pub fn get_available_liquidity(&self) -> U512 {
        self.available_liquidity.get_or_default()
    }

    pub fn get_pending_withdrawals(&self) -> U512 {
        self.pending_withdrawals.get_or_default()
    }

    pub fn is_validator_active(&self, validator: PublicKey) -> bool {
        self.validator_active.get(&validator).unwrap_or(false)
    }

    pub fn is_withdrawal_ready(&self, request_id: u64) -> bool {
        match self.withdrawal_requests.get(&request_id) {
            Some(request) => {
                !request.claimed &&
                self.env().get_block_time() >= request.request_block + UNBONDING_BLOCKS
            }
            None => false,
        }
    }

    pub fn get_withdrawal_amount(&self, request_id: u64) -> U512 {
        match self.withdrawal_requests.get(&request_id) {
            Some(request) => request.cspr_amount,
            None => U512::zero(),
        }
    }
}

// ============================================================================
// HELPERS
// ============================================================================

fn u512_to_u256(value: U512) -> U256 {
    let mut bytes = [0u8; 64];
    value.to_little_endian(&mut bytes);
    for i in 32..64 {
        if bytes[i] != 0 {
            return U256::MAX;
        }
    }
    U256::from_little_endian(&bytes[..32])
}

fn u256_to_u512(value: U256) -> U512 {
    let mut bytes = [0u8; 32];
    value.to_little_endian(&mut bytes);
    U512::from_little_endian(&bytes)
}
