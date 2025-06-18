'use client';

import QRCode from 'react-qr-code';

interface QRDisplayProps {
  value: string;
  size?: number;
  title?: string;
}

export function QRDisplay({ value, size = 256, title }: QRDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="flex justify-center">
        <QRCode value={value} size={size} />
      </div>
      <p className="mt-4 text-xs text-gray-500 break-all">{value}</p>
    </div>
  );
}