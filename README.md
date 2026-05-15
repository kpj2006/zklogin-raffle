# 🎯 Gasless zkLogin Raffle dApp on Sui

A comprehensive Web3 raffle application built on the Sui blockchain featuring **gasless transactions**, **zkLogin authentication**, and **educational blockchain content**. Users can participate in raffles without holding SUI tokens, using OAuth providers like Google and Facebook for authentication.

## 🌟 Key Features

### 🔐 zkLogin Authentication
- **Zero-Knowledge OAuth**: Login with Google/Facebook without revealing personal data
- **Gasless Experience**: No need for users to hold SUI tokens
- **Sponsored Transactions**: All gas fees covered by the platform
- **Secure Identity**: Generate blockchain addresses from OAuth JWTs

### 🎲 Raffle System
- **Create Raffles**: Set entry fees, participant limits, and deadlines
- **Join Raffles**: Participate with sponsored transactions
- **Fair Selection**: Uses Sui's native randomness for winner selection
- **NFT Tickets**: Each participation generates a unique NFT ticket
- **Real-time Updates**: Live participant count and raffle status

### � Educational Content
- **Blockchain Facts**: 20+ educational facts about blockchain, Sui, and zkLogin
- **Interactive Learning**: Facts rotate every 10 seconds during interactions
- **Technology Insights**: Learn about zero-knowledge proofs, consensus mechanisms, and more

### 💰 Economic Features
- **Storage Rebates**: Participants receive storage fee rebates
- **Sponsorship Fund**: Pool for covering transaction costs
- **Admin Controls**: Comprehensive raffle management system

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+)
- **Sui CLI** installed and configured
- **WSL/Linux** (recommended for development)
- **OAuth Apps** configured (Google/Facebook)

### 1. Installation

```bash
# Clone and setup
git clone <repository-url>
cd zklogin-raffle

# Install dependencies
cd frontend
npm install

# Setup Move contract
cd ../move
sui move build
```

### 2. Environment Configuration

Create `frontend/.env.local`:

```bash
# Network Configuration
NEXT_PUBLIC_SUI_NETWORK=devnet
NEXT_PUBLIC_FULLNODE_URL=https://fullnode.devnet.sui.io:443

# Deployed Contract (Already deployed on devnet)
NEXT_PUBLIC_PACKAGE_ID=0x2aa8f8cc8d0313a6bb9315264bd9a2f39e38c82607990ea37d110c6710a0c06f
NEXT_PUBLIC_RAFFLE_REGISTRY=0x3ffcb406193fa707ccb250add6485d257b3d000877c7ed3bc64c3fdb0d4a2e9e
NEXT_PUBLIC_SPONSORSHIP_FUND=0x595d8746567a3b8c5cf93ba033c260f0e6237cfcf0ddc129c8da084d18224057

# OAuth Configuration (Replace with your credentials)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback

# zkLogin Configuration
NEXT_PUBLIC_ZK_PROVER_URL=https://prover-dev.mystenlabs.com/v1
NEXT_PUBLIC_MAX_EPOCH=100
```

### 3. OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/auth/callback`
6. Copy Client ID to environment variables

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:3000/auth/callback`
5. Copy App ID to environment variables

### 4. Run the Application

```bash
# Start development server
cd frontend
npm run dev

# Open browser
http://localhost:3000
```

## 🏗️ Architecture Overview

### Smart Contract (`move/sources/raffle_system.move`)
```move
// Core structures
public struct Raffle {
    id: UID,
    creator: address,
    entry_fee: u64,
    max_participants: u64,
    deadline: u64,
    participants: Table<address, ParticipantInfo>,
    winner: Option<address>,
    status: u8
}

// Key functions
public entry fun create_raffle(...)
public entry fun join_raffle_sponsored(...)
public entry fun settle_raffle(...)
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   ├── components/          # React components
│   ├── contexts/           # React contexts (zkLogin)
│   ├── services/           # API services
│   ├── config/             # Configuration files
│   └── lib/                # Utility libraries
```

### zkLogin Flow
```
1. User clicks "Login with Google/Facebook"
2. Generate ephemeral keypair + nonce
3. Redirect to OAuth provider
4. Receive JWT token
5. Generate ZK proof
6. Compute zkLogin address
7. Create session for sponsored transactions
```

## 🔧 Configuration Details

### Contract Addresses (Devnet)
- **Package**: `0x2aa8f8cc8d0313a6bb9315264bd9a2f39e38c82607990ea37d110c6710a0c06f`
- **Registry**: `0x3ffcb406193fa707ccb250add6485d257b3d000877c7ed3bc64c3fdb0d4a2e9e`
- **Sponsorship**: `0x595d8746567a3b8c5cf93ba033c260f0e6237cfcf0ddc129c8da084d18224057`

### Supported Networks
- **Devnet**: `https://fullnode.devnet.sui.io:443`
- **Testnet**: `https://fullnode.testnet.sui.io:443`
- **Mainnet**: `https://fullnode.mainnet.sui.io:443`

## 🎮 How to Use

### For Users
1. **Visit the dApp**: Navigate to the application URL
2. **Login**: Click "Login with Google" or "Login with Facebook"
3. **Browse Raffles**: View active raffles in the dashboard
4. **Join Raffle**: Click "Join Raffle" (gas-free!)
5. **Wait for Results**: Winners are selected automatically
6. **Claim Rewards**: Winners can claim their prizes

### For Raffle Creators
1. **Login**: Authenticate with OAuth provider
2. **Create Raffle**: Set entry fee, participant limit, deadline
3. **Fund Sponsorship**: Add funds to cover gas costs
4. **Manage Raffle**: Monitor participants and status
5. **Settle Raffle**: Trigger winner selection after deadline

## 🔍 Troubleshooting

### Common Issues

#### 1. OAuth Callback 404 Error ⚠️
**Problem**: `/devnet` endpoint returns 404 when clicking "Login with Google"
**Root Cause**: The OAuth callback URL is incorrectly configured
**Solution**: 
1. Check your OAuth provider settings:
   - Google: Redirect URI should be `http://localhost:3000/auth/callback`
   - Facebook: Valid OAuth Redirect URI should be `http://localhost:3000/auth/callback`
2. Verify environment variable: `NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback`
3. Make sure the callback route exists at `src/app/auth/callback/page.tsx`

#### 2. zkLogin Authentication Failed
**Problem**: Cannot generate ZK proof or authentication fails
**Solution**: 
- Check JWT token validity and expiration
- Verify epoch hasn't expired (check `NEXT_PUBLIC_MAX_EPOCH`)
- Ensure prover service URL is accessible: `https://prover-dev.mystenlabs.com/v1`
- Check browser console for detailed error messages

#### 3. Transaction Failed
**Problem**: Sponsored transaction fails or returns error
**Solution**:
- Verify sponsorship fund has sufficient balance
- Check contract addresses in `.env.local` match deployed contracts
- Ensure user has valid zkLogin session
- Check network connection to Sui devnet

#### 4. Build/Type Errors
**Problem**: TypeScript compilation fails or ESLint errors
**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Check all environment variables are properly set
- Verify import statements and type definitions
- Use `npm run type-check` for detailed type checking

### Debug Mode
Enable detailed logging:
```bash
export NODE_ENV=development
npm run dev
```

Check browser console and terminal for detailed error messages.

---



## User Flow

### 1. Authentication
1. User clicks "Login with Google/Facebook"
2. System generates ephemeral key pair and nonce
3. User completes OAuth flow
4. JWT is extracted and sent to proving service
5. Zero-knowledge proof is generated
6. zkLogin address is computed and user is logged in

### 2. Joining Raffle
1. User clicks "Join Raffle" button
2. System prepares sponsored transaction
3. Entry fee is paid, but gas is sponsored by the dApp
4. NFT ticket is minted and sent to user
5. User sees confirmation and updated raffle stats

### 3. Winner Selection
1. Raffle end time is reached
2. Owner calls `settle_raffle()` with Sui's randomness
3. Winner is selected and announced
4. Storage rebates are calculated and distributed
5. Cleanup process reclaims storage for efficiency

## Technology Stack

### Blockchain
- **Sui**: Layer 1 blockchain with parallel execution
- **Move**: Memory-safe smart contract language
- **zkLogin**: Native Sui primitive for OAuth-based wallets

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **@mysten/sui**: Official Sui SDK

### Services
- **Mysten ZK Proving Service**: Generates zero-knowledge proofs
- **Mysten Salt Service**: Provides user salts for address generation
- **OAuth Providers**: Google, Facebook, Apple for authentication

## Smart Contract Details

### Gas Sponsorship Model
```move
// Estimate gas and sponsor from fund
let estimated_gas = 1000000; // 0.001 SUI
let sponsored_gas = if (coin::value(&fund.balance) >= estimated_gas) {
    let sponsor_payment = coin::split(&mut fund.balance, estimated_gas, ctx);
    coin::destroy_zero(sponsor_payment);
    fund.total_sponsored = fund.total_sponsored + estimated_gas;
    estimated_gas
} else {
    0
};
```

### Storage Rebate Calculation
```move
// Calculate rebates based on storage reclaimed
let storage_rebate_per_participant = 100000; // 0.0001 SUI per participant
let total_rebate = raffle.current_participants * storage_rebate_per_participant;
```

### Randomness Implementation
```move
// Generate random winner using Sui's VRF
let mut generator = random::new_generator(random, ctx);
let winner_index = random::generate_u64_in_range(&mut generator, 0, raffle.current_participants);
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---

**Built with ❤️ for the Sui ecosystem**

