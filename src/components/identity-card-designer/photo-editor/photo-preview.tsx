import type { PointerEvent } from 'react';

import { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import { context, fullMask, renderPhoto } from './image-processing';
import { toSourcePoint, imageTransform, DEFAULT_SETTINGS } from './geometry';

import type { PhotoEditorState } from './use-photo-editor';

export function PhotoPreview({ editor, disabled }: { editor: PhotoEditorState; disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gesture = useRef<{ x: number; y: number; imageX: number; imageY: number; last?: { x: number; y: number } } | null>(null);
  const { source, mask, settings, before, version } = editor;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source || !mask) return;
    const rendered = renderPhoto(source, before ? fullMask(source) : mask, before ? DEFAULT_SETTINGS : settings);
    canvas.width = rendered.width; canvas.height = rendered.height;
    context(canvas).drawImage(rendered, 0, 0);
  }, [source, mask, settings, before, version]);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
  }
  function paint(event: PointerEvent<HTMLCanvasElement>) {
    if (!source || !mask || !gesture.current) return;
    const p = point(event); const canvas = event.currentTarget;
    const next = toSourcePoint(p.x * canvas.width, p.y * canvas.height, canvas.width, canvas.height, source.width, source.height, settings);
    const previous = gesture.current.last ?? next;
    const { scale } = imageTransform(canvas.width, canvas.height, source.width, source.height, settings);
    const ctx = context(mask);
    ctx.globalCompositeOperation = editor.tool === 'erase' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = '#ffffff'; ctx.fillStyle = '#ffffff';
    ctx.lineWidth = editor.brushSize / scale; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(previous.x, previous.y); ctx.lineTo(next.x, next.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(next.x, next.y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill();
    gesture.current.last = next; editor.maskChanged();
  }
  return (
    <Box sx={{ minWidth: 0, position: { md: 'sticky' }, top: 0, alignSelf: 'start' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240, p: 2, bgcolor: 'background.neutral', border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <canvas
          ref={canvasRef}
          aria-label={before ? 'Original photo preview' : 'Edited photo preview. Use position controls or drag to reposition.'}
          style={{ display: 'block', maxWidth: '100%', maxHeight: '56vh', objectFit: 'contain', touchAction: 'none', cursor: disabled ? 'default' : editor.tool === 'move' ? 'grab' : 'crosshair' }}
          onPointerDown={(event) => {
            if (disabled || before || !source || !mask) return;
            const p = point(event); event.currentTarget.setPointerCapture(event.pointerId);
            gesture.current = { ...p, imageX: settings.x, imageY: settings.y };
            if (editor.tool !== 'move') paint(event);
          }}
          onPointerMove={(event) => {
            if (!gesture.current || disabled || before) return;
            if (editor.tool !== 'move') { paint(event); return; }
            const p = point(event);
            editor.update({ x: gesture.current.imageX + p.x - gesture.current.x, y: gesture.current.imageY + p.y - gesture.current.y });
          }}
          onPointerUp={() => { gesture.current = null; }}
          onPointerCancel={() => { gesture.current = null; }}
          onLostPointerCapture={() => { gesture.current = null; }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {before ? 'Original photo' : 'The preview is the final crop. Drag to position, or use the sliders.'}
      </Typography>
    </Box>
  );
}
