'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Stack, Typography, CardContent, LinearProgress } from '@mui/material';

import { subjectOptions, initialCoverageData } from '../lessonPlanData';

import type { CoverageRow, LessonPlanRow } from '../lessonPlanData';

type Props = {
  lessonPlans: LessonPlanRow[];
  coverageData?: CoverageRow[];
};

const statusConfig = {
  OnTrack: { color: 'success' as const, icon: 'mdi:check-circle-outline', label: 'On Track' },
  Delayed: { color: 'warning' as const, icon: 'mdi:clock-alert-outline', label: 'Delayed' },
  Critical: { color: 'error' as const, icon: 'mdi:alert-circle-outline', label: 'Critical' },
};

const CoverageTrackerTab = ({ lessonPlans, coverageData = initialCoverageData }: Props) => {
  // Compute subject-level summary from lesson plans
  const subjectSummary = subjectOptions.map((subject) => {
    const plans = lessonPlans.filter((p) => p.subjectName === subject.value);
    const avgPlanned = plans.length
      ? Math.round(plans.reduce((s, p) => s + p.plannedCompletionPercentage, 0) / plans.length)
      : 0;
    const avgActual = plans.length
      ? Math.round(plans.reduce((s, p) => s + p.actualCompletionPercentage, 0) / plans.length)
      : 0;
    const gap = avgActual - avgPlanned;
    return {
      subject: subject.label,
      plans: plans.length,
      avgPlanned,
      avgActual,
      gap,
      status: gap >= -5 ? 'OnTrack' : gap >= -20 ? 'Delayed' : 'Critical',
    };
  });

  const totalDelayed = coverageData.filter((r) => r.status !== 'OnTrack').length;
  const totalCritical = coverageData.filter((r) => r.status === 'Critical').length;

  return (
    <Stack spacing={2}>
      {/* Summary cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        }}
      >
        {[
          {
            label: 'Total Chapters Tracked',
            value: coverageData.length,
            icon: 'mdi:book-multiple-outline',
            color: 'primary',
          },
          {
            label: 'Chapters Delayed',
            value: totalDelayed,
            icon: 'mdi:clock-alert-outline',
            color: 'warning',
          },
          {
            label: 'Chapters Critical',
            value: totalCritical,
            icon: 'mdi:alert-circle-outline',
            color: 'error',
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: `${item.color}.lighter`,
                  color: `${item.color}.main`,
                  flexShrink: 0,
                }}
              >
                <Iconify icon={item.icon} width={22} />
              </Box>
              <Box>
                <Typography variant="h4">{item.value}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Subject-level visual progress bars */}
      <Card sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Subject-wise Coverage Overview
        </Typography>
        <Stack spacing={2}>
          {subjectSummary.map((item) => {
            const cfg = statusConfig[item.status as keyof typeof statusConfig];
            return (
              <Box key={item.subject}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={500}>
                      {item.subject}
                    </Typography>
                    <Label
                      color={cfg.color}
                      variant="soft"
                      startIcon={<Iconify icon={cfg.icon} width={12} />}
                    >
                      {cfg.label}
                    </Label>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption" color="text.secondary">
                      Planned: {item.avgPlanned}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Actual: {item.avgActual}%
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={item.gap < 0 ? 'error.main' : 'success.main'}
                    >
                      Gap: {item.gap > 0 ? '+' : ''}
                      {item.gap}%
                    </Typography>
                  </Stack>
                </Stack>
                {/* Stacked progress bar: planned (lighter) vs actual (solid) */}
                <Box
                  sx={{ position: 'relative', height: 10, borderRadius: 1, bgcolor: 'grey.200' }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${item.avgPlanned}%`,
                      bgcolor: 'primary.lighter',
                      borderRadius: 1,
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${item.avgActual}%`,
                      bgcolor:
                        cfg.color === 'success'
                          ? 'success.main'
                          : cfg.color === 'warning'
                            ? 'warning.main'
                            : 'error.main',
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Card>

      {/* Detailed chapter table */}
      <CustomizableTable
        tableId="coverage-tracker-table"
        tableTitle="Chapter-wise Planned vs Actual Coverage"
        data={coverageData}
        columns={[
          { id: 'subject', label: 'Subject', minWidth: 140, sticky: true },
          { id: 'chapter', label: 'Chapter', minWidth: 180 },
          { id: 'teacher', label: 'Teacher', minWidth: 150 },
          {
            id: 'plannedPercentage',
            label: 'Planned %',
            filterType: 'number' as const,
            minWidth: 110,
            render: (v: any) => (
              <Stack spacing={0.25}>
                <Typography variant="body2">{v}%</Typography>
                <LinearProgress
                  variant="determinate"
                  value={v}
                  sx={{ height: 4, borderRadius: 1 }}
                />
              </Stack>
            ),
          },
          {
            id: 'actualPercentage',
            label: 'Actual %',
            filterType: 'number' as const,
            minWidth: 110,
            render: (v: any) => (
              <Stack spacing={0.25}>
                <Typography variant="body2">{v}%</Typography>
                <LinearProgress
                  variant="determinate"
                  value={v}
                  color="success"
                  sx={{ height: 4, borderRadius: 1 }}
                />
              </Stack>
            ),
          },
          {
            id: 'gap',
            label: 'Gap',
            filterType: 'number' as const,
            minWidth: 100,
            render: (v: any) => (
              <Typography
                variant="body2"
                fontWeight={600}
                color={v < 0 ? 'error.main' : 'success.main'}
              >
                {v > 0 ? '+' : ''}
                {v}%
              </Typography>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            minWidth: 120,
            render: (v: any) => {
              const cfg = statusConfig[v as keyof typeof statusConfig];
              return (
                <Label color={cfg?.color || 'default'} variant="soft">
                  {cfg?.label || v}
                </Label>
              );
            },
          },
          {
            id: 'totalLessons',
            label: 'Total Lessons',
            filterType: 'number' as const,
            minWidth: 120,
          },
          {
            id: 'completedLessons',
            label: 'Completed',
            filterType: 'number' as const,
            minWidth: 110,
          },
          { id: 'missedLessons', label: 'Missed', filterType: 'number' as const, minWidth: 90 },
        ]}
      />
    </Stack>
  );
};

export default CoverageTrackerTab;
