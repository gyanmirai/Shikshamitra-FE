import { fitDimensions, imageTransform, outputDimensions } from './geometry';

import type { PhotoSettings } from './geometry';

export function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  return canvas;
}

export function context(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot edit photos.');
  return ctx;
}

export async function loadPhoto(data: string) {
  if (!/^data:image\/(png|jpeg);base64,/i.test(data)) throw new Error('Choose a PNG or JPEG photo.');
  if (data.length > 16 * 1024 * 1024) throw new Error('Choose a photo smaller than 12 MB.');
  const image = new Image();
  image.src = data;
  await image.decode();
  if (image.width * image.height > 40_000_000) throw new Error('Choose a photo below 40 megapixels.');
  const { width, height } = fitDimensions(image.width, image.height, 1536);
  const canvas = makeCanvas(width, height);
  context(canvas).drawImage(image, 0, 0, width, height);
  return canvas;
}

export function fullMask(source: HTMLCanvasElement) {
  const mask = makeCanvas(source.width, source.height);
  const ctx = context(mask);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, mask.width, mask.height);
  return mask;
}

export function renderPhoto(source: HTMLCanvasElement, mask: HTMLCanvasElement, settings: PhotoSettings, limit = 768) {
  const { width, height } = outputDimensions(settings.aspect, source.width, source.height, limit);
  const output = makeCanvas(width, height); const ctx = context(output);
  if (settings.background !== 'transparent') {
    ctx.fillStyle = settings.background; ctx.fillRect(0, 0, width, height);
  }
  const cutout = makeCanvas(source.width, source.height); const photo = context(cutout);
  photo.drawImage(source, 0, 0); photo.globalCompositeOperation = 'destination-in'; photo.drawImage(mask, 0, 0);
  const { scale, cx, cy, radians } = imageTransform(width, height, source.width, source.height, settings);
  ctx.translate(cx, cy); ctx.rotate(radians);
  ctx.scale(scale * (settings.flipX ? -1 : 1), scale * (settings.flipY ? -1 : 1));
  ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
  ctx.drawImage(cutout, -source.width / 2, -source.height / 2);
  return output;
}

export function exportPhoto(source: HTMLCanvasElement, mask: HTMLCanvasElement, settings: PhotoSettings) {
  for (let limit = Math.min(768, Math.max(source.width, source.height)); limit >= 1; limit = Math.floor(limit * 0.8)) {
    const data = renderPhoto(source, mask, settings, limit).toDataURL('image/png');
    const payload = data.slice(data.indexOf(',') + 1);
    const bytes = payload.length * 3 / 4 - (payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0);
    if (bytes <= 512 * 1024) return data;
  }
  throw new Error('This photo is too complex to fit. Crop it more tightly and retry.');
}
