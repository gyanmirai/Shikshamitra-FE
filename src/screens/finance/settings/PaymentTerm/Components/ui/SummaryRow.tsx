import React from 'react';
import { Stack, Typography } from '@mui/material';

// ---------------------------------------------------------------------------
// SummaryRow — label / value pair used in the live-summary sidebar section
// ---------------------------------------------------------------------------
interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
}

export function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.7rem', flexShrink: 0 }}
      >
        {label}
      </Typography>
      {value}
    </Stack>
  );
}
