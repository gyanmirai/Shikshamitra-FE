'use client';

import type { AcademicInsightMetric } from 'src/screens/academic/components/academic-insights';

import { AcademicInsights } from 'src/screens/academic/components/academic-insights';

import type { Academic360ListSummary } from '../types';
import type { AcademicSmartFilter } from '../listUtils';

type StudentAcademicSummaryCardsProps = {
  summary?: Academic360ListSummary;
  activeFilter: AcademicSmartFilter;
  onFilterChange: (filter: AcademicSmartFilter) => void;
  insightsOpen: boolean;
  onCloseInsights: () => void;
};

export function StudentAcademicSummaryCards({
  summary,
  activeFilter,
  onFilterChange,
  insightsOpen,
  onCloseInsights,
}: StudentAcademicSummaryCardsProps) {
  const attendanceAverage = summary?.averageAttendance;
  const homeworkAverage = summary?.homeworkCompletion;
  const examAverage = summary?.averageExamScore;
  const needsAttention = summary?.needsAttention ?? 0;

  const metrics: AcademicInsightMetric[] = [
    {
      id: 'all',
      label: 'Total students',
      value: summary?.totalStudents ?? 0,
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
      value: attendanceAverage == null ? 'No data' : `${Math.round(attendanceAverage)}%`,
      helper: 'Select to show low attendance',
      icon: 'mdi:calendar-check-outline',
      selected: activeFilter === 'lowAttendance',
      onClick: () => onFilterChange('lowAttendance'),
    },
    {
      id: 'homework',
      label: 'Homework completion',
      value: homeworkAverage == null ? 'No data' : `${Math.round(homeworkAverage)}%`,
      helper: 'Select to show overdue homework',
      icon: 'mdi:clipboard-text-clock-outline',
      selected: activeFilter === 'overdueHomework',
      onClick: () => onFilterChange('overdueHomework'),
    },
    {
      id: 'exam',
      label: 'Average exam score',
      value: examAverage == null ? 'No data' : `${Math.round(examAverage)}%`,
      helper: 'Select to show performance decline',
      icon: 'mdi:chart-line',
      selected: activeFilter === 'performanceDecline',
      onClick: () => onFilterChange('performanceDecline'),
    },
  ];

  return (
    <AcademicInsights
      open={insightsOpen}
      onClose={onCloseInsights}
      hideTrigger
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
