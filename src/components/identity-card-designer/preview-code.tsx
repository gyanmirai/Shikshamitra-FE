'use client';

import QRCode from 'qrcode';
import Barcode from 'react-barcode';
import { useState, useEffect } from 'react';

export function IdentityCode({ type, value }: { type: 'qr' | 'barcode'; value?: string | null }) {
  const [qr, setQr] = useState<{ value: string; url: string } | null>(null);
  useEffect(() => {
    let active = true;
    if (type === 'qr' && value)
      QRCode.toDataURL(value, { margin: 4, width: 240, errorCorrectionLevel: 'M' })
        .then((url) => {
          if (active) setQr({ value, url });
        })
        .catch(() => {
          if (active) setQr(null);
        });
    return () => {
      active = false;
    };
  }, [type, value]);
  if (type === 'barcode' && value)
    return <Barcode value={value} width={1} height={35} fontSize={9} margin={3} />;
  if (type === 'qr' && value && qr?.value === value)
    return (
      <img
        src={qr.url}
        alt="Card QR code"
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        border: '1px dashed #637381',
        color: '#637381',
        display: 'grid',
        placeItems: 'center',
        font: '9px Arial',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      {type === 'qr' ? 'Sample QR' : 'Sample barcode'}
    </div>
  );
}
