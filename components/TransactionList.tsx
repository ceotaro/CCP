'use client';

import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  direction: 'sent' | 'received';
  sender: {
    name: string;
    email: string;
  };
  receiver: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.direction === 'sent' ? 'bg-red-100' : 'bg-green-100'
                  }`}
                >
                  <span className={`text-xl ${tx.direction === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.direction === 'sent' ? '↑' : '↓'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {tx.direction === 'sent' ? tx.receiver.name : tx.sender.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    tx.direction === 'sent' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {tx.direction === 'sent' ? '-' : '+'}{tx.amount}
                </p>
                <p className="text-xs text-gray-500">{tx.type}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}