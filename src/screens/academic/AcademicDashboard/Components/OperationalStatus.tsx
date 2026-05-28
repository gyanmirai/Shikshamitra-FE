'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Stack, Button, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type StatusLevel = 'success' | 'warning' | 'error' | 'info';

interface OperationItem {
  module: string;
  status: string;
  level: StatusLevel;
  progress: number;
  icon: string;
}

const OPERATIONS: OperationItem[] = [
  {
    module: 'Subject Allocation',
    status: '92% Complete',
    level: 'success',
    progress: 92,
    icon: 'fluent:book-24-regular',
  },
  {
    module: 'Timetable Setup',
    status: 'Pending for 2 Classes',
    level: 'warning',
    progress: 78,
    icon: 'solar:calendar-bold',
  },
  {
    module: 'Grade Entry',
    status: '18 Pending',
    level: 'error',
    progress: 55,
    icon: 'solar:document-text-bold',
  },
  {
    module: 'Homework Evaluation',
    status: '24 Pending',
    level: 'warning',
    progress: 62,
    icon: 'solar:notebook-bold',
  },
  {
    module: 'Exam Scheduling',
    status: 'Completed',
    level: 'success',
    progress: 100,
    icon: 'solar:medal-star-linear',
  },
  {
    module: 'Seating Plan',
    status: 'Not Generated',
    level: 'error',
    progress: 0,
    icon: 'solar:chair-bold',
  },
];

const ACCENT: Record<StatusLevel, string> = {
  success: 'success.main',
  warning: 'warning.main',
  error: 'error.main',
  info: 'info.main',
};

// ----------------------------------------------------------------------

export default function OperationalStatus() {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        boxShadow: 'none',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <CardHeader
        title="Academic Operations Status"
        sx={{ p: 0, mb: 1.5, flexShrink: 0 }}
        action={
          <Button
            size="small"
            color="inherit"
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            View all
          </Button>
        }
      />

      <Scrollbar sx={{ flexGrow: 1 }}>
        <Stack spacing={1} sx={{ pb: 1 }}>
          {OPERATIONS.map((item) => (
            <Box
              key={item.module}
              sx={{
                p: 1.5,
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'background.neutral',
                  borderColor: 'transparent',
                },
              }}
            >
              {/* Left colour accent — same 4px bar as reference */}
              <Box
                sx={{
                  width: 4,
                  height: 48,
                  borderRadius: 0.5,
                  bgcolor: ACCENT[item.level],
                  flexShrink: 0,
                }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Title row — module name + status label */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography variant="subtitle2" sx={{ fontSize: '0.925rem' }} noWrap>
                    {item.module}
                  </Typography>
                  <Label variant="soft" color={item.level} sx={{ flexShrink: 0 }}>
                    {item.level === 'success'
                      ? 'On Track'
                      : item.level === 'warning'
                        ? 'Attention'
                        : 'Action Needed'}
                  </Label>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {item.status}
                </Typography>

                {/* Progress row */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
                  {/* <Box sx={{ flex: 1, minWidth: 0 }}>
                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      color={item.level}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box> */}

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      typography: 'caption',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={item.icon} width={14} sx={{ mr: 0.5 }} />
                    {item.progress}%
                  </Box>
                </Stack>
              </Box>
            </Box>
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}
