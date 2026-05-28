'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Card, Grid, Stack, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type ConfigStatus = 'configured' | 'active' | 'missing' | 'complete' | 'partial';

interface ConfigItem {
  label: string;
  status: ConfigStatus;
  path: string;
  icon: string;
}

const CONFIG_ITEMS: ConfigItem[] = [
  {
    label: 'Curriculum',
    status: 'active',
    path: academicPaths.curriculum.subjectsAssignment,
    icon: 'fluent:book-24-regular',
  },
  {
    label: 'Subjects Creation',
    status: 'configured',
    path: academicPaths.curriculum.settings.subjectsCreation,
    icon: 'solar:book-bold',
  },
  {
    label: 'Elective Groups',
    status: 'missing',
    path: academicPaths.curriculum.settings.electiveGroupCreation,
    icon: 'solar:users-group-two-rounded-bold',
  },
  {
    label: 'Timetable',
    status: 'active',
    path: academicPaths.timetable.management,
    icon: 'solar:calendar-bold',
  },
  {
    label: 'Weekly Lectures',
    status: 'configured',
    path: academicPaths.timetable.settings.weeklyLectures,
    icon: 'solar:calendar-date-bold',
  },
  {
    label: 'Lecture Slots',
    status: 'missing',
    path: academicPaths.timetable.settings.lectureSlots,
    icon: 'solar:calendar-date-bold',
  },
  {
    label: 'Exam Types',
    status: 'configured',
    path: academicPaths.examination.settings.examTypes,
    icon: 'solar:document-bold',
  },
  {
    label: 'Grade Scaling',
    status: 'active',
    path: academicPaths.examination.settings.gradeScaling,
    icon: 'solar:chart-square-bold',
  },
  {
    label: 'Homework Types',
    status: 'complete',
    path: academicPaths.homework.settings.homeworkTypes,
    icon: 'solar:notebook-bold',
  },
  {
    label: 'Assignment Types',
    status: 'partial',
    path: academicPaths.homework.settings.assignmentTypes,
    icon: 'solar:clipboard-text-bold',
  },
];

type LabelColor = 'info' | 'success' | 'error' | 'warning';
const STATUS_COLOR: Record<ConfigStatus, LabelColor> = {
  configured: 'info',
  active: 'success',
  missing: 'error',
  complete: 'success',
  partial: 'warning',
};

// ----------------------------------------------------------------------

export default function ConfigurationStatus() {
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
        title="Configuration Status"
        subheader="Module setup and configuration health"
        sx={{ p: 0, mb: 1.5 }}
      />

      <Grid container spacing={1}>
        {CONFIG_ITEMS.map((item) => {
          const color = STATUS_COLOR[item.status];
          return (
            <Grid key={item.label} size={{ xs: 6 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                onClick={() => router.push(item.path)}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,

                  border: (t) => `1px solid ${t.palette.divider}`,
                  cursor: 'pointer',
                  transition: (t) => t.transitions.create('box-shadow'),
                  '&:hover': { boxShadow: (t) => t.shadows[2] },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    color: `${color}.main`,
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={item.icon} width={16} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={600} noWrap display="block">
                    {item.label}
                  </Typography>
                  <Label color={color} variant="soft" sx={{ height: 18, fontSize: '0.6rem' }}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Label>
                </Box>
                <Iconify
                  icon="solar:arrow-right-linear"
                  width={14}
                  sx={{ color: 'text.disabled', flexShrink: 0 }}
                />
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
}
