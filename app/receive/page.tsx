'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { QRDisplay } from '@/components/QRDisplay';
import { Layout } from '@/components/Layout';

export default function ReceivePage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">受取</h1>
          <p className="text-gray-600">CivicCoinを受け取るためのQRコードです</p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">受取用QRコード</h2>
            <QRDisplay
              value={`civiccoin:${session.user.id}`}
              title=""
            />
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">あなたのユーザーID:</p>
              <div className="bg-white p-3 rounded border">
                <p className="font-mono text-sm text-gray-900 break-all">{session.user.id}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(session.user.id)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                📋 IDをコピー
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-4">💰 受取方法</h3>
            <div className="text-sm text-green-800 space-y-3">
              <div className="flex items-start space-x-3">
                <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                <p>このQRコードを送金者に表示する</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                <p>またはあなたのユーザーIDを共有する</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                <p>送金者が金額を入力して送金を実行</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">⚠️ セキュリティ注意事項</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• QRコードは信頼できる相手にのみ表示してください</li>
              <li>• ユーザーIDは第三者に漏らさないようご注意ください</li>
              <li>• 不明な送金を受け取った場合は管理者に連絡してください</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}