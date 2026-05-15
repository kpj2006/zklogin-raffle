'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useZkLogin } from '@/contexts/ZkLoginContext';
import { getRandomFact, type BlockchainFact } from '@/data/blockchainFacts';
import { Trophy, Users, Clock, Coins, Zap, LogOut, RefreshCw } from 'lucide-react';

interface RaffleInfo {
  id: string;
  title: string;
  description: string;
  prizeAmount: number;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'active' | 'ended' | 'settled';
  endTime: number;
  winner?: string;
  gasSponsored: number;
  rebates: number;
}

interface LeaderboardEntry {
  playerName: string;
  playerId: string;
  wins: number;
  rebatesRecovered: number;
  gasSaved: number;
}

const mockRaffle: RaffleInfo = {
  id: '1',
  title: 'Sui Genesis NFT Raffle',
  description: 'Win an exclusive Sui Genesis NFT collection piece worth 100 SUI',
  prizeAmount: 100,
  entryFee: 1,
  maxParticipants: 50,
  currentParticipants: 23,
  status: 'active',
  endTime: Date.now() + 2 * 60 * 60 * 1000, // 2 hours from now
  gasSponsored: 0.023,
  rebates: 0.0045,
};

const mockLeaderboard: LeaderboardEntry[] = [
  { playerName: 'CryptoMaster', playerId: '0x1a2b...3c4d', wins: 12, rebatesRecovered: 0.045, gasSaved: 0.234 },
  { playerName: 'SuiBuilder', playerId: '0x5e6f...7g8h', wins: 8, rebatesRecovered: 0.032, gasSaved: 0.189 },
  { playerName: 'zkProof', playerId: '0x9i0j...1k2l', wins: 6, rebatesRecovered: 0.028, gasSaved: 0.156 },
  { playerName: 'RafflePro', playerId: '0x3m4n...5o6p', wins: 4, rebatesRecovered: 0.021, gasSaved: 0.098 },
  { playerName: 'LuckyWinner', playerId: '0x7q8r...9s0t', wins: 3, rebatesRecovered: 0.015, gasSaved: 0.067 },
];

export function RaffleDashboard() {
  const { session, logout } = useZkLogin();
  const [currentFact, setCurrentFact] = useState<BlockchainFact | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Rotate facts every 5 seconds
  useEffect(() => {
    const rotateFacts = () => {
      setCurrentFact(getRandomFact());
    };

    rotateFacts(); // Initial fact
    const interval = setInterval(rotateFacts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const timeRemaining = mockRaffle.endTime - now;
      
      if (timeRemaining <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleJoinRaffle = async () => {
    setIsJoining(true);
    
    try {
      // Simulate joining raffle (replace with actual transaction)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setHasJoined(true);
    } catch (error) {
      console.error('Failed to join raffle:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const formatSuiAmount = (amount: number) => {
    return `${amount.toFixed(4)} SUI`;
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">🎰</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">zkLogin Raffle</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="text-sm font-mono text-gray-900">
                  {shortenAddress(session?.userAddress || '')}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Raffle Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {mockRaffle.title}
                  </h2>
                  <p className="text-gray-600">{mockRaffle.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Ends in</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">{timeLeft}</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Prize Pool</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {formatSuiAmount(mockRaffle.prizeAmount)}
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="text-lg font-bold text-blue-600">
                    {mockRaffle.currentParticipants}/{mockRaffle.maxParticipants}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Coins className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Entry Fee</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatSuiAmount(mockRaffle.entryFee)}
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Gas Sponsored</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatSuiAmount(mockRaffle.gasSponsored)}
                  </p>
                </div>
              </div>

              {/* Join Button */}
              <div className="flex justify-center">
                {hasJoined ? (
                  <div className="flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium">
                    <span>✅</span>
                    <span>Successfully Joined!</span>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinRaffle}
                    disabled={isJoining}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    {isJoining ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Joining Raffle...</span>
                      </>
                    ) : (
                      <>
                        <span>🎫</span>
                        <span>Join Raffle (Gasless)</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Net Cost Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Net Cost Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Entry Fee</p>
                  <p className="text-xl font-bold text-red-600">
                    -{formatSuiAmount(mockRaffle.entryFee)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Gas Sponsored</p>
                  <p className="text-xl font-bold text-green-600">
                    +{formatSuiAmount(mockRaffle.gasSponsored)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Storage Rebate</p>
                  <p className="text-xl font-bold text-green-600">
                    +{formatSuiAmount(mockRaffle.rebates)}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4 mt-4 text-center">
                <p className="text-sm text-gray-600">Net Cost</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatSuiAmount(mockRaffle.entryFee - mockRaffle.gasSponsored - mockRaffle.rebates)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  You save {formatSuiAmount(mockRaffle.gasSponsored + mockRaffle.rebates)} in gas & rebates!
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Did You Know Facts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">🧠 Did You Know?</h3>
              <AnimatePresence mode="wait">
                {currentFact && (
                  <motion.div
                    key={currentFact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      currentFact.category === 'technology' ? 'bg-blue-100 text-blue-700' :
                      currentFact.category === 'history' ? 'bg-yellow-100 text-yellow-700' :
                      currentFact.category === 'economics' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {currentFact.category}
                    </div>
                    <h4 className="font-semibold text-gray-900">{currentFact.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{currentFact.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Leaderboard</h3>
              <div className="space-y-3">
                {mockLeaderboard.map((entry, index) => (
                  <div key={entry.playerId} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.playerName}</p>
                        <p className="text-xs text-gray-500 font-mono">{shortenAddress(entry.playerId)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{entry.wins} wins</p>
                      <p className="text-xs text-green-600">+{formatSuiAmount(entry.gasSaved)} saved</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
