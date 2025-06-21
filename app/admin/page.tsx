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

interface Analytics {
  overview: {
    totalUsers: number;
    totalTransactions: number;
    totalCirculation: number;
    todayTransactions: number;
    weeklyTransactions: number;
  };
  usersByRole: Record<string, number>;
  dailyTransactions: Array<{ date: string; transactions: number }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: string;
    createdAt: string;
    sender: { name: string; email: string };
    receiver: { name: string; email: string };
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    balance: number;
  }>;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State for different tabs/sections
  const [activeTab, setActiveTab] = useState<'overview' | 'mint' | 'burn' | 'users' | 'transactions'>('overview');
  
  // Mint form state
  const [mintForm, setMintForm] = useState({ userId: '', amount: '' });
  const [mintLoading, setMintLoading] = useState(false);
  
  // Burn form state
  const [burnForm, setBurnForm] = useState({ userId: '', amount: '', reason: '' });
  const [burnLoading, setBurnLoading] = useState(false);
  
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/analytics'),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch {
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || session.user.role !== 'admin') return;

    setMintLoading(true);
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: mintForm.userId,
          amount: parseInt(mintForm.amount),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('トークンを発行しました！');
        setMintForm({ userId: '', amount: '' });
        fetchData(); // Refresh data
      } else {
        toast.error(data.error || '発行に失敗しました');
      }
    } catch {
      toast.error('エラーが発生しました');
    } finally {
      setMintLoading(false);
    }
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || session.user.role !== 'admin') return;

    setBurnLoading(true);
    try {
      const res = await fetch('/api/admin/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: burnForm.userId,
          amount: parseInt(burnForm.amount),
          reason: burnForm.reason,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('トークンを焼却しました！');
        setBurnForm({ userId: '', amount: '', reason: '' });
        fetchData(); // Refresh data
      } else {
        toast.error(data.error || '焼却に失敗しました');
      }
    } catch {
      toast.error('エラーが発生しました');
    } finally {
      setBurnLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        toast.success('ユーザーロールを更新しました');
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'ロール更新に失敗しました');
      }
    } catch {
      toast.error('エラーが発生しました');
    }
  };

  if (!session || session.user.role !== 'admin') {
    router.push('/');
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-lg">管理者データを読み込み中...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h1>
          <p className="text-gray-600">地域通貨CivicCoinの発行・管理システム</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', name: '📊 概要', desc: 'システム統計' },
              { id: 'mint', name: '💎 発行', desc: 'トークン発行' },
              { id: 'burn', name: '🔥 焼却', desc: 'トークン焼却' },
              { id: 'users', name: '👥 ユーザー', desc: 'ユーザー管理' },
              { id: 'transactions', name: '📈 取引', desc: '取引履歴' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>{tab.name}</div>
                <div className="text-xs text-gray-400">{tab.desc}</div>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalUsers.toLocaleString()}</div>
                <div className="text-gray-600">総ユーザー数</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                <div className="text-2xl font-bold text-green-600">{analytics.overview.totalCirculation.toLocaleString()} CC</div>
                <div className="text-gray-600">総発行量</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                <div className="text-2xl font-bold text-yellow-600">{analytics.overview.totalTransactions.toLocaleString()}</div>
                <div className="text-gray-600">総取引数</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                <div className="text-2xl font-bold text-purple-600">{analytics.overview.todayTransactions.toLocaleString()}</div>
                <div className="text-gray-600">今日の取引</div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ユーザー分布</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        role === 'merchant' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {role}
                      </span>
                      <span className="font-semibold">{count}名</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">残高上位ユーザー</h3>
                <div className="space-y-3">
                  {analytics.topUsers.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm">{user.name}</span>
                      </div>
                      <span className="font-semibold text-green-600">{user.balance} CC</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の取引</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイプ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">送信者</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">受信者</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.recentTransactions.slice(0, 10).map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            tx.type === 'issue' ? 'bg-green-100 text-green-800' :
                            tx.type === 'burn' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.type === 'issue' ? '発行' : tx.type === 'burn' ? '焼却' : '送金'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.sender.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.receiver.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.amount} CC</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleString('ja-JP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Mint Tab */}
        {activeTab === 'mint' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">トークン発行</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  💎 新しいCivicCoinをユーザーに発行します
                </p>
              </div>
              <form onSubmit={handleMint} className="space-y-4">
                <div>
                  <label htmlFor="mintUserId" className="block text-sm font-medium text-gray-700 mb-1">
                    ユーザーID
                  </label>
                  <input
                    type="text"
                    id="mintUserId"
                    value={mintForm.userId}
                    onChange={(e) => setMintForm({ ...mintForm, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="ユーザーIDを入力"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="mintAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    発行量 (CC)
                  </label>
                  <input
                    type="number"
                    id="mintAmount"
                    value={mintForm.amount}
                    onChange={(e) => setMintForm({ ...mintForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="発行する金額を入力"
                    min="1"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={mintLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {mintLoading ? '発行中...' : 'トークンを発行'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Burn Tab */}
        {activeTab === 'burn' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">トークン焼却</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  🔥 ユーザーのCivicCoinを焼却（削除）します
                </p>
              </div>
              <form onSubmit={handleBurn} className="space-y-4">
                <div>
                  <label htmlFor="burnUserId" className="block text-sm font-medium text-gray-700 mb-1">
                    ユーザーID
                  </label>
                  <input
                    type="text"
                    id="burnUserId"
                    value={burnForm.userId}
                    onChange={(e) => setBurnForm({ ...burnForm, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="ユーザーIDを入力"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="burnAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    焼却量 (CC)
                  </label>
                  <input
                    type="number"
                    id="burnAmount"
                    value={burnForm.amount}
                    onChange={(e) => setBurnForm({ ...burnForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="焼却する金額を入力"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="burnReason" className="block text-sm font-medium text-gray-700 mb-1">
                    理由（任意）
                  </label>
                  <textarea
                    id="burnReason"
                    value={burnForm.reason}
                    onChange={(e) => setBurnForm({ ...burnForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="焼却の理由を入力"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={burnLoading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  {burnLoading ? '焼却中...' : 'トークンを焼却'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">ユーザー管理</h2>
            <div className="text-sm text-gray-600 mb-4">
              総ユーザー数: {users.length}名
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ロール</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">残高</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取引数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className={`px-2 py-1 text-xs rounded-full border-0 ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'merchant'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="user">user</option>
                          <option value="merchant">merchant</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {user.balance} CC
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.totalTransactions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setMintForm({ userId: user.id, amount: '' });
                            setActiveTab('mint');
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          発行
                        </button>
                        <button
                          onClick={() => {
                            setBurnForm({ userId: user.id, amount: '', reason: '' });
                            setActiveTab('burn');
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          焼却
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && analytics && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">取引履歴管理</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイプ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">送信者</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">受信者</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                        {tx.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tx.type === 'issue' ? 'bg-green-100 text-green-800' :
                          tx.type === 'burn' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {tx.type === 'issue' ? '発行' : tx.type === 'burn' ? '焼却' : '送金'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.sender.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.receiver.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.amount} CC</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}