import Box from '@mui/material/Box';

import { frameRectangle } from './image-frame';

import type { FrameSize, ImagePlacement, PendingFrameImage } from './image-frame';

export function ImageFramePreview({
  label,
  frame,
  pending,
  placement,
  maxWidth,
  circular,
}: {
  label: string;
  frame: FrameSize;
  pending: PendingFrameImage;
  placement: ImagePlacement;
  maxWidth?: number;
  circular?: boolean;
}) {
  const rect = frameRectangle(
    { width: pending.image.naturalWidth, height: pending.image.naturalHeight },
    frame,
    placement
  );
  return (
    <Box
      role="img"
      aria-label={`${label} frame preview`}
      sx={{
        position: 'relative',
        width: 1,
        maxWidth: circular ? { xs: Math.min(maxWidth ?? 176, 176), sm: maxWidth } : maxWidth,
        mx: 'auto',
        aspectRatio: `${frame.width} / ${frame.height}`,
        overflow: 'hidden',
        borderRadius: circular ? '50%' : undefined,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.neutral',
      }}
    >
      <Box
        component="img"
        src={pending.url}
        alt=""
        sx={{
          position: 'absolute',
          maxWidth: 'none',
          left: `${(rect.x / frame.width) * 100}%`,
          top: `${(rect.y / frame.height) * 100}%`,
          width: `${(rect.width / frame.width) * 100}%`,
          height: `${(rect.height / frame.height) * 100}%`,
        }}
      />
    </Box>
  );
}
