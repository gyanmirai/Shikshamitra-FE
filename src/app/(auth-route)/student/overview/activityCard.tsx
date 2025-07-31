// components/ActivityItem.tsx
import React from 'react';

import { Box, Card, Stack, Typography } from '@mui/material';

import { Label } from 'src/components/label';

interface ActivityItemProps {
  color: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  date: string;
  tag: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  color,
  title,
  subtitle,
  timeAgo,
  date,
  tag,
}) => (
  <Card
    variant="outlined"
    sx={{
      p: 2,
      mb: 1,
      borderRadius: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      '&:hover': {
        boxShadow: 'var(--shadows-8)',
        cursor: 'pointer',
      },
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box>
        <Typography variant="subtitle2">{title}</Typography>

        {/* Tag Chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          {tag && (
            <Label variant="soft" color="success">
              {tag}
            </Label>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        </Box>
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
  </Card>
);

export default ActivityItem;
