import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function SeatingMetrics({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 1,
      }}
    >
      {items.map(({ label, value }) => (
        <Stack
          key={label}
          spacing={0.25}
          sx={{ p: 1, minWidth: 0, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
        >
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {value}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}
