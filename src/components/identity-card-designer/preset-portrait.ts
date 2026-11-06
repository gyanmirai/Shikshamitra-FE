import type { IdentityCardElement } from './types';

export function portraitPresetElements(
  elements: IdentityCardElement[],
  back: boolean
): IdentityCardElement[] {
  const positions: Record<string, Partial<IdentityCardElement>> = {
    'header-band': { w: 270 },
    logo: { x: 18, y: 18 },
    'school-name': { x: 65, y: 16, w: 187, h: 28 },
    'school-address': { x: 65, y: 44, w: 187, h: 20 },
    'card-kind': { x: 18, y: 78, w: 234, h: 18 },
    divider: { x: 18, y: 101, w: 234 },
    photo: { x: 85, y: 113, w: 100, h: 112 },
    'person-name': { x: 18, y: 240, w: 234, h: 28 },
    'person-role': { x: 18, y: 276, w: 234, h: 20 },
    'record-number': { x: 18, y: 308, w: 234, h: 18 },
    division: { x: 18, y: 332, w: 234, h: 18 },
    'additional-record': { x: 18, y: 349, w: 234, h: 12 },
    'footer-divider': { x: 18, y: 358, w: 234 },
    'card-number': { x: 18, y: 371, w: 184, h: 18 },
    validity: { x: 18, y: 398, w: 184, h: 14 },
    qr: { x: 208, y: 371, w: 44, h: 44 },
    'return-instructions': { x: 18, y: 120, w: 234, h: 64 },
    'office-address': { x: 18, y: 200, w: 234, h: 64 },
    signature: { x: 18, y: 320, w: 234, h: 20 },
  };
  return elements.map((element) => {
    const key = back ? element.id.replace(/^back-/, '') : element.id;
    return {
      ...element,
      ...positions[key],
      style: {
        ...element.style,
        ...(key === 'school-name' ? { fontSize: 17 } : {}),
        ...(['person-name', 'person-role'].includes(key) ? { textAlign: 'center' as const } : {}),
      },
    };
  });
}
