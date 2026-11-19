import { it, expect, describe } from 'vitest';

import { movePrintAsset, resizePrintAsset } from './print-branding-geometry';

const logo = { x: 20, y: 10, width: 20, height: 50, lockAspectRatio: true };

describe('print branding editor bounds', () => {
  it('keeps moved images within the printable header band', () => {
    expect(movePrintAsset(logo, 95, -20)).toEqual({ ...logo, x: 80, y: 0 });
  });

  it('preserves locked proportions while resizing against the bottom edge', () => {
    expect(resizePrintAsset(logo, 'width', 80)).toEqual({ ...logo, width: 36, height: 90 });
  });

  it('allows independent dimensions when unlocked without collapsing the image', () => {
    expect(resizePrintAsset({ ...logo, lockAspectRatio: false }, 'height', 1)).toEqual({
      ...logo,
      height: 5,
      lockAspectRatio: false,
    });
  });
});
