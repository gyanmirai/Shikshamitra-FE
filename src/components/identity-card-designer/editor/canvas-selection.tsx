import type { PointerEvent } from 'react';

import { handles } from './gesture-geometry';

import type { Handle } from './gesture-geometry';
import type { IdentityCardElement } from '../types';

export function CanvasSelection({
  element,
  selected,
  scale,
  onBegin,
  onSelect,
}: {
  element: IdentityCardElement;
  selected: boolean;
  scale: number;
  onBegin: (event: PointerEvent<SVGElement>, id: string, handle?: Handle) => void;
  onSelect: () => void;
}) {
  const { id, x, y, w, h, rotation = 0, locked } = element;
  const size = 9 / scale;
  return (
    <g transform={`rotate(${rotation} ${x + w / 2} ${y + h / 2})`}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="transparent"
        stroke={selected ? '#1877F2' : 'transparent'}
        strokeWidth={1.5 / scale}
        role="button"
        tabIndex={0}
        aria-label={`Edit ${element.label || element.type}`}
        onClick={(event) => {
          if (event.detail === 0) onSelect();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onSelect();
          }
        }}
        onPointerDown={(event) => onBegin(event, id)}
        style={{ cursor: locked ? 'not-allowed' : 'move' }}
      />
      {selected && !locked && (
        <>
          {handles.map((handle) => {
            const hx = handle.includes('w') ? x : handle.includes('e') ? x + w : x + w / 2;
            const hy = handle.includes('n') ? y : handle.includes('s') ? y + h : y + h / 2;
            return (
              <rect
                key={handle}
                x={hx - size / 2}
                y={hy - size / 2}
                width={size}
                height={size}
                fill="white"
                stroke="#1877F2"
                strokeWidth={1 / scale}
                aria-label={`Resize ${element.label} ${handle}`}
                style={{ cursor: `${handle}-resize` }}
                onPointerDown={(event) => onBegin(event, id, handle)}
              />
            );
          })}
          <line
            x1={x + w / 2}
            y1={y}
            x2={x + w / 2}
            y2={y - 22 / scale}
            stroke="#1877F2"
            strokeWidth={1 / scale}
          />
          <circle
            cx={x + w / 2}
            cy={y - 22 / scale}
            r={size / 2}
            fill="white"
            stroke="#1877F2"
            strokeWidth={1 / scale}
            aria-label={`Rotate ${element.label}`}
            style={{ cursor: 'grab' }}
            onPointerDown={(event) => onBegin(event, id, 'rotate')}
          />
        </>
      )}
    </g>
  );
}
