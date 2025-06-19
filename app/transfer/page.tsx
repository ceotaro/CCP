'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { toast } from 'react-toastify';

export default function TransferPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setLoading(true);
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: receiverId,
          amount: parseInt(amount),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Transfer successful!');
        router.push('/');
      } else {
        toast.error(data.error || 'Transfer failed');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">送金</h1>
          <p className="text-gray-600">CivicCoinを他のユーザーに送金します</p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">送金フォーム</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  💡 受取人のIDまたはQRコードをスキャンして送金できます
                </p>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-6">
              <div>
                <label htmlFor="receiverId" className="block text-sm font-medium text-gray-700 mb-2">
                  受取人ID
                </label>
                <input
                  type="text"
                  id="receiverId"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="受取人のIDを入力してください"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  例: 123e4567-e89b-12d3-a456-426614174000
                </p>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  送金額 (CC)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="送金する金額を入力"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  最小送金額: 1 CC
                </p>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  {loading ? '処理中...' : '送金する'}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>

          {/* Quick Access Info */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">💡 送金のヒント</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 受取人のIDは正確に入力してください</li>
              <li>• 送金後の取り消しはできません</li>
              <li>• 残高を確認してから送金してください</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}