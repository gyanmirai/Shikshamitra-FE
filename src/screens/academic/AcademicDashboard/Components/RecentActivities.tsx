'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Chip, Stack, Button, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type ActivityType = 'create' | 'update' | 'schedule' | 'configure' | 'publish' | 'delete';

interface ActivityItem {
  id: string;
  action: string;
  actor: string;
  time: string;
  type: ActivityType;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: 'ac1',
    action: "Subject 'Physics Advanced' created",
    actor: 'Admin',
    time: '2 hours ago',
    type: 'create',
  },
  {
    id: 'ac2',
    action: 'Timetable updated for Class 10B — added Saturday sessions',
    actor: 'Admin',
    time: '4 hours ago',
    type: 'update',
  },
  {
    id: 'ac3',
    action: 'Final Exam scheduled for Class 10A, 10B, 10C',
    actor: 'Admin',
    time: '1 day ago',
    type: 'schedule',
  },
  {
    id: 'ac4',
    action: 'Grade scaling changed for Grade 9 — updated pass percentage',
    actor: 'Admin',
    time: '1 day ago',
    type: 'configure',
  },
  {
    id: 'ac5',
    action: "Elective group 'Science Stream' created with 3 subjects",
    actor: 'Admin',
    time: '2 days ago',
    type: 'create',
  },
  {
    id: 'ac6',
    action: 'Results published for Unit Test 2 — Class 8 & 9',
    actor: 'Admin',
    time: '3 days ago',
    type: 'publish',
  },
  {
    id: 'ac7',
    action: 'Homework type Assignment added to Homework Settings',
    actor: 'Admin',
    time: '3 days ago',
    type: 'configure',
  },
  {
    id: 'ac8',
    action: 'Seating plan generated for Mid Term Exam',
    actor: 'Admin',
    time: '5 days ago',
    type: 'create',
  },
];

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

export default function RecentActivities() {
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
        title="Recent Admin Activities"
        action={
          <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} />}>
            View All
          </Button>
        }
        sx={{ p: 0, mb: 1.5 }}
      />

      <Scrollbar sx={{ maxHeight: 380 }}>
        <Stack spacing={1}>
          {ACTIVITIES.map((activity) => (
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
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    color: `${CHIP_COLOR[activity.type]}.main`,
                    bgcolor: `${CHIP_COLOR[activity.type]}.lighter`,
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={ACTIVITY_ICON[activity.type]} width={16} />
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
                label={activityTypeLabel[activity.type]}
                color={CHIP_COLOR[activity.type]}
                variant="soft"
                size="small"
                sx={{ flexShrink: 0, ml: 1 }}
              />
            </Stack>
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}
