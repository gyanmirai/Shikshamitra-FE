import { IDENTITY_LABELS, IDENTITY_LIMITS } from './types';

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
export type ImagePlacement = { fit: 'contain' | 'cover'; zoom: number; x: number; y: number };
export const DEFAULT_PLACEMENT: ImagePlacement = { fit: 'contain', zoom: 1, x: 50, y: 50 };

export function validateIdentityDimensions(kind: IdentityKind, width: number, height: number) {
  const minimum = IDENTITY_MINIMUMS[kind];
  if (width < minimum.width || height < minimum.height)
    throw new Error(
      `${IDENTITY_LABELS[kind]} must be at least ${minimum.width} × ${minimum.height} px. This image is ${width} × ${height} px.`
    );
  if (width > 10000 || height > 10000 || width * height > 25000000)
    throw new Error('Use an image no larger than 10,000 px per side and 25 megapixels.');
}

export function frameRectangle(
  image: { width: number; height: number },
  frame: { width: number; height: number },
  placement: ImagePlacement
) {
  const scales = [frame.width / image.width, frame.height / image.height];
  const scale =
    (placement.fit === 'contain' ? Math.min(...scales) : Math.max(...scales)) * placement.zoom;
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    width,
    height,
    x: ((frame.width - width) * placement.x) / 100 || 0,
    y: ((frame.height - height) * placement.y) / 100 || 0,
  };
}

export function loadIdentityImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('This image could not be read. Choose a valid PNG or JPG.'));
    image.src = url;
  });
}

export async function renderIdentityFrame(
  file: File,
  image: HTMLImageElement,
  kind: IdentityKind,
  placement: ImagePlacement
) {
  const frame = IDENTITY_FRAMES[kind];
  const rect = frameRectangle(
    { width: image.naturalWidth, height: image.naturalHeight },
    frame,
    placement
  );
  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const context = canvas.getContext('2d');
  if (!context)
    throw new Error('Image framing is unavailable in this browser. Try again in another browser.');
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) =>
        value ? resolve(value) : reject(new Error('The image could not be prepared. Try again.')),
      'image/png'
    );
  });
  if (blob.size > IDENTITY_LIMITS[kind])
    throw new Error('The framed image exceeds the upload limit. Choose a smaller image.');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-framed.png`, { type: 'image/png' });
}
