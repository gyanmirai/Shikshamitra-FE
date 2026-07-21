'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Tooltip, Typography } from '@mui/material';

import { getMetricPercentage, matchesAcademicFilter } from '../listUtils';

import type { AcademicSmartFilter, StudentAcademicListItem } from '../listUtils';

type SummaryCard = {
  key: AcademicSmartFilter;
  label: string;
  value: string;
  helper: string;
  icon: string;
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
    items.map((item) => getMetricPercentage(item.attendance)).filter((value): value is number => typeof value === 'number')
  );
  const homeworkAverage = average(
    items.map((item) => getMetricPercentage(item.homework)).filter((value): value is number => typeof value === 'number')
  );
  const examAverage = average(
    items.map((item) => getMetricPercentage(item.examAverage)).filter((value): value is number => typeof value === 'number')
  );

  const cards: SummaryCard[] = [
    { key: 'all', label: 'Total Students', value: String(items.length), helper: 'Current class list', icon: 'mdi:account-group-outline' },
    {
      key: 'needsAttention',
      label: 'Needs Attention',
      value: String(items.filter((item) => matchesAcademicFilter(item, 'needsAttention')).length),
      helper: 'Priority review queue',
      icon: 'mdi:alert-circle-outline',
    },
    {
      key: 'lowAttendance',
      label: 'Average Attendance',
      value: attendanceAverage === undefined ? 'No data' : `${attendanceAverage}%`,
      helper: 'Click to show low attendance',
      icon: 'mdi:calendar-check-outline',
    },
    {
      key: 'overdueHomework',
      label: 'Homework Completion',
      value: homeworkAverage === undefined ? 'No data' : `${homeworkAverage}%`,
      helper: 'Click to show pending homework',
      icon: 'mdi:clipboard-text-clock-outline',
    },
    {
      key: 'performanceDecline',
      label: 'Average Exam Score',
      value: examAverage === undefined ? 'No data' : `${examAverage}%`,
      helper: 'Click to show decline',
      icon: 'mdi:chart-line',
    },
    {
      key: 'activeIntervention',
      label: 'Active Interventions',
      value: String(items.filter((item) => matchesAcademicFilter(item, 'activeIntervention')).length),
      helper: 'Students with support plan',
      icon: 'mdi:hand-heart-outline',
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 1 }}>
      {cards.map((card) => {
        const active = activeFilter === card.key;

        return (
          <Tooltip key={card.label} title={card.helper}>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => onFilterChange(card.key)}
              onKeyDown={(event) => event.key === 'Enter' && onFilterChange(card.key)}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                border: (theme) => `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                boxShadow: active ? 4 : 0,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon={card.icon} width={20} sx={{ color: active ? 'primary.main' : 'text.secondary' }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {card.label}
                  </Typography>
                  <Typography variant="subtitle1" noWrap>
                    {card.value}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Tooltip>
        );
      })}
    </Box>
  );
}
