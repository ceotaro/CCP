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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white font-bold text-xl">CC</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">CivicCoin Platform</h1>
            <p className="text-gray-600 text-lg mb-8">
              地域デジタル通貨管理システム
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <button
              onClick={() => signIn()}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              🔐 サインイン
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>
            
            <button
              onClick={() => window.location.href = '/auth/signup'}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
            >
              ✨ 新規アカウント作成
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">🌟 CivicCoinの特徴</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• 地域経済活性化のためのデジタル通貨</li>
              <li>• 安全で高速な送金・決済システム</li>
              <li>• マーチャント向け決済QRコード機能</li>
              <li>• 透明性の高い取引履歴管理</li>
            </ul>
          </div>
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