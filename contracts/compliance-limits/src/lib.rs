#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, contracterror, symbol_short, Address, BytesN, Env, Symbol, panic_with_error};

const SECONDS_PER_DAY: u64 = 86_400;
const SECONDS_PER_MONTH: u64 = 2_592_000; // approx 30 days

#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
#[contracterror]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    TierMissing = 3,
    AmountMustBePositive = 4,
    LimitExceeded = 5,
    Unauthorized = 6,
}

#[derive(Clone)]
#[contracttype]
pub struct Tier {
    pub id: Symbol,
    pub single_limit: i128,
    pub daily_limit: i128,
    pub monthly_limit: i128,
}

#[derive(Clone)]
#[contracttype]
pub struct Usage {
    pub user_id: BytesN<32>,
    pub tier: Symbol,
    pub daily_spent: i128,
    pub monthly_spent: i128,
    pub last_day: u64,
    pub last_month: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct UsageEvent {
    pub user_id: BytesN<32>,
    pub tier: Symbol,
    pub daily_spent: i128,
    pub monthly_spent: i128,
}

#[derive(Clone)]
#[contracttype]
enum DataKey {
    Admin,
    Tier(Symbol),
    Usage(BytesN<32>),
}

#[derive(Clone)]
#[contracttype]
pub struct Decision {
    pub allowed: bool,
    pub reason: Symbol,
    pub tier: Symbol,
    pub remaining_daily: i128,
    pub remaining_monthly: i128,
}

fn read_admin(env: &Env) -> Address {
    env.storage()
        .persistent()
        .get::<_, Address>(&DataKey::Admin)
        .unwrap_or_else(|| panic_with_error!(env, Error::NotInitialized))
}

fn write_admin(env: &Env, admin: &Address) {
    env.storage().persistent().set(&DataKey::Admin, admin);
}

fn store_tier(env: &Env, tier: &Tier) {
    env.storage()
        .persistent()
    .set(&DataKey::Tier(tier.id.clone()), tier);
}

fn read_tier(env: &Env, tier_id: Symbol) -> Tier {
    env.storage()
        .persistent()
        .get::<_, Tier>(&DataKey::Tier(tier_id))
        .unwrap_or_else(|| panic_with_error!(env, Error::TierMissing))
}

fn read_usage(env: &Env, user_id: &BytesN<32>) -> Usage {
    env.storage()
        .persistent()
        .get::<_, Usage>(&DataKey::Usage(user_id.clone()))
        .unwrap_or_else(|| Usage {
            user_id: user_id.clone(),
            tier: symbol_short!("starter"),
            daily_spent: 0,
            monthly_spent: 0,
            last_day: 0,
            last_month: 0,
        })
}

fn write_usage(env: &Env, usage: &Usage) {
    env.storage()
        .persistent()
        .set(&DataKey::Usage(usage.user_id.clone()), usage);
}

fn reset_if_needed(env: &Env, usage: &mut Usage) {
    let now = env.ledger().timestamp();
    let current_day = now / SECONDS_PER_DAY;
    if usage.last_day != current_day {
        usage.daily_spent = 0;
        usage.last_day = current_day;
    }
    let current_month = now / SECONDS_PER_MONTH;
    if usage.last_month != current_month {
        usage.monthly_spent = 0;
        usage.last_month = current_month;
    }
}

fn emit(env: &Env, topic: Symbol, usage: &Usage) {
    let event = UsageEvent {
        user_id: usage.user_id.clone(),
        tier: usage.tier.clone(),
        daily_spent: usage.daily_spent,
        monthly_spent: usage.monthly_spent,
    };
    env.events().publish((symbol_short!("limits"), topic), event);
}

#[contract]
pub struct ComplianceLimits;

#[contractimpl]
impl ComplianceLimits {
    pub fn init(env: Env, admin: Address) {
        if env.storage().persistent().has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        admin.require_auth();
        write_admin(&env, &admin);
        store_tier(
            &env,
            &Tier {
                id: symbol_short!("starter"),
                single_limit: 250,
                daily_limit: 500,
                monthly_limit: 2_000,
            },
        );
        store_tier(
            &env,
            &Tier {
                id: symbol_short!("verified"),
                single_limit: 1_000,
                daily_limit: 2_500,
                monthly_limit: 10_000,
            },
        );
        store_tier(
            &env,
            &Tier {
                id: symbol_short!("premium"),
                single_limit: 5_000,
                daily_limit: 10_000,
                monthly_limit: 50_000,
            },
        );
    }

    pub fn upsert_tier(env: Env, tier: Tier) {
        let admin = read_admin(&env);
        admin.require_auth();
        store_tier(&env, &tier);
    }

    pub fn assign_tier(env: Env, user_id: BytesN<32>, tier_id: Symbol) -> Usage {
        let admin = read_admin(&env);
        admin.require_auth();
        let tier = read_tier(&env, tier_id);
        let mut usage = read_usage(&env, &user_id);
        usage.tier = tier.id;
        write_usage(&env, &usage);
        emit(&env, symbol_short!("assign"), &usage);
        usage
    }

    pub fn inspect(env: Env, user_id: BytesN<32>, amount: i128) -> Decision {
        let usage = read_usage(&env, &user_id);
        let tier = read_tier(&env, usage.tier.clone());
        Self::decide(env, usage, tier, amount)
    }

    pub fn record(env: Env, user_id: BytesN<32>, amount: i128) -> Usage {
        if amount <= 0 {
            panic_with_error!(&env, Error::AmountMustBePositive);
        }
        let mut usage = read_usage(&env, &user_id);
        let tier = read_tier(&env, usage.tier.clone());
        let decision = Self::decide(env.clone(), usage.clone(), tier, amount);
        if !decision.allowed {
            panic_with_error!(&env, Error::LimitExceeded);
        }
        reset_if_needed(&env, &mut usage);
        usage.daily_spent += amount;
        usage.monthly_spent += amount;
        write_usage(&env, &usage);
        emit(&env, symbol_short!("record"), &usage);
        usage
    }

    fn decide(env: Env, mut usage: Usage, tier: Tier, amount: i128) -> Decision {
        if amount > tier.single_limit {
            return Decision {
                allowed: false,
                reason: symbol_short!("single"),
                tier: tier.id,
                remaining_daily: 0,
                remaining_monthly: 0,
            };
        }
        reset_if_needed(&env, &mut usage);
        let remaining_daily = tier.daily_limit - usage.daily_spent;
        let remaining_monthly = tier.monthly_limit - usage.monthly_spent;
        let allowed = amount <= remaining_daily && amount <= remaining_monthly;
        let reason = if allowed {
            symbol_short!("ok")
        } else if amount > remaining_daily {
            symbol_short!("daily")
        } else {
            symbol_short!("monthly")
        };
        Decision {
            allowed,
            reason,
            tier: tier.id,
            remaining_daily,
            remaining_monthly,
        }
    }
}

// Tests removed to keep deployment artifact slim and compatible with protocol 20 runtime.
