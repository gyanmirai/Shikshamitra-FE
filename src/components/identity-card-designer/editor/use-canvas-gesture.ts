import type { PointerEvent } from 'react';

import { useRef, useState, useEffect } from 'react';

import { intersects } from './gesture-geometry';
import { gestureLayout } from './gesture-layout';

import type { IdentityCardLayout } from '../types';
import type { Point, Handle } from './gesture-geometry';
import type { StudioController } from '../studio/use-card-studio';

type Gesture = {
  start: Point;
  layout: IdentityCardLayout;
  ids: string[];
  handle: Handle | 'marquee';
  end: Point;
};
export function useCanvasGesture({
  layout,
  side,
  controller,
  snap,
  disabled,
}: {
  layout: IdentityCardLayout;
  side: 'front' | 'back';
  controller: StudioController;
  snap: boolean;
  disabled?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const previewRef = useRef<IdentityCardLayout | null>(null);
  const [preview, setPreview] = useState<IdentityCardLayout | null>(null);
  const [marquee, setMarquee] = useState<{ start: Point; end: Point } | null>(null);
  useEffect(() => {
    gesture.current = null;
    previewRef.current = null;
    setPreview(null);
    setMarquee(null);
  }, [layout, side, disabled]);
  function point(event: PointerEvent): Point {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * layout.width) / rect.width,
      y: ((event.clientY - rect.top) * layout.height) / rect.height,
    };
  }
  function begin(event: PointerEvent<SVGElement>, id?: string, handle: Handle = 'move') {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const start = point(event);
    let ids = controller.selectedIds;
    if (id && !ids.includes(id)) {
      ids = event.shiftKey ? [...ids, id] : [id];
      controller.setSelectedIds(ids);
    } else if (id && event.shiftKey && handle === 'move') {
      const group = layout[side]?.elements.find((e) => e.id === id)?.groupId;
      controller.setSelectedIds(
        ids.filter(
          (item) =>
            item !== id &&
            (!group || layout[side]?.elements.find((e) => e.id === item)?.groupId !== group)
        )
      );
      return;
    }
    const groups = new Set(
      (layout[side]?.elements ?? [])
        .filter((e) => ids.includes(e.id) && e.groupId)
        .map((e) => e.groupId)
    );
    ids = (layout[side]?.elements ?? [])
      .filter((e) => ids.includes(e.id) || (e.groupId && groups.has(e.groupId)))
      .map((e) => e.id);
    gesture.current = {
      start,
      end: start,
      layout,
      ids: id || event.shiftKey ? ids : [],
      handle: id ? handle : 'marquee',
    };
    svgRef.current?.setPointerCapture(event.pointerId);
    if (!id) {
      if (!event.shiftKey) controller.setSelectedIds([]);
      setMarquee({ start, end: start });
    }
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    const active = gesture.current;
    if (!active) return;
    const end = point(event);
    active.end = end;
    if (active.handle === 'marquee') {
      setMarquee({ start: active.start, end });
      return;
    }
    const next = gestureLayout(active.layout, side, active, end, snap);
    previewRef.current = next;
    setPreview(next);
  }
  function finish(cancel = false) {
    const active = gesture.current;
    if (!cancel && active?.handle === 'marquee')
      controller.setSelectedIds([
        ...new Set([
          ...active.ids,
          ...(layout[side]?.elements ?? [])
            .filter((e) => e.visible && intersects(e, active.start, active.end))
            .map((e) => e.id),
        ]),
      ]);
    if (!cancel && previewRef.current) controller.commit(previewRef.current);
    previewRef.current = null;
    gesture.current = null;
    setPreview(null);
    setMarquee(null);
  }
  return { svgRef, preview, marquee, begin, move, finish };
}
