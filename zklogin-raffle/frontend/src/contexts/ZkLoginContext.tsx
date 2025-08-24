'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { zkLoginService, type ZkLoginSession, type OAuthProvider } from '@/services/zklogin';

interface ZkLoginContextType {
  session: ZkLoginSession | null;
  isLoading: boolean;
  error: string | null;
  login: (provider: OAuthProvider) => Promise<void>;
  logout: () => void;
  completeLogin: (jwt: string) => Promise<void>;
}

const ZkLoginContext = createContext<ZkLoginContextType | undefined>(undefined);

interface ZkLoginProviderProps {
  children: ReactNode;
}

export function ZkLoginProvider({ children }: ZkLoginProviderProps) {
  const [session, setSession] = useState<ZkLoginSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAuth, setPendingAuth] = useState<{
    provider: OAuthProvider;
    ephemeralKeyPair: Ed25519Keypair;
    randomness: string;
    maxEpoch: number;
  } | null>(null);

  // Load session from storage on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('zklogin-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        sessionStorage.removeItem('zklogin-session');
      }
    }
  }, []);

  // Save session to storage when it changes
  useEffect(() => {
    if (session) {
      sessionStorage.setItem('zklogin-session', JSON.stringify(session));
    } else {
      sessionStorage.removeItem('zklogin-session');
    }
  }, [session]);

  const login = async (provider: OAuthProvider) => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate ephemeral key pair and nonce
      const { ephemeralKeyPair, randomness, maxEpoch, nonce } = 
        await zkLoginService.generateEphemeralKeyPair();

      // Store pending auth state
      setPendingAuth({
        provider,
        ephemeralKeyPair,
        randomness,
        maxEpoch,
      });

      // Generate OAuth URL and redirect
      const oauthUrl = zkLoginService.generateOAuthUrl(provider, nonce);
      window.location.href = oauthUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const completeLogin = async (jwt: string) => {
    if (!pendingAuth) {
      throw new Error('No pending authentication');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Complete zkLogin flow
      const session = await zkLoginService.completeZkLoginFlow(
        pendingAuth.provider,
        pendingAuth.ephemeralKeyPair,
        pendingAuth.randomness,
        pendingAuth.maxEpoch,
        jwt
      );

      setSession(session);
      setPendingAuth(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login completion failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    setPendingAuth(null);
    setError(null);
    sessionStorage.removeItem('zklogin-session');
  };

  return (
    <ZkLoginContext.Provider
      value={{
        session,
        isLoading,
        error,
        login,
        logout,
        completeLogin,
      }}
    >
      {children}
    </ZkLoginContext.Provider>
  );
}

export function useZkLogin() {
  const context = useContext(ZkLoginContext);
  if (context === undefined) {
    throw new Error('useZkLogin must be used within a ZkLoginProvider');
  }
  return context;
}
