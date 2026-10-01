import type { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

interface ExamReviewInfoItemProps {
  label: string;
  value: ReactNode;
}

export function ExamReviewInfoItem({ label, value }: ExamReviewInfoItemProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Box
        sx={{
          typography: 'body2',
          fontWeight: 600,
          color: 'text.primary',
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </Box>
    </Box>
  );
}
