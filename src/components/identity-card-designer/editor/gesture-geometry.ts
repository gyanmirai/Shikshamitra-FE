import { rotatedResize } from './rotated-resize';

import type { IdentityCardLayout, IdentityCardElement } from '../types';

export type Point = { x: number; y: number };
export type Handle = 'move' | 'rotate' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
export const handles: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
export function transformGesture(
  element: IdentityCardElement,
  delta: Point,
  handle: Handle,
  layout: IdentityCardLayout,
  snap: boolean
): IdentityCardElement {
  const round = (value: number, axis: 'x' | 'y') => {
    const unit = axis === 'x' ? layout.width / layout.widthMm : layout.height / layout.heightMm;
    return snap ? Math.round(value / unit) * unit : value;
  };
  const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));
  if (handle === 'move')
    return {
      ...element,
      x: clamp(round(element.x + delta.x, 'x'), layout.width - element.w),
      y: clamp(round(element.y + delta.y, 'y'), layout.height - element.h),
    };
  if (element.rotation) return rotatedResize(element, delta, handle, layout, snap);
  let { x, y, w, h } = element;
  if (handle.includes('w')) {
    x = clamp(round(x + delta.x, 'x'), x + w - 2);
    w = element.x + element.w - x;
  }
  if (handle.includes('e')) w = Math.max(2, Math.min(round(w + delta.x, 'x'), layout.width - x));
  if (handle.includes('n')) {
    y = clamp(round(y + delta.y, 'y'), y + h - 2);
    h = element.y + element.h - y;
  }
  if (handle.includes('s')) h = Math.max(2, Math.min(round(h + delta.y, 'y'), layout.height - y));
  return { ...element, x, y, w, h };
}
export function intersects(element: IdentityCardElement, start: Point, end: Point) {
  return (
    element.x < Math.max(start.x, end.x) &&
    element.x + element.w > Math.min(start.x, end.x) &&
    element.y < Math.max(start.y, end.y) &&
    element.y + element.h > Math.min(start.y, end.y)
  );
}
