import type { ReactNode } from 'react';

import { Box, Card } from '@mui/material';

/** Keep list actions below domain filters and outside the table's own toolbar. */
export default function FinanceListActionRow({
  children,
  action,
}: {
  children?: ReactNode;
  action?: ReactNode;
}) {
  if (!children && !action) return null;

  return (
    <Card
      sx={{
        boxShadow: 'var(--shadows-4)',
        px: 1,
        mb: 1,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        columnGap: 2,
      }}
    >
      {children && (
        <Box
          sx={{
            flex: '1 1 0%',
            minWidth: 0,
            width: { xs: '100%', md: 'auto' },
            flexBasis: { xs: '100%', md: 0 },
          }}
        >
          {children}
        </Box>
      )}
      {action && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', ml: 'auto', py: 1, flexShrink: 0 }}>
          {action}
        </Box>
      )}
    </Card>
  );
}
