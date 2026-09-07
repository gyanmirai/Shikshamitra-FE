'use client';

import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Card,
  Stack,
  Typography,
  LinearProgress,
} from '@mui/material';

import { Academic360EmptyState } from './Academic360EmptyState';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { Academic360SubjectPerformance } from '../types';

type SubjectPerformanceCardProps = {
  subjectPerformance?: Academic360SubjectPerformance[];
};

const getStatusTier = (average: number) => {
  if (average >= 75) {
    return { label: 'Strong', color: 'success' as const, barColor: 'success' as const };
  }
  if (average >= 60) {
    return { label: 'Good', color: 'info' as const, barColor: 'primary' as const };
  }
  if (average >= 40) {
    return { label: 'Average', color: 'warning' as const, barColor: 'warning' as const };
  }
  return { label: 'Needs Attention', color: 'error' as const, barColor: 'error' as const };
};

const getSubjectIcon = (name?: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('math')) return 'mdi:calculator-variant-outline';
  if (n.includes('sci') || n.includes('physic') || n.includes('chem') || n.includes('bio')) return 'mdi:flask-outline';
  if (n.includes('eng') || n.includes('lang') || n.includes('hindi') || n.includes('marathi') || n.includes('sanskrit')) return 'mdi:book-open-page-variant-outline';
  if (n.includes('hist') || n.includes('geo') || n.includes('social') || n.includes('civic')) return 'mdi:earth';
  if (n.includes('pt') || n.includes('sport') || n.includes('phys')) return 'mdi:run-fast';
  if (n.includes('art') || n.includes('craft') || n.includes('music')) return 'mdi:palette-outline';
  if (n.includes('comp') || n.includes('code') || n.includes('it')) return 'mdi:laptop';
  return 'mdi:book-outline';
};

export function SubjectPerformanceCard({ subjectPerformance = [] }: SubjectPerformanceCardProps) {
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'subjectName',
        label: 'Subject',
        sticky: true,
        minWidth: 160,
        render: (_value, row) => (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) => `${theme.palette.grey[500]}12`,
                color: 'text.secondary',
                flexShrink: 0,
              }}
            >
              <Iconify icon={getSubjectIcon(row.subjectName)} width={15} />
            </Box>
            <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ fontSize: 13 }}>
              {row.subjectName}
            </Typography>
            {row.latestGrade && (
              <Label color="default" variant="soft" sx={{ height: 18, fontSize: 10, fontWeight: 700 }}>
                Gr. {row.latestGrade}
              </Label>
            )}
          </Stack>
        ),
      },
      {
        id: 'averagePercentage',
        label: 'Average',
        minWidth: 130,
        render: (_value, row) => {
          const avg = Math.round(row.averagePercentage || 0);
          const tier = getStatusTier(avg);
          return (
            <Stack spacing={0.5} sx={{ minWidth: 90 }}>
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12 }}>
                {avg}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={avg}
                color={tier.barColor}
                sx={{
                  height: 4,
                  borderRadius: 1,
                  bgcolor: (theme) => `${theme.palette.grey[500]}1A`,
                }}
              />
            </Stack>
          );
        },
      },
      {
        id: 'examCount',
        label: 'Assessments',
        align: 'center',
        minWidth: 90,
        render: (_value, row) => (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, fontWeight: 500 }}>
            {row.examCount || 0}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'right',
        minWidth: 100,
        render: (_value, row) => {
          const avg = Math.round(row.averagePercentage || 0);
          const tier = getStatusTier(avg);
          return (
            <Label color={tier.color} variant="soft" sx={{ height: 20, fontSize: 10, fontWeight: 600 }}>
              {tier.label}
            </Label>
          );
        },
      },
    ],
    []
  );

  return (
    <Card
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        height: '100%',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={1.25} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.25,
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) => `${theme.palette.primary.main}14`,
                color: 'primary.main',
              }}
            >
              <Iconify icon="mdi:chart-box-outline" width={18} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Subject Performance
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Cumulative averages and assessment counts across subjects
              </Typography>
            </Box>
          </Stack>

          {subjectPerformance.length > 0 && (
            <Label color="default" variant="soft" sx={{ fontWeight: 600, fontSize: 11, height: 22 }}>
              {subjectPerformance.length} {subjectPerformance.length === 1 ? 'Subject' : 'Subjects'}
            </Label>
          )}
        </Stack>

        {subjectPerformance.length > 0 ? (
          <Box
            sx={{
              flex: 1,
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              '& .MuiCard-root': {
                border: 'none',
                boxShadow: 'none',
                height: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <CustomizableTable
              tableId="student-academic-360-subject-performance"
              columns={columns}
              data={subjectPerformance}
              isPagination={false}
              isFilter={false}
              isSearch={false}
              isShowedDense={false}
              tableContainerProps={{ sx: { flex: 1, minHeight: 120 } }}
              noDataText={
                <Academic360EmptyState
                  icon="mdi:chart-box-outline"
                  color="info"
                  title="No subject assessment data yet"
                  description="Subject-wise performance averages and grade distributions will appear here after marks are evaluated."
                  compact
                />
              }
            />
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Academic360EmptyState
              icon="mdi:chart-box-outline"
              color="info"
              title="No subject assessment data yet"
              description="Subject-wise performance averages and grade distributions will appear here after marks are evaluated."
              compact
            />
          </Box>
        )}
      </Stack>
    </Card>
  );
}
