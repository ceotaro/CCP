'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { WalletCard } from '@/components/WalletCard';
import { TransactionList } from '@/components/TransactionList';
import { QRDisplay } from '@/components/QRDisplay';
import { Layout } from '@/components/Layout';
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
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async () => {
    if (!session?.user.id) return;
    
    try {
      const res = await fetch(`/api/wallet/${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.user.balance);
      } else {
        toast.error('Failed to fetch wallet data');
      }
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (loading && session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading user data...</div>
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
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
          <p className="text-gray-600">CivicCoinウォレットへようこそ</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Wallet Section */}
          <div className="lg:col-span-2 space-y-6">
            <WalletCard balance={balance} />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => (window.location.href = '/transfer')}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-4 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>📤</span>
                  <span>送金</span>
                </button>
                <button
                  onClick={() => (window.location.href = '/receive')}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span>📥</span>
                  <span>受取</span>
                </button>
              </div>
              
              {(session.user.role === 'merchant' || session.user.role === 'admin') && (
                <button
                  onClick={() => (window.location.href = '/merchant')}
                  className="w-full mt-4 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🏪</span>
                  <span>マーチャントダッシュボード</span>
                </button>
              )}
              
              {session.user.role === 'admin' && (
                <button
                  onClick={() => (window.location.href = '/admin')}
                  className="w-full mt-4 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>⚙️</span>
                  <span>管理者ダッシュボード</span>
                </button>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">取引履歴</h2>
              <TransactionList transactions={transactions} />
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <QRDisplay
                value={`civiccoin:${session.user.id}`}
                title="受取用QRコード"
              />
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">あなたのID:</p>
                <p className="text-sm font-mono text-gray-900 break-all">{session.user.id}</p>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アカウント情報</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600">名前</p>
                  <p className="font-medium text-gray-900">{session.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">メールアドレス</p>
                  <p className="font-medium text-gray-900">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">ロール</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    session.user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : session.user.role === 'merchant'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}