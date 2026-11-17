import { it, expect, describe } from 'vitest';

import { mattePixels } from './pixels';
import { fitDimensions, toSourcePoint, imageTransform, DEFAULT_SETTINGS } from './geometry';

describe('photo geometry and masking', () => {
  it('bounds both extreme portrait and landscape inputs without upscaling', () => {
    expect(fitDimensions(4000, 2000, 1024)).toEqual({ width: 1024, height: 512 });
    expect(fitDimensions(200, 800, 512)).toEqual({ width: 128, height: 512 });
    expect(fitDimensions(100, 80, 512)).toEqual({ width: 100, height: 80 });
    expect(() => fitDimensions(0, 10, 512)).toThrow();
  });
  it('maps crop center through rotated, flipped and moved images reversibly', () => {
    const settings = { ...DEFAULT_SETTINGS, rotation: 90, flipX: true, x: 0.1, y: -0.2 };
    const transform = imageTransform(300, 400, 600, 800, settings);
    const point = toSourcePoint(180, 120, 300, 400, 600, 800, settings);
    expect(point.x).toBeCloseTo(300);
    expect(point.y).toBeCloseTo(400);
    expect(transform.scale).toBeCloseTo(0.5);
  });
  it('turns model confidence pixels into alpha without losing soft edges', () => {
    expect(Array.from(mattePixels(new Uint8Array([0, 128, 255]), 1)))
      .toEqual([255, 255, 255, 0, 255, 255, 255, 128, 255, 255, 255, 255]);
    expect(Array.from(mattePixels(new Uint8Array([20, 20, 20, 220, 220, 220]), 3)))
      .toEqual([255, 255, 255, 20, 255, 255, 255, 220]);
  });
});
