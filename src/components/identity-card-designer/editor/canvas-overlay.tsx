import { CanvasSelection } from './canvas-selection';

import type { useCanvasGesture } from './use-canvas-gesture';
import type { StudioController } from '../studio/use-card-studio';
import type { IdentityCardLayout, IdentityCardElement } from '../types';

export function CanvasOverlay({
  gesture,
  layout,
  zoom,
  tool,
  space,
  guides,
  safeInsetMm,
  elements,
  controller,
}: {
  gesture: ReturnType<typeof useCanvasGesture>;
  layout: IdentityCardLayout;
  zoom: number;
  tool: 'select' | 'hand';
  space: boolean;
  guides: boolean;
  safeInsetMm: number;
  elements: IdentityCardElement[];
  controller: StudioController;
}) {
  return (
    <svg
      ref={gesture.svgRef}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width="100%"
      height="100%"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'visible',
        pointerEvents: tool === 'hand' || space ? 'none' : 'auto',
      }}
      onPointerDown={(event) => gesture.begin(event)}
      onPointerMove={gesture.move}
      onPointerUp={() => gesture.finish()}
      onPointerCancel={() => gesture.finish(true)}
    >
      {guides && (
        <g pointerEvents="none">
          <defs>
            <pattern
              id="studio-grid"
              width={(layout.width / layout.widthMm) * 5}
              height={(layout.height / layout.heightMm) * 5}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${(layout.width / layout.widthMm) * 5} 0 H0 V${(layout.height / layout.heightMm) * 5}`}
                fill="none"
                stroke="#637381"
                strokeWidth={0.3 / zoom}
              />
            </pattern>
          </defs>
          <rect width={layout.width} height={layout.height} fill="url(#studio-grid)" />
          <rect
            x={(safeInsetMm * layout.width) / layout.widthMm}
            y={(safeInsetMm * layout.height) / layout.heightMm}
            width={Math.max(0, layout.width - (2 * safeInsetMm * layout.width) / layout.widthMm)}
            height={Math.max(
              0,
              layout.height - (2 * safeInsetMm * layout.height) / layout.heightMm
            )}
            fill="none"
            stroke="#D84315"
            strokeWidth={1 / zoom}
            strokeDasharray={`${4 / zoom} ${3 / zoom}`}
          />
        </g>
      )}
      {elements.map((element) => (
        <CanvasSelection
          key={element.id}
          element={element}
          scale={zoom}
          selected={controller.selectedIds.includes(element.id)}
          onBegin={gesture.begin}
          onSelect={() => controller.setSelectedIds([element.id])}
        />
      ))}
      {gesture.marquee && (
        <rect
          pointerEvents="none"
          x={Math.min(gesture.marquee.start.x, gesture.marquee.end.x)}
          y={Math.min(gesture.marquee.start.y, gesture.marquee.end.y)}
          width={Math.abs(gesture.marquee.start.x - gesture.marquee.end.x)}
          height={Math.abs(gesture.marquee.start.y - gesture.marquee.end.y)}
          fill="#1877F220"
          stroke="#1877F2"
          strokeWidth={1 / zoom}
        />
      )}
    </svg>
  );
}
