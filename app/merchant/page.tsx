'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { QRDisplay } from '@/components/QRDisplay';
import { toast } from 'react-toastify';

interface PaymentRequest {
  amount: number;
  description: string;
  merchantId: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  direction: 'sent' | 'received';
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
}

export default function MerchantPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentQR, setPaymentQR] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (session?.user.id) {
      fetchTransactions();
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTransactions = async () => {
    if (!session?.user.id) return;

    try {
      const res = await fetch(`/api/tx/${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
      }
    } catch {
      toast.error('取引履歴の取得に失敗しました');
    }
  };

  const generatePaymentQR = () => {
    if (!amount || !description) {
      toast.error('金額と説明を入力してください');
      return;
    }

    const paymentRequest: PaymentRequest = {
      amount: parseInt(amount),
      description,
      merchantId: session?.user.id || '',
    };

    const qrData = `civiccoin:payment:${JSON.stringify(paymentRequest)}`;
    setPaymentQR(qrData);
    toast.success('決済QRコードを生成しました');
  };

  if (!session) {
    router.push('/');
    return null;
  }

  if (session.user.role !== 'merchant' && session.user.role !== 'admin') {
    router.push('/');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">マーチャントダッシュボード</h1>
          <p className="text-gray-600">決済QRコードの生成と売上管理</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment QR Generator */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">決済QRコード生成</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      請求金額 (CC)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="請求金額を入力"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      商品・サービス説明
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="商品やサービスの説明を入力"
                      rows={3}
                    />
                  </div>
                  
                  <button
                    onClick={generatePaymentQR}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    🏷️ 決済QRコードを生成
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 使用方法</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 金額と商品説明を入力</li>
                    <li>• QRコードを生成</li>
                    <li>• お客様にQRコードを提示</li>
                    <li>• お客様がスキャンして決済</li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                {paymentQR ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">決済用QRコード</h3>
                    <QRDisplay value={paymentQR} title="" />
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">請求金額: <span className="font-bold">{amount} CC</span></p>
                      <p className="text-sm text-gray-600">説明: {description}</p>
                    </div>
                    <button
                      onClick={() => setPaymentQR('')}
                      className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      QRコードをクリア
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8 text-gray-500">
                    <div className="text-6xl mb-4">📱</div>
                    <p>決済QRコードがここに表示されます</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">売上統計</h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">今日の売上</p>
                  <p className="text-2xl font-bold text-green-700">
                    {transactions
                      .filter(tx => tx.direction === 'received' && 
                        new Date(tx.createdAt).toDateString() === new Date().toDateString())
                      .reduce((sum, tx) => sum + tx.amount, 0)} CC
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">総売上</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {transactions
                      .filter(tx => tx.direction === 'received')
                      .reduce((sum, tx) => sum + tx.amount, 0)} CC
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">取引回数</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {transactions.filter(tx => tx.direction === 'received').length}回
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の売上</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {transactions
                  .filter(tx => tx.direction === 'received')
                  .slice(0, 5)
                  .map((tx) => (
                    <div key={tx.id} className="border-b border-gray-100 pb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {new Date(tx.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                        <span className="font-bold text-green-600">+{tx.amount} CC</span>
                      </div>
                      <p className="text-xs text-gray-500">{tx.sender.name}様</p>
                    </div>
                  ))}
                {transactions.filter(tx => tx.direction === 'received').length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">まだ売上がありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}