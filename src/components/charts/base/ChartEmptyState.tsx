'use client';

import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  title?: string;
  description?: string;
  icon?: string;
};

export function ChartEmptyState({
  title = 'No data available',
  description = 'There is nothing to display here yet.',
  icon = 'solar:chart-2-bold-duotone',
  sx,
  ...other
}: Props) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 9,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit',
        ...sx,
      }}
      {...other}
    >
      <Stack
        spacing={1.25}
        alignItems="center"
        sx={{
          px: 3,
          py: 2.5,
          borderRadius: 2,
          textAlign: 'center',
          backdropFilter: 'blur(2px)',
        }}
      >
        <Iconify icon={icon} width={42} sx={{ color: 'text.disabled' }} />
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {description}
        </Typography>
      </Stack>
    </Box>
  );
}
