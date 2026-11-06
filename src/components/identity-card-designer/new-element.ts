import type { IdentityCardLayout, IdentityCardElement } from './types';

export function newIdentityCardElement(
  type: IdentityCardElement['type'],
  id: string,
  layout: IdentityCardLayout,
  elements: IdentityCardElement[]
): IdentityCardElement {
  return {
    id,
    type,
    fieldKey: type === 'text' ? 'static' : undefined,
    label: `New ${type}`,
    value: type === 'text' ? 'Enter text' : undefined,
    x: layout.width * 0.05,
    y: layout.height * 0.4,
    w: type === 'text' ? layout.width * 0.5 : layout.width * 0.15,
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
