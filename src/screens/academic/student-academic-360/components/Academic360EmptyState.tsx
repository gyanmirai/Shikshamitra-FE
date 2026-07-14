'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

type Academic360EmptyStateColor = 'primary' | 'success' | 'warning' | 'info' | 'error';

type Academic360EmptyStateProps = {
  icon: string;
  title: string;
  description?: string;
  color?: Academic360EmptyStateColor;
  compact?: boolean;
};

export function Academic360EmptyState({
  icon,
  title,
  description,
  color = 'primary',
  compact = false,
}: Academic360EmptyStateProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{ py: compact ? 2.5 : 5, px: 2, textAlign: 'center' }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: (theme) => `${theme.palette[color].main}14`,
          color: `${color}.main`,
        }}
      >
        <Iconify icon={icon} width={26} />
      </Box>
      <Typography variant="subtitle2">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
          {description}
        </Typography>
      )}
    </Stack>
  );
}
