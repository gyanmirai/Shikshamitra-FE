'use client';

import React from 'react';
import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Card, Stack, Button, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

interface QuickActionItem {
  label: string;
  icon: string;
  path: string;
  color: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary';
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    label: 'Create Subject',
    icon: 'fluent:book-add-24-regular',
    path: academicPaths.curriculum.settings.subjectsCreation,
    color: 'success',
  },
  {
    label: 'Allocate Subject',
    icon: 'solar:user-check-rounded-bold',
    path: academicPaths.curriculum.subjectsAssignment,
    color: 'info',
  },
  {
    label: 'Create Timetable',
    icon: 'solar:calendar-add-bold',
    path: academicPaths.timetable.management,
    color: 'primary',
  },
  {
    label: 'Schedule Exam',
    icon: 'solar:notebook-bookmark-bold',
    path: academicPaths.examination.schedule,
    color: 'warning',
  },
  {
    label: 'Seating Plan',
    icon: 'solar:chair-bold',
    path: academicPaths.examination.seatAllocation,
    color: 'error',
  },
  {
    label: 'Record Marks',
    icon: 'solar:document-text-bold',
    path: academicPaths.examination.recordMarks,
    color: 'secondary',
  },
  {
    label: 'Exam Types',
    icon: 'solar:settings-bold',
    path: academicPaths.examination.settings.examTypes,
    color: 'primary',
  },
  {
    label: 'Homework Types',
    icon: 'solar:notebook-bold',
    path: academicPaths.homework.settings.homeworkTypes,
    color: 'warning',
  },
];

// ----------------------------------------------------------------------

export default function QuickActions() {
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
        title="Quick Action Center"
        subheader="Shortcuts to common admin tasks"
        sx={{ p: 0, mb: 1.5 }}
      />

      <Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              component={Link}
              href={action.path}
              disableRipple
              color="inherit"
              sx={{
                flex: '1 1 calc(12% - 8px)',
                minWidth: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                py: 1.5,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                borderRadius: 1.5,
                color: 'text.primary',
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'border-color', 'box-shadow']),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                  borderColor: (theme) => alpha(theme.palette.grey[500], 0.16),
                  boxShadow: (theme) => theme.shadows[2],
                },
              }}
            >
              <Iconify icon={action.icon} width={22} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.7rem', textAlign: 'center' }}
              >
                {action.label}
              </Typography>
            </Button>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
