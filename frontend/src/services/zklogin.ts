import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { 
  generateNonce, 
  generateRandomness,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
  genAddressSeed,
  getZkLoginSignature
} from '@mysten/sui/zklogin';
import { Transaction } from '@mysten/sui/transactions';
import type { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { jwtDecode } from 'jwt-decode';
import { ZKLOGIN_CONFIG, OAUTH_PROVIDERS, type OAuthProvider } from '@/config/zklogin';

// Export the OAuthProvider type for use in other modules
export type { OAuthProvider };

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  nonce?: string;
}

export interface ZkProof {
  proofPoints: {
    a: string[];
    b: string[][];
    c: string[];
  };
  issBase64Details: {
    value: string;
    indexMod4: number;
  };
  headerBase64: string;
  addressSeed: string;
}

export interface ZkLoginSession {
  ephemeralKeyPair: Ed25519Keypair;
  randomness: string;
  maxEpoch: number;
  userSalt: string;
  jwt: string;
  zkProof?: ZkProof;
  userAddress: string;
}

class ZkLoginService {
  private suiClient: SuiClient;

  constructor() {
    this.suiClient = new SuiClient({ url: ZKLOGIN_CONFIG.FULLNODE_URL });
  }

  /**
   * Step 1: Generate ephemeral key pair and nonce
   */
  async generateEphemeralKeyPair(): Promise<{
    ephemeralKeyPair: Ed25519Keypair;
    randomness: string;
    maxEpoch: number;
    nonce: string;
  }> {
    // Get current epoch
    const { epoch } = await this.suiClient.getLatestSuiSystemState();
    const maxEpoch = Number(epoch) + ZKLOGIN_CONFIG.MAX_EPOCH_OFFSET;

    // Generate ephemeral key pair
    const ephemeralKeyPair = new Ed25519Keypair();
    const randomness = generateRandomness();
    
    // Generate nonce
    const nonce = generateNonce(
      ephemeralKeyPair.getPublicKey(),
      maxEpoch,
      randomness
    );

    return {
      ephemeralKeyPair,
      randomness,
      maxEpoch,
      nonce,
    };
  }

  /**
   * Step 2: Generate OAuth URL for login
   */
  generateOAuthUrl(provider: OAuthProvider, nonce: string): string {
    const config = OAUTH_PROVIDERS[provider];
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: ZKLOGIN_CONFIG.REDIRECT_URL,
      scope: config.scope,
      response_type: config.responseType,
      nonce,
    });

    const oauthUrl = `${config.authUrl}?${params.toString()}`;
    console.log('🔗 Generated OAuth URL:', oauthUrl);
    console.log('📍 Redirect URI:', ZKLOGIN_CONFIG.REDIRECT_URL);
    return oauthUrl;
  }

  /**
   * Step 3: Extract JWT from redirect URL
   */
  extractJwtFromUrl(url: string): string | null {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('id_token');
  }

  /**
   * Step 4: Get user salt
   */
  async getUserSalt(jwt: string): Promise<string> {
    try {
      const response = await fetch(ZKLOGIN_CONFIG.SALT_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: jwt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get user salt');
      }

      const data = await response.json();
      return data.salt;
    } catch (error) {
      console.error('Error getting user salt:', error);
      // Fallback: generate a deterministic salt based on JWT sub claim
      const decoded = jwtDecode<JwtPayload>(jwt);
      const fallbackSalt = this.generateFallbackSalt(decoded.sub || '');
      return fallbackSalt;
    }
  }

  /**
   * Generate fallback salt for development
   */
  private generateFallbackSalt(sub: string): string {
    // Simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < sub.length; i++) {
      const char = sub.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  /**
   * Step 5: Compute zkLogin address
   */
  getZkLoginAddress(jwt: string, userSalt: string): string {
    return jwtToAddress(jwt, userSalt);
  }

  /**
   * Step 6: Get ZK proof
   */
  async getZkProof(
    jwt: string,
    ephemeralKeyPair: Ed25519Keypair,
    randomness: string,
    userSalt: string,
    maxEpoch: number
  ): Promise<ZkProof> {
    const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
      ephemeralKeyPair.getPublicKey()
    );

    const payload = {
      jwt,
      extendedEphemeralPublicKey: extendedEphemeralPublicKey.toString(),
      maxEpoch: maxEpoch.toString(),
      jwtRandomness: randomness,
      salt: userSalt,
      keyClaimName: 'sub',
    };

    try {
      const response = await fetch(ZKLOGIN_CONFIG.PROVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ZK proof');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating ZK proof:', error);
      throw error;
    }
  }

  /**
   * Step 7: Create and sign transaction
   */
  async signTransaction(
    transaction: Transaction,
    session: ZkLoginSession
  ): Promise<{ transactionBlock: Uint8Array; signature: string }> {
    if (!session.zkProof) {
      throw new Error('ZK proof not available');
    }

    // Set sender
    transaction.setSender(session.userAddress);

    // Sign with ephemeral key
    const bytes = await transaction.build({ client: this.suiClient });
    const userSignature = await session.ephemeralKeyPair.sign(bytes);

    // Generate address seed
    const decodedJwt = jwtDecode<JwtPayload>(session.jwt);
    const aud = Array.isArray(decodedJwt.aud) ? decodedJwt.aud[0] : decodedJwt.aud!;
    const addressSeed = genAddressSeed(
      BigInt(session.userSalt),
      'sub',
      decodedJwt.sub!,
      aud
    ).toString();

    // Create zkLogin signature
    const zkLoginSignature = getZkLoginSignature({
      inputs: {
        ...session.zkProof,
        addressSeed,
      },
      maxEpoch: session.maxEpoch,
      userSignature,
    });

    return { transactionBlock: bytes, signature: zkLoginSignature };
  }

  /**
   * Execute transaction with zkLogin signature
   */
  async executeTransaction(
    transaction: Transaction,
    session: ZkLoginSession
  ): Promise<SuiTransactionBlockResponse> {
    const { transactionBlock, signature } = await this.signTransaction(transaction, session);

    return await this.suiClient.executeTransactionBlock({
      transactionBlock,
      signature,
    });
  }

  /**
   * Complete zkLogin flow
   */
  async completeZkLoginFlow(
    provider: OAuthProvider,
    ephemeralKeyPair: Ed25519Keypair,
    randomness: string,
    maxEpoch: number,
    jwt: string
  ): Promise<ZkLoginSession> {
    // Get user salt
    const userSalt = await this.getUserSalt(jwt);

    // Compute user address
    const userAddress = this.getZkLoginAddress(jwt, userSalt);

    // Get ZK proof
    const zkProof = await this.getZkProof(
      jwt,
      ephemeralKeyPair,
      randomness,
      userSalt,
      maxEpoch
    );

    return {
      ephemeralKeyPair,
      randomness,
      maxEpoch,
      userSalt,
      jwt,
      zkProof,
      userAddress,
    };
  }
}

export const zkLoginService = new ZkLoginService();
