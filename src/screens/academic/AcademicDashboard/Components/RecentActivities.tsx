'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, Chip, Stack, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type ActivityType = 'create' | 'update' | 'schedule' | 'configure' | 'publish' | 'delete';

interface ActivityItem {
  id: string;
  action: string;
  actor: string;
  time: string;
  type: ActivityType;
}

const activityTypeLabel: Record<ActivityType, string> = {
  create: 'Created',
  update: 'Updated',
  schedule: 'Scheduled',
  configure: 'Configured',
  publish: 'Published',
  delete: 'Deleted',
};

type ActivityChipColor = 'success' | 'info' | 'secondary' | 'warning' | 'primary' | 'error';
const CHIP_COLOR: Record<ActivityType, ActivityChipColor> = {
  create: 'success',
  update: 'info',
  schedule: 'secondary',
  configure: 'warning',
  publish: 'primary',
  delete: 'error',
};
const ACTIVITY_ICON: Record<ActivityType, string> = {
  create: 'solar:add-circle-bold',
  update: 'solar:pen-bold',
  schedule: 'solar:calendar-bold',
  configure: 'solar:settings-bold',
  publish: 'solar:upload-bold',
  delete: 'solar:trash-bin-trash-bold',
};

// ----------------------------------------------------------------------

export default function RecentActivities({ activities }: { activities?: ActivityItem[] }) {
  const displayActivities = activities ?? [];

  return (
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: 'none',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <CardHeader
        title="Recent School-wide Activity"
        subheader="Latest academic changes across all classes and modules"
        sx={{ p: 0, mb: 1.5 }}
      />

      {displayActivities.length === 0 ? (
        <EmptyContent
          filled
          title="No recent academic activity"
          description="New exams and academic configuration changes will appear here."
          sx={{ minHeight: 220 }}
          slotProps={{ img: { maxWidth: 88 } }}
        />
      ) : (
        <Scrollbar sx={{ maxHeight: 380 }}>
          <Stack spacing={1}>
            {displayActivities.map((activity) => (
              <Stack
                key={activity.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      color: `${CHIP_COLOR[activity.type] || 'primary'}.main`,
                      bgcolor: `${CHIP_COLOR[activity.type] || 'primary'}.lighter`,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify
                      icon={ACTIVITY_ICON[activity.type] || 'solar:info-circle-bold'}
                      width={16}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.4 }}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.actor} • {activity.time}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={activityTypeLabel[activity.type] || 'Info'}
                  color={CHIP_COLOR[activity.type] || 'primary'}
                  variant="soft"
                  size="small"
                  sx={{ flexShrink: 0, ml: 1 }}
                />
              </Stack>
            ))}
          </Stack>
        </Scrollbar>
      )}
    </Card>
  );
}
