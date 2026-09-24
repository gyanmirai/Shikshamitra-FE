'use client';

import type { AcademicInsightMetric } from 'src/screens/academic/components/academic-insights';

import { AcademicInsights } from 'src/screens/academic/components/academic-insights';

import { getMetricPercentage, matchesAcademicFilter } from '../listUtils';

import type { AcademicSmartFilter, StudentAcademicListItem } from '../listUtils';

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
  const needsAttention = items.filter((item) =>
    matchesAcademicFilter(item, 'needsAttention')
  ).length;

  const metrics: AcademicInsightMetric[] = [
    {
      id: 'all',
      label: 'Total students',
      value: items.length,
      helper: 'Enrolled in the current scope',
      icon: 'mdi:account-group-outline',
      selected: activeFilter === 'all',
      onClick: () => onFilterChange('all'),
    },
    {
      id: 'needs-attention',
      label: 'Needs attention',
      value: needsAttention,
      helper: 'Priority review queue',
      icon: 'mdi:alert-circle-outline',
      selected: activeFilter === 'needsAttention',
      onClick: () => onFilterChange('needsAttention'),
    },
    {
      id: 'attendance',
      label: 'Average attendance',
      value: attendanceAverage === undefined ? 'No data' : `${attendanceAverage}%`,
      helper: 'Select to show low attendance',
      icon: 'mdi:calendar-check-outline',
      selected: activeFilter === 'lowAttendance',
      onClick: () => onFilterChange('lowAttendance'),
    },
    {
      id: 'homework',
      label: 'Homework completion',
      value: homeworkAverage === undefined ? 'No data' : `${homeworkAverage}%`,
      helper: 'Select to show overdue homework',
      icon: 'mdi:clipboard-text-clock-outline',
      selected: activeFilter === 'overdueHomework',
      onClick: () => onFilterChange('overdueHomework'),
    },
    {
      id: 'exam',
      label: 'Average exam score',
      value: examAverage === undefined ? 'No data' : `${examAverage}%`,
      helper: 'Select to show performance decline',
      icon: 'mdi:chart-line',
      selected: activeFilter === 'performanceDecline',
      onClick: () => onFilterChange('performanceDecline'),
    },
  ];

  return (
    <AcademicInsights
      title="Student academic insights"
      description="Cohort health, engagement and performance for the selected class and division."
      metrics={metrics}
      chart={{
        title: 'Cohort performance',
        description: 'Average attendance, homework completion and exam performance.',
        categories: ['Attendance', 'Homework', 'Exam score'],
        values: [attendanceAverage ?? 0, homeworkAverage ?? 0, examAverage ?? 0],
        seriesName: 'Average',
        valueSuffix: '%',
        max: 100,
      }}
      focus={{
        title:
          needsAttention > 0 ? `${needsAttention} students need attention` : 'No priority concerns',
        description:
          needsAttention > 0
            ? 'Open the priority metric to filter the table and review the students with the strongest combined risk signals.'
            : 'The current cohort has no students in the combined priority queue.',
      }}
    />
  );
}
