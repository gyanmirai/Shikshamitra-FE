import { IdentityCode } from './preview-code';

import type { IdentityCardElement, IdentityCardPreviewProps } from './types';

export function ElementContent({
  element,
  values = {},
  logoUrl,
  photoUrl,
}: IdentityCardPreviewProps & { element: IdentityCardElement }) {
  const { style = {} } = element;
  if (element.type === 'photo' || element.type === 'logo') {
    const url = element.type === 'photo' ? photoUrl : logoUrl;
    return url ? (
      <img
        src={url}
        alt={element.type === 'photo' ? 'Cardholder' : 'School logo'}
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
  const boundValue = element.fieldKey === 'static' ? element.value : values[element.fieldKey ?? ''];
  const value = boundValue ?? element.value ?? `[${element.label || element.fieldKey || 'Text'}]`;
  return (
    <div
      style={{
        fontFamily: style.fontFamily || 'Arial',
        fontSize: style.fontSize ?? 12,
        fontWeight: Number(style.fontWeight) || (style.fontWeight === 'bold' ? 700 : 400),
        textAlign: style.textAlign ?? 'left',
        color: style.color ?? '#1C252E',
        lineHeight: 1.2,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
      }}
    >
      {style.showLabel && element.label ? `${element.label}${style.separator ?? ': '}` : ''}
      {value}
    </div>
  );
}
