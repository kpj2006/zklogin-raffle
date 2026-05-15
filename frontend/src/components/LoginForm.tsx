'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useZkLogin } from '@/contexts/ZkLoginContext';
import { OAUTH_PROVIDERS, type OAuthProvider } from '@/config/zklogin';

export function LoginForm() {
  const { login, isLoading, error } = useZkLogin();
  const [selectedProvider, setSelectedProvider] = useState<OAuthProvider | null>(null);

  const handleLogin = async (provider: OAuthProvider) => {
    setSelectedProvider(provider);
    await login(provider);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <span className="text-white text-2xl font-bold">🎰</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            zkLogin Raffle
          </h1>
          <p className="text-gray-600">
            Win prizes with gasless transactions and zero-knowledge privacy
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 text-center">
            Sign in with
          </h2>
          
          {Object.entries(OAUTH_PROVIDERS).map(([key, provider]) => {
            const providerKey = key as OAuthProvider;
            const isSelected = selectedProvider === providerKey;
            const isDisabled = isLoading && !isSelected;
            
            return (
              <motion.button
                key={key}
                whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                onClick={() => handleLogin(providerKey)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-lg border font-medium transition-all
                  ${isSelected && isLoading
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : isDisabled
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }
                `}
              >
                {key === 'google' && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {key === 'facebook' && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                )}
                <span>
                  {isSelected && isLoading ? 'Connecting...' : `Continue with ${provider.name}`}
                </span>
                {isSelected && isLoading && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>🔒</span>
            <span>Powered by Sui zkLogin</span>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Your privacy is protected with zero-knowledge proofs
          </p>
        </div>
      </motion.div>
    </div>
  );
}
