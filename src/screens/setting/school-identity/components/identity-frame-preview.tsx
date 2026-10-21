import Box from '@mui/material/Box';

import { IDENTITY_LABELS } from '../types';
import { frameRectangle, IDENTITY_FRAMES } from '../identity-image-frame';

import type { IdentityKind } from '../types';
import type { ImagePlacement } from '../identity-image-frame';
import type { PendingIdentityImage } from './identity-frame-dialog';

export function IdentityFramePreview({
  kind,
  pending,
  placement,
}: {
  kind: IdentityKind;
  pending: PendingIdentityImage;
  placement: ImagePlacement;
}) {
  const frame = IDENTITY_FRAMES[kind];
  const rect = frameRectangle(
    { width: pending.image.naturalWidth, height: pending.image.naturalHeight },
    frame,
    placement
  );
  return (
    <Box
      role="img"
      aria-label={`${IDENTITY_LABELS[kind]} frame preview`}
      sx={{
        position: 'relative',
        width: 1,
        maxWidth: kind === 'logo' ? 256 : undefined,
        mx: 'auto',
        aspectRatio: `${frame.width} / ${frame.height}`,
        overflow: 'hidden',
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
