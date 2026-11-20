import { Box } from '@mui/material';
import { useRef, useState, useEffect } from 'react';

import { IdentityCardPreview } from '../preview';
import { CanvasOverlay } from './canvas-overlay';
import { useCanvasGesture } from './use-canvas-gesture';
import { CanvasRulers, CANVAS_RULER_GUTTER } from './canvas-rulers';

import type { IdentityCardPreviewProps } from '../types';
import type { StudioController } from '../studio/use-card-studio';

const canvasPadding = 16;
const fitGutter = CANVAS_RULER_GUTTER + 2 * canvasPadding + 2;

export function StudioCanvas({
  controller,
  zoom,
  onFitZoom,
  tool,
  guides,
  snap,
  safeInsetMm,
  disabled,
  ...props
}: IdentityCardPreviewProps & {
  controller: StudioController;
  zoom: number;
  onFitZoom: (zoom: number) => void;
  tool: 'select' | 'hand';
  guides: boolean;
  snap: boolean;
  safeInsetMm: number;
  disabled?: boolean;
}) {
  const { layout, side = 'front' } = props;
  const viewport = useRef<HTMLDivElement>(null);
  const pan = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [space, setSpace] = useState(false);
  const gesture = useCanvasGesture({ layout, side, controller, snap, disabled });
  useEffect(() => {
    const node = viewport.current;
    if (!node) return undefined;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      onFitZoom(
        Math.max(0.1, Math.min((width - fitGutter) / layout.width, (height - fitGutter) / layout.height))
      );
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [layout.width, layout.height, onFitZoom]);
  const drawn = gesture.preview ?? layout;
  const elements = [...(drawn[side]?.elements ?? [])]
    .filter(
      (e) =>
        e.visible &&
        !(e.type === 'logo' && props.logoHidden) &&
        !(e.type === 'qr' && props.qrCodeEnabled === false) &&
        !(e.type === 'barcode' && props.barcodeEnabled === false)
    )
    .sort((a, b) => a.z - b.z);
  return (
    <Box
      ref={viewport}
      role="region"
      aria-label="Card preview"
      tabIndex={0}
      onPointerDownCapture={(event) => {
        // The SVG gesture cancels the pointer's default focus behavior.
        if (!disabled && event.button === 0) event.currentTarget.focus({ preventScroll: true });
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') gesture.finish(true);
        if (event.key === ' ' && !(event.target as HTMLElement).closest('input,textarea')) {
          event.preventDefault();
          setSpace(true);
        }
      }}
      onKeyUp={(event) => {
        if (event.key === ' ') setSpace(false);
      }}
      onBlur={() => setSpace(false)}
      onPointerDown={(event) => {
        if (tool !== 'hand' && !space) return;
        const node = viewport.current!;
        pan.current = {
          x: event.clientX,
          y: event.clientY,
          left: node.scrollLeft,
          top: node.scrollTop,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const { current } = pan;
        if (!current) return;
        viewport.current!.scrollLeft = current.left - event.clientX + current.x;
        viewport.current!.scrollTop = current.top - event.clientY + current.y;
      }}
      onPointerUp={() => {
        pan.current = null;
      }}
      onPointerCancel={() => {
        pan.current = null;
      }}
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'auto',
        bgcolor: 'background.neutral',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        cursor: tool === 'hand' || space ? 'grab' : 'default',
        touchAction: 'none',
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
      }}
    >
      <Box
        sx={{
          minWidth: '100%',
          minHeight: '100%',
          width: 'max-content',
          display: 'grid',
          placeItems: 'center',
          boxSizing: 'border-box',
          p: `${canvasPadding}px`,
        }}
      >
        <CanvasRulers layout={layout}>
          <Box
            sx={{
              position: 'relative',
              width: layout.width * zoom,
              height: layout.height * zoom,
              flexShrink: 0,
            }}
          >
            <IdentityCardPreview {...props} layout={drawn} />
            <CanvasOverlay
              gesture={gesture}
              layout={layout}
              zoom={zoom}
              tool={tool}
              space={space}
              guides={guides}
              safeInsetMm={safeInsetMm}
              elements={elements}
              controller={controller}
            />
          </Box>
        </CanvasRulers>
      </Box>
    </Box>
  );
}
