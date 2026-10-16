import type { Theme, SxProps } from '@mui/material/styles';

export const reviewCardSx = {
  height: '100%',
  minWidth: 0,
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1.5,
  boxShadow: 'none',
  containerType: 'inline-size',
} satisfies SxProps<Theme>;

export const reviewChipSx = {
  maxWidth: '100%',
  height: 'auto',
  minHeight: 24,
  '& .MuiChip-label': { whiteSpace: 'normal', overflowWrap: 'anywhere', py: 0.5 },
} satisfies SxProps<Theme>;

export const reviewFactsSx = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: 2,
  '@container (min-width: 320px)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
} satisfies SxProps<Theme>;
