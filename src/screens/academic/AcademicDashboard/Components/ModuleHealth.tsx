'use client';

import React from 'react';
import Link from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Card, Grid, Stack, CardHeader, Typography, LinearProgress } from '@mui/material';

// ----------------------------------------------------------------------

type HealthStatus = 'healthy' | 'warning' | 'delayed';

interface ModuleItem {
  name: string;
  health: HealthStatus;
  detail: string;
  score: number;
  path: string;
  icon: string;
}

const MODULES: ModuleItem[] = [
  {
    name: 'Curriculum',
    health: 'healthy',
    detail: '75% chapters complete',
    score: 90,
    path: academicPaths.curriculum.subjectsAssignment,
    icon: 'fluent:book-24-regular',
  },
  {
    name: 'Timetable',
    health: 'warning',
    detail: 'Lecture slots missing',
    score: 60,
    path: academicPaths.timetable.management,
    icon: 'solar:calendar-bold',
  },
  {
    name: 'Examination',
    health: 'healthy',
    detail: 'Exam scheduled, types set',
    score: 85,
    path: academicPaths.examination.schedule,
    icon: 'solar:document-bold',
  },
  {
    name: 'Homework',
    health: 'delayed',
    detail: '24 evaluations overdue',
    score: 40,
    path: academicPaths.homework.root,
    icon: 'solar:notebook-bold',
  },
  {
    name: 'LMS',
    health: 'healthy',
    detail: 'All courses active',
    score: 95,
    path: academicPaths.lms.dashboard,
    icon: 'solar:monitor-smartphone-bold',
  },
  {
    name: 'Group Mgmt',
    health: 'healthy',
    detail: 'All groups configured',
    score: 88,
    path: academicPaths.groupManagement.dashboard,
    icon: 'solar:users-group-two-rounded-bold',
  },
];

type HealthColor = 'success' | 'warning' | 'error';
const HEALTH_COLOR: Record<HealthStatus, HealthColor> = {
  healthy: 'success',
  warning: 'warning',
  delayed: 'error',
};
const HEALTH_LABEL: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  delayed: 'Delayed',
};
const HEALTH_ICON: Record<HealthStatus, string> = {
  healthy: 'solar:check-circle-bold',
  warning: 'solar:danger-triangle-bold',
  delayed: 'solar:close-circle-bold',
};

// ----------------------------------------------------------------------

export default function ModuleHealth() {
  return (
    <Card sx={{ p: 2, boxShadow: 'none', border: (t) => `1px solid ${t.palette.divider}` }}>
      <CardHeader title="Module Health Overview" sx={{ p: 0, mb: 1.5 }} />

      <Grid container spacing={1}>
        {MODULES.map((mod) => {
          const color = HEALTH_COLOR[mod.health];
          return (
            <Grid key={mod.name} size={{ xs: 6, sm: 4, md: 2 }}>
              <Box
                component={Link}
                href={mod.path}
                sx={{
                  p: 1.75,
                  height: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  textDecoration: 'none',
                  color: 'text.primary',
                  bgcolor: 'background.neutral',
                  border: (t) => `1px solid ${t.palette.divider}`,
                  transition: (t) =>
                    t.transitions.create(['border-color', 'box-shadow', 'transform'], {
                      duration: t.transitions.duration.shorter,
                    }),
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: `${color}.main`,
                    boxShadow: (t) => t.shadows[4],
                  },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Iconify icon={mod.icon} width={20} sx={{ color: `${color}.main` }} />
                  <Iconify
                    icon={HEALTH_ICON[mod.health]}
                    width={16}
                    sx={{ color: `${color}.main` }}
                  />
                </Stack>

                <Typography variant="subtitle2" fontWeight={700}>
                  {mod.name}
                </Typography>

                <Label color={color} variant="soft" sx={{ width: 'fit-content' }}>
                  {HEALTH_LABEL[mod.health]}
                </Label>

                <LinearProgress
                  variant="determinate"
                  value={mod.score}
                  color={color}
                  sx={{ height: 4, borderRadius: 2 }}
                />

                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  {mod.detail}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
}
