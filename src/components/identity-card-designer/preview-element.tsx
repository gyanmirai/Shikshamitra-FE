import { IdentityCode } from './preview-code';

import type { IdentityCardElement, IdentityCardPreviewProps } from './types';

export function ElementContent({
  element,
  values = {},
  fieldTokens,
  logoUrl,
  photoUrl,
  signatureUrl,
}: IdentityCardPreviewProps & { element: IdentityCardElement }) {
  const { style = {} } = element;
  if (element.type === 'signature' && signatureUrl)
    return (
      <img
        src={signatureUrl}
        alt="Principal’s signature"
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
      />
    );
  if (element.type === 'signature')
    return <div style={{ font: '9px Arial', padding: 2 }}>Principal’s signature</div>;
  if (element.type === 'photo' || element.type === 'logo' || element.type === 'image') {
    const url =
      element.type === 'image' ? element.imageData : element.type === 'photo' ? photoUrl : logoUrl;
    return url ? (
      <img
        src={url}
        alt={
          element.type === 'photo'
            ? 'Cardholder'
            : element.type === 'image'
              ? element.label || 'Uploaded image'
              : 'School logo'
        }
        style={{
          width: '100%',
          height: '100%',
          objectFit: element.type === 'photo' ? 'cover' : 'contain',
        }}
      />
    ) : (
      <div
        style={{
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          font: '9px Arial',
          color: '#637381',
          background: '#F4F6F8',
          border: '1px solid #C4CDD5',
          boxSizing: 'border-box',
        }}
      >
        {element.type === 'photo' ? 'Photo unavailable' : 'Logo'}
      </div>
    );
  }
  if (element.type === 'qr' || element.type === 'barcode')
    return (
      <IdentityCode
        type={element.type}
        value={
          values[element.type === 'qr' ? 'qr' : 'barcode'] ??
          values[element.type === 'qr' ? 'QRCode' : 'Barcode']
        }
      />
    );
  if (element.type !== 'text') return null;
  const { fieldKey } = element;
  const dynamic = Boolean(fieldKey && fieldKey !== 'static');
  const token = fieldKey ? fieldTokens?.[fieldKey] : undefined;
  const value =
    dynamic && fieldKey
      ? token
        ? `[${token}]`
        : (values[fieldKey] ?? `[${element.label || fieldKey}]`)
      : (element.value ?? '');
  const labelPrefix =
    style.showLabel && element.label ? `${element.label}${style.separator ?? ': '}` : '';
  const prefix = dynamic ? (element.prefix ?? labelPrefix) : labelPrefix;
  return (
    <div
      style={{
        fontFamily: style.fontFamily || 'Arial',
        fontStyle: style.fontStyle,
        textDecoration: style.textDecoration,
        fontSize: style.fontSize ?? 12,
        fontWeight: Number(style.fontWeight) || (style.fontWeight === 'bold' ? 700 : 400),
        textAlign: style.textAlign ?? 'left',
        color: style.color ?? '#1C252E',
        lineHeight: 1.2,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      }}
    >
      {prefix}
      {value}
    </div>
  );
}
