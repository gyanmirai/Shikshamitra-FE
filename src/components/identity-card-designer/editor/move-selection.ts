import type { IdentityCardLayout } from '../types';
import type { StudioController } from '../studio/use-card-studio';

export function moveSelection(
  studio: StudioController,
  layout: IdentityCardLayout,
  key: string,
  step: number
) {
  const elements = studio.selectedElements.filter((element) => !element.locked);
  if (!elements.length) return;
  const dx = key === 'arrowright' ? step : key === 'arrowleft' ? -step : 0;
  const dy = key === 'arrowdown' ? step : key === 'arrowup' ? -step : 0;
  const x = Math.max(
    -Math.min(...elements.map((e) => e.x)),
    Math.min(dx, layout.width - Math.max(...elements.map((e) => e.x + e.w)))
  );
  const y = Math.max(
    -Math.min(...elements.map((e) => e.y)),
    Math.min(dy, layout.height - Math.max(...elements.map((e) => e.y + e.h)))
  );
  studio.updateElements((element) => ({ ...element, x: element.x + x, y: element.y + y }));
}
