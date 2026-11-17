import { transformGesture } from './gesture-geometry';

import type { IdentityCardLayout } from '../types';
import type { Point, Handle } from './gesture-geometry';

export function gestureLayout(
  layout: IdentityCardLayout,
  side: 'front' | 'back',
  active: { ids: string[]; start: Point; handle: Handle | 'marquee' },
  end: Point,
  snap: boolean
) {
  const elements = layout[side]?.elements ?? [];
  let delta = { x: end.x - active.start.x, y: end.y - active.start.y };
  const editable = elements.filter((e) => active.ids.includes(e.id) && !e.locked);
  if (active.handle === 'move' && editable.length) {
    delta = {
      x: Math.max(
        -Math.min(...editable.map((e) => e.x)),
        Math.min(delta.x, layout.width - Math.max(...editable.map((e) => e.x + e.w)))
      ),
      y: Math.max(
        -Math.min(...editable.map((e) => e.y)),
        Math.min(delta.y, layout.height - Math.max(...editable.map((e) => e.y + e.h)))
      ),
    };
  }
  const next = {
    ...layout,
    [side]: {
      elements: elements.map((element) => {
        if (!active.ids.includes(element.id) || element.locked) return element;
        if (active.handle === 'rotate') {
          const angle =
            (Math.atan2(end.y - element.y - element.h / 2, end.x - element.x - element.w / 2) *
              180) /
              Math.PI +
            90;
          const normalized = ((((angle + 180) % 360) + 360) % 360) - 180;
          return {
            ...element,
            rotation: snap ? Math.round(normalized / 15) * 15 : normalized,
          };
        }
        return transformGesture(
          element,
          delta,
          active.handle as Handle,
          layout,
          snap && editable.length === 1
        );
      }),
    },
  };
  return next;
}
