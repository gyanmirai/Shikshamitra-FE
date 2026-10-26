import type { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

type Props = {
  label: string;
  value: ReactNode;
  helper?: string;
};

export function GradeScaleDetailField({ label, value, helper }: Props) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ typography: 'body2', color: 'text.primary', overflowWrap: 'anywhere' }}>
        {value}
      </Box>
      {helper && (
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      )}
    </Box>
  );
}
