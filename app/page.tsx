'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { WalletCard } from '@/components/WalletCard';
import { TransactionList } from '@/components/TransactionList';
import { QRDisplay } from '@/components/QRDisplay';
import { toast } from 'react-toastify';

export default function Home() {
  const { data: session, status } = useSession();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user.id) {
      fetchUserData();
      fetchTransactions();
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async () => {
    try {
      // For now, we'll use a placeholder API call
      // In production, this would fetch the user's current balance
      setBalance(1000); // Placeholder balance
      setLoading(false);
    } catch {
      toast.error('Failed to fetch user data');
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!session?.user.id) return;

    try {
      const res = await fetch(`/api/tx/${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
      }
    } catch {
      toast.error('Failed to fetch transactions');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8">CivicCoin Platform</h1>
          <p className="text-gray-600 text-center mb-8">
            Regional Digital Currency Management System
          </p>
          <button
            onClick={() => signIn()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CivicCoin</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{session.user.name}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <WalletCard balance={balance} />
            <div className="flex space-x-4">
              <button
                onClick={() => (window.location.href = '/transfer')}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Money
              </button>
              <button
                onClick={() => (window.location.href = '/receive')}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Receive
              </button>
            </div>
            {session.user.role === 'admin' && (
              <button
                onClick={() => (window.location.href = '/admin')}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Admin Dashboard
              </button>
            )}
          </div>
          <div className="space-y-8">
            <QRDisplay
              value={`civiccoin:${session.user.id}`}
              title="Your Receive QR Code"
            />
            <TransactionList transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}