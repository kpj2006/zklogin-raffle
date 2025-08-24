'use client';

import { ZkLoginProvider, useZkLogin } from '@/contexts/ZkLoginContext';
import { LoginForm } from '@/components/LoginForm';
import { RaffleDashboard } from '@/components/RaffleDashboard';

function HomePage() {
  const { session, isLoading } = useZkLogin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading zkLogin Raffle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {session ? <RaffleDashboard /> : <LoginForm />}
    </div>
  );
}

export default function App() {
  return (
    <ZkLoginProvider>
      <HomePage />
    </ZkLoginProvider>
  );
}
