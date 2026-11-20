export type PhotoSettings = {
  aspect: string; zoom: number; x: number; y: number; rotation: number;
  flipX: boolean; flipY: boolean; brightness: number; contrast: number;
  saturation: number; background: string;
};

export const DEFAULT_SETTINGS: PhotoSettings = {
  aspect: 'original', zoom: 1, x: 0, y: 0, rotation: 0, flipX: false, flipY: false,
  brightness: 100, contrast: 100, saturation: 100, background: 'transparent',
};

export function fitDimensions(width: number, height: number, limit: number) {
  if (![width, height, limit].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Invalid photo dimensions.');
  }
  const scale = Math.min(1, limit / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function outputDimensions(aspect: string, width: number, height: number, limit = 768) {
  const ratio = aspect === 'original' ? width / height : Number(aspect);
  return fitDimensions(ratio >= 1 ? limit : limit * ratio, ratio >= 1 ? limit / ratio : limit, limit);
}

export function imageTransform(width: number, height: number, sourceWidth: number, sourceHeight: number, settings: PhotoSettings) {
  return {
    scale: Math.max(width / sourceWidth, height / sourceHeight) * settings.zoom,
    cx: width * (0.5 + settings.x), cy: height * (0.5 + settings.y),
    radians: settings.rotation * Math.PI / 180,
  };
}

export function toSourcePoint(x: number, y: number, width: number, height: number, sourceWidth: number, sourceHeight: number, settings: PhotoSettings) {
  const { scale, cx, cy, radians } = imageTransform(width, height, sourceWidth, sourceHeight, settings);
  const dx = x - cx; const dy = y - cy;
  return {
    x: ((dx * Math.cos(radians) + dy * Math.sin(radians)) / scale) * (settings.flipX ? -1 : 1) + sourceWidth / 2,
    y: ((-dx * Math.sin(radians) + dy * Math.cos(radians)) / scale) * (settings.flipY ? -1 : 1) + sourceHeight / 2,
  };
}
