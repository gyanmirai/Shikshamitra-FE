import { it, expect, describe } from 'vitest';

import {
  frameRectangle,
  DEFAULT_PLACEMENT,
  validateIdentityDimensions,
} from './identity-image-frame';

describe('School Identity image dimensions and framing', () => {
  it.each([
    ['logo', 32, 32],
    ['signature', 32, 32],
    ['banner', 1400, 300],
  ] as const)(
    'accepts the exact %s minimum and rejects either smaller side',
    (kind, width, height) => {
      expect(() => validateIdentityDimensions(kind, width, height)).not.toThrow();
      expect(() => validateIdentityDimensions(kind, width + 1, height + 1)).not.toThrow();
      expect(() => validateIdentityDimensions(kind, width - 1, height)).toThrow(
        `at least ${width} × ${height}`
      );
      expect(() => validateIdentityDimensions(kind, width, height - 1)).toThrow(
        `at least ${width} × ${height}`
      );
    }
  );
  it('rejects dimensions outside the server safety limits', () => {
    expect(() => validateIdentityDimensions('logo', 10001, 32)).toThrow('10,000');
    expect(() => validateIdentityDimensions('banner', 6000, 6000)).toThrow('25 megapixels');
  });
  it('fits all edges in a square frame without distorting the image', () => {
    expect(
      frameRectangle({ width: 200, height: 100 }, { width: 256, height: 256 }, DEFAULT_PLACEMENT)
    ).toEqual({ x: 0, y: 64, width: 256, height: 128 });
  });
  it('fills and crops a wide image, with horizontal position selecting either edge', () => {
    const image = { width: 200, height: 100 };
    const frame = { width: 256, height: 256 };
    expect(frameRectangle(image, frame, { ...DEFAULT_PLACEMENT, fit: 'cover' })).toEqual({
      x: -128,
      y: 0,
      width: 512,
      height: 256,
    });
    expect(frameRectangle(image, frame, { ...DEFAULT_PLACEMENT, fit: 'cover', x: 0 }).x).toBe(0);
    expect(frameRectangle(image, frame, { ...DEFAULT_PLACEMENT, fit: 'cover', x: 100 }).x).toBe(
      -256
    );
  });
  it('zooms around the selected alignment without changing proportions', () => {
    expect(
      frameRectangle(
        { width: 100, height: 100 },
        { width: 256, height: 256 },
        { ...DEFAULT_PLACEMENT, zoom: 2, y: 100 }
      )
    ).toEqual({ x: -128, y: -256, width: 512, height: 512 });
  });
});
