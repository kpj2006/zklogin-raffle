'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useZkLogin } from '@/contexts/ZkLoginContext';
import { zkLoginService } from '@/services/zklogin';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const router = useRouter();
  const { completeLogin } = useZkLogin();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract JWT from URL
        const jwt = zkLoginService.extractJwtFromUrl(window.location.href);
        
        if (!jwt) {
          throw new Error('No JWT token found in URL');
        }

        // Complete login process
        await completeLogin(jwt);
        
        setStatus('success');
        
        // Redirect to dashboard after success
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to login after error
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [completeLogin, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {status === 'processing' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authenticating...
            </h1>
            <p className="text-gray-600">
              Generating your zero-knowledge proof and setting up your wallet
            </p>
            <div className="mt-6 space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center space-x-2 text-sm text-gray-500"
              >
                <span>✅</span>
                <span>JWT token verified</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center space-x-2 text-sm text-gray-500"
              >
                <span>🔄</span>
                <span>Generating ZK proof...</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
                className="flex items-center justify-center space-x-2 text-sm text-gray-500"
              >
                <span>🔐</span>
                <span>Computing wallet address...</span>
              </motion.div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <span className="text-3xl">✅</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Successful!
            </h1>
            <p className="text-gray-600 mb-4">
              Your zkLogin wallet has been created securely
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
                🔒 Your identity is protected with zero-knowledge cryptography
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <span className="text-3xl">❌</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600 mb-4">
              We encountered an error while setting up your wallet
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">
                {error || 'Unknown error occurred'}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting back to login...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
