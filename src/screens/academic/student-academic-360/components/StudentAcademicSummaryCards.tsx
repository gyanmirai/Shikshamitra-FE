'use client';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
import { forwardRef } from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';

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

const StudentAcademicStatCard = forwardRef<
  HTMLButtonElement,
  Omit<SummaryCard, 'key' | 'helper'> & { selected: boolean; onClick: () => void }
>(function StudentAcademicStatCard({ label, value, icon, color, selected, onClick }, ref) {
  return (
    <Box
      ref={ref}
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        flex: '1 1 180px',
        minWidth: { xs: 160, md: 0 },
        p: 1.5,
        border: '1px solid',
        borderColor: selected ? `${color}.main` : 'divider',
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        color: 'text.primary',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: selected ? (theme) => `0 0 0 1px ${theme.palette[color].main}` : 'none',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: `${color}.main`, transform: 'translateY(-1px)' },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.25,
            display: 'grid',
            placeItems: 'center',
            bgcolor: (theme) => varAlpha(theme.vars.palette[color].mainChannel, 0.12),
            color: `${color}.main`,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700} lineHeight={1}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block" mt={0.5}>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
});

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
  ];

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
      {cards.map((card) => {
        const active = activeFilter === card.key;

        return (
          <Tooltip key={card.key} title={card.helper}>
            <StudentAcademicStatCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
              selected={active}
              onClick={() => onFilterChange(card.key)}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
}
