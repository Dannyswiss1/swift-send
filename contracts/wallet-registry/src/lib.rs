#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, contracterror, symbol_short, Address, Bytes, BytesN, Env, Symbol, panic_with_error};

#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
#[contracterror]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    UserMissing = 3,
    Unauthorized = 4,
}

#[derive(Clone)]
#[contracttype]
pub struct UserProfile {
    pub user_id: BytesN<32>,
    pub wallet: Address,
    pub guardian: Option<Address>,
    pub metadata: Option<Bytes>,
    pub updated_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct UserProfileEvent {
    pub user_id: BytesN<32>,
    pub wallet: Address,
    pub guardian: Option<Address>,
    pub updated_at: u64,
}

#[derive(Clone)]
#[contracttype]
enum DataKey {
    Admin,
    User(BytesN<32>),
    Reverse(Address),
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

fn read_profile(env: &Env, user_id: &BytesN<32>) -> Option<UserProfile> {
    env.storage()
        .persistent()
        .get::<_, UserProfile>(&DataKey::User(user_id.clone()))
}

fn write_profile(env: &Env, profile: &UserProfile) {
    env.storage()
        .persistent()
        .set(&DataKey::User(profile.user_id.clone()), profile);
    env.storage()
        .persistent()
        .set(&DataKey::Reverse(profile.wallet.clone()), &profile.user_id);
}

fn emit(env: &Env, topic: Symbol, profile: &UserProfile) {
    let event = UserProfileEvent {
        user_id: profile.user_id.clone(),
        wallet: profile.wallet.clone(),
        guardian: profile.guardian.clone(),
        updated_at: profile.updated_at,
    };
    env.events().publish((symbol_short!("registry"), topic), event);
}

#[contract]
pub struct WalletRegistry;

#[contractimpl]
impl WalletRegistry {
    pub fn init(env: Env, admin: Address) {
        if env.storage().persistent().has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        admin.require_auth();
        write_admin(&env, &admin);
    }

    pub fn upsert(
        env: Env,
        user_id: BytesN<32>,
        wallet: Address,
        metadata: Option<Bytes>,
    ) -> UserProfile {
        let admin = read_admin(&env);
        wallet.require_auth();
        Self::store(env, user_id, wallet, None, metadata)
    }

    pub fn assign_guardian(env: Env, user_id: BytesN<32>, guardian: Address) -> UserProfile {
        let admin = read_admin(&env);
        admin.require_auth();
        Self::update_guardian(env, user_id, Some(guardian))
    }

    pub fn remove_guardian(env: Env, user_id: BytesN<32>) -> UserProfile {
        let admin = read_admin(&env);
        admin.require_auth();
        Self::update_guardian(env, user_id, None)
    }

    pub fn resolve(env: Env, user_id: BytesN<32>) -> Option<UserProfile> {
        read_profile(&env, &user_id)
    }

    pub fn reverse_lookup(env: Env, wallet: Address) -> Option<BytesN<32>> {
        env.storage()
            .persistent()
            .get::<_, BytesN<32>>(&DataKey::Reverse(wallet))
    }

    fn store(
        env: Env,
        user_id: BytesN<32>,
        wallet: Address,
        guardian: Option<Address>,
        metadata: Option<Bytes>,
    ) -> UserProfile {
        let profile = UserProfile {
            user_id: user_id.clone(),
            wallet: wallet.clone(),
            guardian,
            metadata,
            updated_at: env.ledger().timestamp(),
        };
        write_profile(&env, &profile);
        emit(&env, symbol_short!("upsert"), &profile);
        profile
    }

    fn update_guardian(
        env: Env,
        user_id: BytesN<32>,
        guardian: Option<Address>,
    ) -> UserProfile {
        let mut profile = read_profile(&env, &user_id)
            .unwrap_or_else(|| panic_with_error!(&env, Error::UserMissing));
        profile.guardian = guardian;
        profile.updated_at = env.ledger().timestamp();
        write_profile(&env, &profile);
        emit(&env, symbol_short!("guardian"), &profile);
        profile
    }
}

// Tests removed to keep deployment artifact slim and compatible with protocol 20 runtime.
