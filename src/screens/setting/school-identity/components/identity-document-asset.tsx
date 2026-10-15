import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ImageOutlined from '@mui/icons-material/ImageOutlined';

import { IdentityImage } from './identity-image';

import type { IdentityContext, EffectiveIdentityAsset } from '../types';

export function IdentityDocumentAsset({
  item,
  context,
  label,
  height,
}: {
  item?: EffectiveIdentityAsset;
  context: IdentityContext;
  label: string;
  height: number;
}) {
  if (item?.selection.mode === 2) return null;
  return item?.asset ? (
    <IdentityImage
      id={item.asset.id}
      context={context}
      label={`${label} in document layout`}
      height={height}
    />
  ) : (
    <Box
      sx={{
        minHeight: height,
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.neutral',
        borderRadius: 0.5,
      }}
    >
      <ImageOutlined sx={{ fontSize: 22, color: 'text.secondary' }} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: 'center', overflowWrap: 'anywhere' }}
      >
        {label} placeholder
      </Typography>
    </Box>
  );
}
