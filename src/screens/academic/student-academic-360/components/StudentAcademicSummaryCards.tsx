'use client';

import type { StudentAcademic360ListSummary } from 'src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api';

import { Stack, Tooltip } from '@mui/material';

import { StudentAcademicStatCard } from './StudentAcademicStatCard';

import type { AcademicSmartFilter } from '../listUtils';

type SummaryCard = {
  key: AcademicSmartFilter;
  label: string;
  value: string;
  helper: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
};

type StudentAcademicSummaryCardsProps = {
  summary: StudentAcademic360ListSummary;
  activeFilter: AcademicSmartFilter;
  onFilterChange: (filter: AcademicSmartFilter) => void;
};

export function StudentAcademicSummaryCards({
  summary,
  activeFilter,
  onFilterChange,
}: StudentAcademicSummaryCardsProps) {
  const cards: SummaryCard[] = [
    {
      key: 'all',
      label: 'Total Students',
      value: String(summary.totalStudents),
      helper: 'Enrolled student list',
      icon: 'mdi:account-group-outline',
      color: 'primary',
    },
    {
      key: 'needsAttention',
      label: 'Needs Attention',
      value: String(summary.needsAttention),
      helper: 'Priority review queue',
      icon: 'mdi:alert-circle-outline',
      color: 'error',
    },
    {
      key: 'lowAttendance',
      label: 'Average Attendance',
      value:
        summary.averageAttendance == null ? 'No data' : `${Math.round(summary.averageAttendance)}%`,
      helper: 'Click to show low attendance',
      icon: 'mdi:calendar-check-outline',
      color: 'info',
    },
    {
      key: 'overdueHomework',
      label: 'Homework Completion',
      value:
        summary.homeworkCompletion == null
          ? 'No data'
          : `${Math.round(summary.homeworkCompletion)}%`,
      helper: 'Click to show pending homework',
      icon: 'mdi:clipboard-text-clock-outline',
      color: 'warning',
    },
    {
      key: 'performanceDecline',
      label: 'Average Exam Score',
      value:
        summary.averageExamScore == null ? 'No data' : `${Math.round(summary.averageExamScore)}%`,
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
