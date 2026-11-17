import { updateSelected } from './layer-commands';

import type { IdentityCardElement } from '../types';

export type StudioAlign = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type StudioAxis = 'horizontal' | 'vertical';

export function alignElements(
  elements: IdentityCardElement[],
  ids: string[],
  mode: StudioAlign,
  width: number,
  height: number
) {
  const selected = elements.filter((element) => ids.includes(element.id) && !element.locked);
  if (!selected.length) return elements;
  const single = selected.length === 1;
  const left = single ? 0 : Math.min(...selected.map((element) => element.x));
  const top = single ? 0 : Math.min(...selected.map((element) => element.y));
  const right = single ? width : Math.max(...selected.map((element) => element.x + element.w));
  const bottom = single ? height : Math.max(...selected.map((element) => element.y + element.h));
  return updateSelected(elements, ids, (element) => {
    switch (mode) {
      case 'left':
        return { ...element, x: left };
      case 'center':
        return { ...element, x: (left + right - element.w) / 2 };
      case 'right':
        return { ...element, x: right - element.w };
      case 'top':
        return { ...element, y: top };
      case 'middle':
        return { ...element, y: (top + bottom - element.h) / 2 };
      default:
        return { ...element, y: bottom - element.h };
    }
  });
}

export function distributeElements(
  elements: IdentityCardElement[],
  ids: string[],
  axis: StudioAxis
) {
  const position = axis === 'horizontal' ? 'x' : 'y';
  const size = axis === 'horizontal' ? 'w' : 'h';
  const selected = elements
    .filter((element) => ids.includes(element.id) && !element.locked)
    .sort((a, b) => a[position] - b[position]);
  if (selected.length < 3) return elements;
  const first = selected[0];
  const last = selected[selected.length - 1];
  const span = last[position] + last[size] - first[position];
  const gap =
    (span - selected.reduce((sum, element) => sum + element[size], 0)) / (selected.length - 1);
  const positions = new Map<string, number>();
  let cursor = first[position];
  selected.forEach((element) => {
    positions.set(element.id, cursor);
    cursor += element[size] + gap;
  });
  return updateSelected(elements, ids, (element) => ({
    ...element,
    [position]: positions.get(element.id)!,
  }));
}
