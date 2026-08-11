'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Tooltip, Typography } from '@mui/material';

import { getMetricPercentage, matchesAcademicFilter } from '../listUtils';

import type { AcademicSmartFilter, StudentAcademicListItem } from '../listUtils';

type SummaryCard = {
  key: AcademicSmartFilter;
  label: string;
  value: string;
  helper: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
};

type StudentAcademicSummaryCardsProps = {
  items: StudentAcademicListItem[];
  activeFilter: AcademicSmartFilter;
  onFilterChange: (filter: AcademicSmartFilter) => void;
};

const average = (values: number[]) => {
  if (!values.length) return undefined;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

export function StudentAcademicSummaryCards({
  items,
  activeFilter,
  onFilterChange,
}: StudentAcademicSummaryCardsProps) {
  const attendanceAverage = average(
    items
      .map((item) => getMetricPercentage(item.attendance))
      .filter((value): value is number => typeof value === 'number')
  );
  const homeworkAverage = average(
    items
      .map((item) => getMetricPercentage(item.homework))
      .filter((value): value is number => typeof value === 'number')
  );
  const examAverage = average(
    items
      .map((item) => getMetricPercentage(item.examAverage))
      .filter((value): value is number => typeof value === 'number')
  );

  const cards: SummaryCard[] = [
    {
      key: 'all',
      label: 'Total Students',
      value: String(items.length),
      helper: 'Enrolled student list',
      icon: 'mdi:account-group-outline',
      color: 'primary',
    },
    {
      key: 'needsAttention',
      label: 'Needs Attention',
      value: String(items.filter((item) => matchesAcademicFilter(item, 'needsAttention')).length),
      helper: 'Priority review queue',
      icon: 'mdi:alert-circle-outline',
      color: 'error',
    },
    {
      key: 'lowAttendance',
      label: 'Average Attendance',
      value: attendanceAverage === undefined ? 'No data' : `${attendanceAverage}%`,
      helper: 'Click to show low attendance',
      icon: 'mdi:calendar-check-outline',
      color: 'info',
    },
    {
      key: 'overdueHomework',
      label: 'Homework Completion',
      value: homeworkAverage === undefined ? 'No data' : `${homeworkAverage}%`,
      helper: 'Click to show pending homework',
      icon: 'mdi:clipboard-text-clock-outline',
      color: 'warning',
    },
    {
      key: 'performanceDecline',
      label: 'Average Exam Score',
      value: examAverage === undefined ? 'No data' : `${examAverage}%`,
      helper: 'Click to show decline',
      icon: 'mdi:chart-line',
      color: 'success',
    },
    {
      key: 'activeIntervention',
      label: 'Active Interventions',
      value: String(
        items.filter((item) => matchesAcademicFilter(item, 'activeIntervention')).length
      ),
      helper: 'Students with support plan',
      icon: 'mdi:hand-heart-outline',
      color: 'info',
    },
  ];

  return (
    <Grid container spacing={1} sx={{ mb: 1 }}>
      {cards.map((card) => {
        const active = activeFilter === card.key;

        return (
          <Grid key={card.key} size={{ xs: 6, sm: 4, md: 2 }}>
            <Tooltip title={card.helper}>
              <Card
                role="button"
                tabIndex={0}
                onClick={() => onFilterChange(card.key)}
                onKeyDown={(event) => event.key === 'Enter' && onFilterChange(card.key)}
                sx={{
                  p: 1.75,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadows-3)',
                  transition: 'all 0.2s ease-in-out',
                  ...(active && {
                    border: (theme) => `2px solid ${theme.palette[card.color].main}`,
                    bgcolor: (theme) =>
                      `color-mix(in srgb, ${theme.palette[card.color].main} 8%, transparent)`,
                  }),
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadows-8)',
                  },
                }}
              >
                {/* Colored icon badge */}
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    bgcolor: (theme) =>
                      `color-mix(in srgb, ${theme.palette[card.color].main} 14%, transparent)`,
                    color: `${card.color}.main`,
                  }}
                >
                  <Iconify icon={card.icon} width={20} />
                </Box>

                {/* Value above label */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700} noWrap>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {card.label}
                  </Typography>
                </Box>
              </Card>
            </Tooltip>
          </Grid>
        );
      })}
    </Grid>
  );
}
