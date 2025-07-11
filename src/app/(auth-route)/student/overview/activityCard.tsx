// components/ActivityItem.tsx
import React from 'react';

import { Box, Stack, useTheme, Typography } from '@mui/material';

interface ActivityItemProps {
  color: 'success' | 'info' | 'warning' | 'error';
  title: string;
  subtitle: string;
  timeAgo: string;
  date: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ color, title, subtitle, timeAgo, date }) => {
  const theme = useTheme();
  const paletteColor = theme.palette[color]?.main || theme.palette.grey[500];
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
      sx={{ py: 1.2, borderBottom: `1px solid ${theme.palette.divider}` }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            mt: '7px',
            bgcolor: paletteColor,
          }}
        />
        <Box>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Stack>
      <Box textAlign="right" minWidth={95}>
        <Typography variant="caption" color="text.secondary">
          {timeAgo}
        </Typography>
        <Typography variant="caption" display="block" color="text.disabled">
          {date}
        </Typography>
      </Box>
    </Stack>
  );
};

export default ActivityItem;
