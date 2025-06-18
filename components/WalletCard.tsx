'use client';

import { useSession } from 'next-auth/react';

interface WalletCardProps {
  balance: number;
  userName?: string;
}

export function WalletCard({ balance, userName }: WalletCardProps) {
  const { data: session } = useSession();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Wallet</h2>
          <p className="text-gray-600">{userName || session?.user.name || 'User'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Balance</p>
          <p className="text-3xl font-bold text-blue-600">{balance.toLocaleString()}</p>
          <p className="text-sm text-gray-500">CVC</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Mode: {process.env.NEXT_PUBLIC_CIVICCOIN_MODE || 'DB'}
        </p>
      </div>
    </div>
  );
}