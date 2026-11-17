import type { IdentityCardLayout, IdentityCardElement } from '../types';

export const layer = (
  id: string,
  changes: Partial<IdentityCardElement> = {}
): IdentityCardElement => ({
  id,
  type: 'text',
  x: 10,
  y: 10,
  w: 20,
  h: 10,
  z: 1,
  visible: true,
  ...changes,
});

export const layout = (
  elements = [layer('a'), layer('b', { x: 50, z: 2 })]
): IdentityCardLayout => ({
  orientation: 'Horizontal',
  width: 100,
  height: 60,
  widthMm: 85.6,
  heightMm: 54,
  backgroundColor: '#fff',
  themeColor: '#000',
  front: { elements },
  back: { elements: [layer('back')] },
});
