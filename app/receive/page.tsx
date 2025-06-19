'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { QRDisplay } from '@/components/QRDisplay';

export default function ReceivePage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-8">Receive CivicCoins</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <QRDisplay
              value={`civiccoin:${session.user.id}`}
              title="Your Receive QR Code"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to receive payments:</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>1. Show this QR code to the sender</p>
              <p>2. They can scan it with their CivicCoin app</p>
              <p>3. Or share your User ID: <span className="font-mono bg-white px-2 py-1 rounded">{session.user.id}</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}