'use client';

import React from 'react';
import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Card, Grid, Stack, Button, Typography } from '@mui/material';

import QuickActions from './Components/QuickActions';
import OperationalStatus from './Components/OperationalStatus';
import ConfigurationStatus from './Components/ConfigurationStatus';
import SubjectPassFailChart from './Components/SubjectPassFailChart';
import PlannedVsActualProgressChart from './Components/PlannedVsActualProgressChart';

const metricColor = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  primary: '#2563EB',
};

type MetricColorKey = keyof typeof metricColor;

type AcademicMetric = {
  title: string;
  value: string | number;
  icon: string;
  color: MetricColorKey;
  href?: string;
  helper?: string;
};

const MetricCard = ({ title, value, icon, color = 'info', href, helper }: AcademicMetric) => (
  <Card
    component={href ? RouterLink : 'div'}
    href={href || undefined}
    sx={{
      p: 0,
      minHeight: 92,
      textDecoration: 'none',
      color: 'text.primary',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      transition: (theme) =>
        theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
          duration: theme.transitions.duration.shorter,
        }),
      '&:hover': href
        ? {
            transform: 'translateY(-2px)',
            borderColor: metricColor[color],
            boxShadow: (theme) => theme.shadows[4],
          }
        : undefined,
    }}
  >
    <Box sx={{ width: 4, alignSelf: 'stretch', bgcolor: metricColor[color], flexShrink: 0 }} />
    <Box
      sx={{
        p: 1.5,
        gap: 1.25,
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, lineHeight: 1.2, display: 'block' }}
          noWrap
        >
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.25, mb: 0.25, lineHeight: 1.05 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
            {helper}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: metricColor[color],
          bgcolor: `${metricColor[color]}14`,
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
    </Box>
  </Card>
);

const METRICS: AcademicMetric[] = [
  {
    title: 'Total Students',
    value: '1,248',
    icon: 'solar:users-group-two-rounded-bold',
    color: 'primary',
    helper: '6 active classes',
  },
  {
    title: 'Total Teachers',
    value: '64',
    icon: 'solar:graduation-cap-bold',
    color: 'success',
    helper: '48 teaching staff',
  },
  {
    title: 'Active Timetables',
    value: '18',
    icon: 'solar:calendar-bold',
    color: 'info',
    href: academicPaths.timetable.management,
    helper: '3 pending setup',
  },
  {
    title: 'Pending Grade Entries',
    value: '18',
    icon: 'solar:document-text-bold',
    color: 'error',
    href: academicPaths.examination.recordMarks,
    helper: 'Across 4 classes',
  },
  {
    title: 'Pending Evaluations',
    value: '24',
    icon: 'solar:notebook-bold',
    color: 'warning',
    href: academicPaths.homework.assessment,
    helper: '10 homework, 14 assignments',
  },
  {
    title: 'Upcoming Exams',
    value: '6',
    icon: 'solar:medal-star-linear',
    color: 'info',
    href: academicPaths.examination.schedule,
    helper: '2 this week',
  },
  {
    title: 'Curriculum Completion',
    value: '75%',
    icon: 'solar:checklist-minimalistic-broken',
    color: 'success',
    href: academicPaths.curriculum.chaptersManagement,
    helper: '25% remaining',
  },
  {
    title: 'System Alerts',
    value: '6',
    icon: 'solar:bell-bing-bold',
    color: 'error',
    helper: '2 critical',
  },
];

const AcademicDashboardScreen = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>
    {/* Header â€” mirrors HrDashboardPreviewShell layout */}
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'flex-start' }}
      justifyContent="space-between"
      spacing={1}
    >
      <Box>
        <Typography variant="h4">Academic Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Academic Year 2025-26
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" justifyContent="flex-end">
        <Button
          component={Link}
          href={academicPaths.timetable.management}
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="solar:calendar-linear" />}
          sx={{ minHeight: 34 }}
        >
          Timetables
        </Button>
        <Button
          component={Link}
          href={academicPaths.examination.schedule}
          variant="contained"
          size="small"
          startIcon={<Iconify icon="solar:clipboard-text-linear" />}
          sx={{ minHeight: 34 }}
        >
          Schedule Exam
        </Button>
      </Stack>
    </Stack>

    {/* Row 1  KPI Metric Cards */}
    <Grid container spacing={1}>
      {METRICS.map((metric) => (
        <Grid key={metric.title} size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard {...metric} />
        </Grid>
      ))}
    </Grid>

    <QuickActions />

    {/* Row 2  Operational Status | Pending Action Center */}
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <OperationalStatus />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ConfigurationStatus />
      </Grid>
    </Grid>

    {/* Row 3 - Charts */}
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <SubjectPassFailChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PlannedVsActualProgressChart />
      </Grid>
    </Grid>

    {/* Row 4 - Quick Actions */}
  </Box>
);

export default AcademicDashboardScreen;
