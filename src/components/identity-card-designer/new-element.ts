import type { IdentityCardLayout, IdentityCardElement } from './types';

export function newIdentityCardElement(
  type: IdentityCardElement['type'],
  id: string,
  layout: IdentityCardLayout,
  elements: IdentityCardElement[]
): IdentityCardElement {
  const signature = type === 'signature';
  return {
    id,
    type,
    fieldKey: type === 'text' ? 'static' : undefined,
    label: signature ? 'Principal’s signature' : `New ${type}`,
    value: type === 'text' ? 'Enter text' : undefined,
    x: layout.width * (signature ? 0.67 : 0.05),
    y: layout.height * (signature ? 0.62 : 0.4),
    w: layout.width * (signature ? 0.28 : type === 'text' ? 0.5 : 0.15),
    h: type === 'line' ? 1 : layout.height * 0.15,
    z: Math.max(0, ...elements.map((element) => element.z)) + 1,
    visible: true,
    style: {
      fontSize: 12,
      fontFamily: 'Arial',
      color: '#1C252E',
      ...(type === 'shape' || type === 'line' ? { backgroundColor: layout.themeColor } : {}),
    },
  };
}
