import { IDENTITY_LABELS } from './types';

import type { IdentityKind } from './types';

export const IDENTITY_MINIMUMS = {
  logo: { width: 32, height: 32 },
  banner: { width: 1400, height: 300 },
  signature: { width: 32, height: 32 },
};
export const IDENTITY_FRAMES = {
  logo: { width: 256, height: 256 },
  banner: { width: 1400, height: 300 },
  signature: { width: 320, height: 100 },
};
export function validateIdentityDimensions(kind: IdentityKind, width: number, height: number) {
  const minimum = IDENTITY_MINIMUMS[kind];
  if (width < minimum.width || height < minimum.height)
    throw new Error(
      `${IDENTITY_LABELS[kind]} must be at least ${minimum.width} × ${minimum.height} px. This image is ${width} × ${height} px.`
    );
  if (width > 10000 || height > 10000 || width * height > 25000000)
    throw new Error('Use an image no larger than 10,000 px per side and 25 megapixels.');
}
