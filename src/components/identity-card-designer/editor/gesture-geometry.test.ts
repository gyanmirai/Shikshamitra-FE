import { it, expect, describe } from 'vitest';

import { createIdentityCardPreset } from '../presets';
import { intersects, transformGesture } from './gesture-geometry';

describe('canvas gestures', () => {
  const layout = createIdentityCardPreset('classic-identity');
  const element = { ...layout.front.elements[0], x: 20, y: 20, w: 40, h: 30 };
  it('clamps movement to printable card bounds and snaps coordinates', () => {
    expect(transformGesture(element, { x: -200, y: 3 }, 'move', layout, true)).toMatchObject({
      x: 0,
    });
  });
  it('snaps to physical millimetres', () => {
    const result = transformGesture(element, { x: 0, y: 3 }, 'move', layout, true);
    expect(result.y / (layout.height / layout.heightMm)).toBeCloseTo(
      Math.round(result.y / (layout.height / layout.heightMm))
    );
  });
  it('resizes from the opposite corner without negative dimensions', () => {
    expect(transformGesture(element, { x: 100, y: 100 }, 'nw', layout, false)).toMatchObject({
      x: 58,
      y: 48,
      w: 2,
      h: 2,
    });
  });
  it('resizes a rotated object along its visible handle axis', () => {
    const result = transformGesture(
      { ...element, rotation: 90 },
      { x: 0, y: 20 },
      'e',
      layout,
      false
    );
    expect(result.w).toBeCloseTo(60);
    expect(result.h).toBeCloseTo(30);
    expect(result.x).toBeCloseTo(10);
    expect(result.y).toBeCloseTo(30);
  });
  it('selects intersecting objects regardless of marquee direction', () => {
    expect(intersects(element, { x: 65, y: 55 }, { x: 10, y: 10 })).toBe(true);
    expect(intersects(element, { x: 65, y: 55 }, { x: 80, y: 80 })).toBe(false);
  });
});
