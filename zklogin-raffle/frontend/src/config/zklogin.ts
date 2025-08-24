// zkLogin configuration and constants
export const ZKLOGIN_CONFIG = {
  // OAuth providers
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  FACEBOOK_CLIENT_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
  REDIRECT_URL: process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  
  // Sui network configuration
  FULLNODE_URL: process.env.NEXT_PUBLIC_SUI_NETWORK || 'https://fullnode.devnet.sui.io',
  
  // ZK proving service
  PROVER_URL: process.env.NEXT_PUBLIC_PROVER_URL || 'https://prover-dev.mystenlabs.com/v1',
  SALT_SERVICE_URL: process.env.NEXT_PUBLIC_SALT_SERVICE_URL || 'https://salt.api.mystenlabs.com/get_salt',
  
  // Contract addresses (to be updated after deployment)
  PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID || '',
  
  // Session configuration
  MAX_EPOCH_OFFSET: 2,
} as const;

// OAuth provider configurations
export const OAUTH_PROVIDERS = {
  google: {
    name: 'Google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: ZKLOGIN_CONFIG.GOOGLE_CLIENT_ID,
    scope: 'openid',
    responseType: 'id_token',
  },
  facebook: {
    name: 'Facebook',
    authUrl: 'https://www.facebook.com/v17.0/dialog/oauth',
    clientId: ZKLOGIN_CONFIG.FACEBOOK_CLIENT_ID,
    scope: 'openid',
    responseType: 'id_token',
  },
} as const;

export type OAuthProvider = keyof typeof OAUTH_PROVIDERS;
