'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Card, Stack, Button, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type Priority = 'high' | 'medium' | 'low';

interface PendingItem {
  id: string;
  label: string;
  count: number;
  priority: Priority;
  action: string;
  path: string;
  icon: string;
}

const PENDING_ITEMS: PendingItem[] = [
  {
    id: 'grade_entry',
    label: 'Pending Grade Entries',
    count: 18,
    priority: 'high',
    action: 'Open',
    path: academicPaths.examination.recordMarks,
    icon: 'solar:document-text-bold',
  },
  {
    id: 'homework_eval',
    label: 'Pending Homework Evaluations',
    count: 24,
    priority: 'high',
    action: 'Review',
    path: academicPaths.homework.assessment,
    icon: 'solar:notebook-bold',
  },
  {
    id: 'timetable',
    label: 'Timetables Missing',
    count: 3,
    priority: 'medium',
    action: 'Manage',
    path: academicPaths.timetable.management,
    icon: 'solar:calendar-bold',
  },
  {
    id: 'seating',
    label: 'Seating Plans Not Generated',
    count: 5,
    priority: 'high',
    action: 'Generate',
    path: academicPaths.examination.seatAllocation,
    icon: 'solar:chair-bold',
  },
  {
    id: 'subject_alloc',
    label: 'Subjects Unallocated',
    count: 5,
    priority: 'medium',
    action: 'Allocate',
    path: academicPaths.curriculum.subjectsAssignment,
    icon: 'fluent:book-24-regular',
  },
  {
    id: 'curriculum',
    label: 'Curriculum Updates Pending',
    count: 3,
    priority: 'low',
    action: 'Update',
    path: academicPaths.curriculum.chaptersManagement,
    icon: 'solar:checklist-minimalistic-broken',
  },
];

type PriorityColor = 'error' | 'warning' | 'success';
const PRIORITY_COLOR: Record<Priority, PriorityColor> = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};
const BG: Record<Priority, string> = {
  high: 'error.lighter',
  medium: 'warning.lighter',
  low: 'success.lighter',
};

// ----------------------------------------------------------------------

export default function PendingActionCenter() {
  const router = useRouter();

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
        title="Pending Action Center"
        action={
          <Label color="error" variant="soft">
            {PENDING_ITEMS.filter((i) => i.priority === 'high').length} Urgent
          </Label>
        }
        sx={{ p: 0, mb: 1.5 }}
      />

      <Stack spacing={1}>
        {PENDING_ITEMS.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ p: 1.5, borderRadius: 1.5, bgcolor: BG[item.priority] }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                color: `${PRIORITY_COLOR[item.priority]}.main`,
                bgcolor: `${PRIORITY_COLOR[item.priority]}.light`,
                flexShrink: 0,
              }}
            >
              <Iconify icon={item.icon} width={18} />
            </Box>

            {/* Count + label */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Label
                  color={PRIORITY_COLOR[item.priority]}
                  variant="filled"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                >
                  {item.count}
                </Label>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {item.label}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Priority: {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
              </Typography>
            </Box>

            {/* Action button */}
            <Button
              size="small"
              variant="contained"
              color={PRIORITY_COLOR[item.priority]}
              onClick={() => router.push(item.path)}
              sx={{ minWidth: 68, flexShrink: 0 }}
            >
              {item.action}
            </Button>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
