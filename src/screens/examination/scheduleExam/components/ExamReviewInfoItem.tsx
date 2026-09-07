import type { ReactNode, ReactElement } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { cloneElement } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Box, Typography } from '@mui/material';

interface ExamReviewInfoItemProps {
  icon: ReactElement<{ sx?: SxProps<Theme> }>;
  label: string;
  value: ReactNode;
}

export function ExamReviewInfoItem({ icon, label, value }: ExamReviewInfoItemProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {cloneElement(icon, { sx: { fontSize: 20 } })}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 500 }}
        >
          {label}
        </Typography>
        <Box
          component="div"
          sx={{
            typography: 'subtitle2',
            fontWeight: 600,
            color: 'text.primary',
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Box>
      </Box>
    </Box>
  );
}
