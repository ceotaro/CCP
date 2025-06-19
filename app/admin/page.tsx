'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  balance: number;
  createdAt: string;
  totalTransactions: number;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || session.user.role !== 'admin') return;

    setLoading(true);
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          amount: parseInt(amount),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Tokens minted successfully!');
        setUserId('');
        setAmount('');
        fetchUsers(); // Refresh user list
      } else {
        toast.error(data.error || 'Minting failed');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user.role !== 'admin') {
    router.push('/');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h1>
          <p className="text-gray-600">システム管理とトークン発行を行います</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Mint Tokens Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">トークン発行</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-purple-800 text-sm">
                💎 管理者として、ユーザーに新しいCivicCoinを発行できます
              </p>
            </div>
            <form onSubmit={handleMint} className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  ユーザーID
                </label>
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="ユーザーIDを入力"
                  required
                />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  発行量 (CC)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="発行する金額を入力"
                  min="1"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? '発行中...' : 'トークンを発行'}
              </button>
            </form>
          </div>

          {/* User Management Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">ユーザー管理</h2>
            {usersLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">ユーザー情報を読み込み中...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  総ユーザー数: {users.length}名
                </div>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {user.balance} CC
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.totalTransactions} txs
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'merchant'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          登録日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}