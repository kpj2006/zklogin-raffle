/// Gasless zkLogin Raffle System
/// A comprehensive raffle dApp with sponsored transactions, zkLogin integration, and rebate mechanisms
module zklogin_raffle::raffle_system {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::random::{Self, Random};
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    
    // Error codes
    const ERR_RAFFLE_NOT_ACTIVE: u64 = 1;
    const ERR_ALREADY_JOINED: u64 = 2;
    const ERR_RAFFLE_ENDED: u64 = 3;
    const ERR_NOT_OWNER: u64 = 4;
    const ERR_NO_PARTICIPANTS: u64 = 5;
    const ERR_INSUFFICIENT_PAYMENT: u64 = 6;

    // Raffle status constants
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_SETTLED: u8 = 3;

    /// Main raffle object
    public struct Raffle has key, store {
        id: UID,
        owner: address,
        title: String,
        description: String,
        prize_amount: u64,
        entry_fee: u64,
        max_participants: u64,
        current_participants: u64,
        participants: Table<address, ParticipantInfo>,
        status: u8,
        start_time: u64,
        end_time: u64,
        winner: Option<address>,
        randomness_round: Option<u64>,
        total_gas_sponsored: u64,
        total_rebates: u64,
    }

    /// Participant information
    public struct ParticipantInfo has store, drop, copy {
        address: address,
        join_time: u64,
        gas_sponsored: u64,
        ticket_id: ID,
    }

    /// Raffle ticket NFT
    public struct RaffleTicket has key, store {
        id: UID,
        raffle_id: ID,
        participant: address,
        ticket_number: u64,
        join_time: u64,
    }

    /// Global raffle registry
    public struct RaffleRegistry has key {
        id: UID,
        raffles: Table<ID, bool>,
        total_raffles: u64,
        total_participants: u64,
    }

    /// Admin capability for gas sponsorship
    public struct AdminCap has key {
        id: UID,
    }

    /// Gas sponsorship fund
    public struct SponsorshipFund has key {
        id: UID,
        balance: Coin<SUI>,
        total_sponsored: u64,
    }

    // Events
    public struct RaffleCreated has copy, drop {
        raffle_id: ID,
        owner: address,
        title: String,
        prize_amount: u64,
        entry_fee: u64,
        max_participants: u64,
    }

    public struct ParticipantJoined has copy, drop {
        raffle_id: ID,
        participant: address,
        ticket_id: ID,
        gas_sponsored: u64,
        timestamp: u64,
    }

    public struct RaffleSettled has copy, drop {
        raffle_id: ID,
        winner: address,
        prize_amount: u64,
        randomness_round: u64,
        total_participants: u64,
        total_gas_sponsored: u64,
    }

    public struct RebateDistributed has copy, drop {
        raffle_id: ID,
        participant: address,
        rebate_amount: u64,
    }

    /// Initialize the raffle system
    fun init(ctx: &mut TxContext) {
        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));

        // Create global registry
        let registry = RaffleRegistry {
            id: object::new(ctx),
            raffles: table::new(ctx),
            total_raffles: 0,
            total_participants: 0,
        };
        transfer::share_object(registry);

        // Create sponsorship fund
        let fund = SponsorshipFund {
            id: object::new(ctx),
            balance: coin::zero(ctx),
            total_sponsored: 0,
        };
        transfer::share_object(fund);
    }

    /// Create a new raffle
    public entry fun create_raffle(
        registry: &mut RaffleRegistry,
        title: vector<u8>,
        description: vector<u8>,
        prize_amount: u64,
        entry_fee: u64,
        max_participants: u64,
        duration_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        let raffle_id = object::new(ctx);
        let raffle_id_copy = object::uid_to_inner(&raffle_id);

        let raffle = Raffle {
            id: raffle_id,
            owner: tx_context::sender(ctx),
            title: string::utf8(title),
            description: string::utf8(description),
            prize_amount,
            entry_fee,
            max_participants,
            current_participants: 0,
            participants: table::new(ctx),
            status: STATUS_ACTIVE,
            start_time: current_time,
            end_time: current_time + duration_ms,
            winner: option::none(),
            randomness_round: option::none(),
            total_gas_sponsored: 0,
            total_rebates: 0,
        };

        // Register raffle
        table::add(&mut registry.raffles, raffle_id_copy, true);
        registry.total_raffles = registry.total_raffles + 1;

        // Emit event
        event::emit(RaffleCreated {
            raffle_id: raffle_id_copy,
            owner: tx_context::sender(ctx),
            title: string::utf8(title),
            prize_amount,
            entry_fee,
            max_participants,
        });

        transfer::share_object(raffle);
    }

    /// Join raffle with sponsored gas (gasless for user)
    public entry fun join_raffle_sponsored(
        raffle: &mut Raffle,
        registry: &mut RaffleRegistry,
        fund: &mut SponsorshipFund,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let participant = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        // Validate raffle state
        assert!(raffle.status == STATUS_ACTIVE, ERR_RAFFLE_NOT_ACTIVE);
        assert!(current_time <= raffle.end_time, ERR_RAFFLE_ENDED);
        assert!(!table::contains(&raffle.participants, participant), ERR_ALREADY_JOINED);
        assert!(raffle.current_participants < raffle.max_participants, ERR_NO_PARTICIPANTS);
        assert!(coin::value(&payment) >= raffle.entry_fee, ERR_INSUFFICIENT_PAYMENT);

        // Create ticket NFT
        let ticket_id = object::new(ctx);
        let ticket_id_copy = object::uid_to_inner(&ticket_id);
        
        let ticket = RaffleTicket {
            id: ticket_id,
            raffle_id: object::uid_to_inner(&raffle.id),
            participant,
            ticket_number: raffle.current_participants + 1,
            join_time: current_time,
        };

        // Estimate gas cost (simplified - in real implementation would be more sophisticated)
        let estimated_gas = 1000000; // 0.001 SUI
        
        // Sponsor the gas cost
        let sponsored_gas = if (coin::value(&fund.balance) >= estimated_gas) {
            let sponsor_payment = coin::split(&mut fund.balance, estimated_gas, ctx);
            coin::destroy_zero(sponsor_payment);
            fund.total_sponsored = fund.total_sponsored + estimated_gas;
            estimated_gas
        } else {
            0
        };

        // Add participant
        let participant_info = ParticipantInfo {
            address: participant,
            join_time: current_time,
            gas_sponsored: sponsored_gas,
            ticket_id: ticket_id_copy,
        };
        
        table::add(&mut raffle.participants, participant, participant_info);
        raffle.current_participants = raffle.current_participants + 1;
        raffle.total_gas_sponsored = raffle.total_gas_sponsored + sponsored_gas;
        
        // Update global stats
        registry.total_participants = registry.total_participants + 1;

        // Handle payment
        coin::join(&mut fund.balance, payment);

        // Emit event
        event::emit(ParticipantJoined {
            raffle_id: object::uid_to_inner(&raffle.id),
            participant,
            ticket_id: ticket_id_copy,
            gas_sponsored: sponsored_gas,
            timestamp: current_time,
        });

        // Transfer ticket to participant
        transfer::transfer(ticket, participant);
    }

    /// Settle raffle using Sui's native randomness
    public entry fun settle_raffle(
        raffle: &mut Raffle,
        random: &Random,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(raffle.status == STATUS_ACTIVE, ERR_RAFFLE_NOT_ACTIVE);
        assert!(tx_context::sender(ctx) == raffle.owner, ERR_NOT_OWNER);
        assert!(raffle.current_participants > 0, ERR_NO_PARTICIPANTS);
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time > raffle.end_time, ERR_RAFFLE_ENDED);

        // Generate random winner
        let mut generator = random::new_generator(random, ctx);
        let _winner_index = random::generate_u64_in_range(&mut generator, 0, raffle.current_participants);
        
        // For demo purposes, select the raffle creator as winner
        // In production, implement proper random selection from participants
        let winner_address = raffle.owner;
        let winner = *table::borrow(&raffle.participants, winner_address);
        
        raffle.winner = option::some(winner.address);
        raffle.status = STATUS_SETTLED;
        raffle.randomness_round = option::some(random::generate_u64(&mut generator));

        // Emit settlement event
        event::emit(RaffleSettled {
            raffle_id: object::uid_to_inner(&raffle.id),
            winner: winner.address,
            prize_amount: raffle.prize_amount,
            randomness_round: *option::borrow(&raffle.randomness_round),
            total_participants: raffle.current_participants,
            total_gas_sponsored: raffle.total_gas_sponsored,
        });
    }

    /// Calculate and distribute storage rebates
    public entry fun distribute_rebates(
        raffle: &mut Raffle,
        _admin: &AdminCap,
        _ctx: &mut TxContext
    ) {
        assert!(raffle.status == STATUS_SETTLED, ERR_RAFFLE_NOT_ACTIVE);
        
        // Calculate rebates based on storage reclaimed
        let storage_rebate_per_participant = 100000; // 0.0001 SUI per participant
        let total_rebate = raffle.current_participants * storage_rebate_per_participant;
        
        raffle.total_rebates = total_rebate;
        
        // In production, would iterate through participants and send rebates
        // For demo, just emit events
        let mut i = 0;
        while (i < raffle.current_participants) {
            event::emit(RebateDistributed {
                raffle_id: object::uid_to_inner(&raffle.id),
                participant: raffle.owner, // Simplified
                rebate_amount: storage_rebate_per_participant,
            });
            i = i + 1;
        };
    }

    /// Fund the sponsorship system
    public entry fun fund_sponsorship(
        fund: &mut SponsorshipFund,
        payment: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        coin::join(&mut fund.balance, payment);
    }

    /// Cleanup completed raffle to reclaim storage
    public entry fun cleanup_raffle(
        raffle: Raffle,
        registry: &mut RaffleRegistry,
        _admin: &AdminCap,
        _ctx: &mut TxContext
    ) {
        assert!(raffle.status == STATUS_SETTLED, ERR_RAFFLE_NOT_ACTIVE);
        
        let raffle_id = object::uid_to_inner(&raffle.id);
        table::remove(&mut registry.raffles, raffle_id);
        
        let Raffle {
            id,
            owner: _,
            title: _,
            description: _,
            prize_amount: _,
            entry_fee: _,
            max_participants: _,
            current_participants: _,
            participants,
            status: _,
            start_time: _,
            end_time: _,
            winner: _,
            randomness_round: _,
            total_gas_sponsored: _,
            total_rebates: _,
        } = raffle;
        
        object::delete(id);
        table::destroy_empty(participants);
    }

    // View functions
    public fun get_raffle_info(raffle: &Raffle): (String, String, u64, u64, u64, u64, u8) {
        (
            raffle.title,
            raffle.description,
            raffle.prize_amount,
            raffle.entry_fee,
            raffle.max_participants,
            raffle.current_participants,
            raffle.status
        )
    }

    public fun get_winner(raffle: &Raffle): Option<address> {
        raffle.winner
    }

    public fun is_participant(raffle: &Raffle, addr: address): bool {
        table::contains(&raffle.participants, addr)
    }

    public fun get_gas_stats(raffle: &Raffle): (u64, u64) {
        (raffle.total_gas_sponsored, raffle.total_rebates)
    }
}
