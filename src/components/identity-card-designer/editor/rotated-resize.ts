import type { Point, Handle } from './gesture-geometry';
import type { IdentityCardLayout, IdentityCardElement } from '../types';

export function rotatedResize(
  element: IdentityCardElement,
  delta: Point,
  handle: Handle,
  layout: IdentityCardLayout,
  snap: boolean
) {
  const radians = ((element.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const local = { x: cos * delta.x + sin * delta.y, y: -sin * delta.x + cos * delta.y };
  const sx = handle.includes('e') ? 1 : handle.includes('w') ? -1 : 0;
  const sy = handle.includes('s') ? 1 : handle.includes('n') ? -1 : 0;
  const round = (value: number, unit: number) => (snap ? Math.round(value / unit) * unit : value);
  const w = Math.max(
    2,
    Math.min(layout.width, round(element.w + sx * local.x, layout.width / layout.widthMm))
  );
  const h = Math.max(
    2,
    Math.min(layout.height, round(element.h + sy * local.y, layout.height / layout.heightMm))
  );
  const dx = (sx * (w - element.w)) / 2;
  const dy = (sy * (h - element.h)) / 2;
  const center = {
    x: element.x + element.w / 2 + cos * dx - sin * dy,
    y: element.y + element.h / 2 + sin * dx + cos * dy,
  };
  return {
    ...element,
    w,
    h,
    x: Math.max(0, Math.min(layout.width - w, center.x - w / 2)),
    y: Math.max(0, Math.min(layout.height - h, center.y - h / 2)),
  };
}
