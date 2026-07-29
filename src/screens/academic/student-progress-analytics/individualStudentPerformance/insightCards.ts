import type { Academic360Response } from 'src/screens/academic/student-academic-360/types';

import { formatPercentage, getMetricPercentage, getLearningCompletion } from './utils';

import type { InsightCard } from './components/Student360InsightCards';

export const buildInsightCards = (data?: Academic360Response): InsightCard[] => {
  const attendancePercentage = getMetricPercentage(data?.student?.attendance);
  const learningCompletion = getLearningCompletion(data);
  const subjectAverage =
    data?.subjectPerformance && data.subjectPerformance.length > 0
      ? Math.round(
          data.subjectPerformance.reduce(
            (total, subject) => total + (subject.averagePercentage || 0),
            0
          ) / data.subjectPerformance.length
        )
      : null;

  return [
    {
      label: 'Academic Health',
      value:
        typeof data?.academicHealth?.score === 'number' ? `${data.academicHealth.score}/100` : '-',
      helper: data?.academicHealth?.status || 'Insufficient data',
      icon: 'mdi:heart-pulse',
      color: 'primary',
    },
    {
      label: 'Attendance',
      value: formatPercentage(attendancePercentage ?? data?.attendance?.percentage ?? null),
      helper: `${data?.attendance?.presentDays || 0} present / ${data?.attendance?.absentDays || 0} absent`,
      icon: 'mdi:calendar-check-outline',
      color: 'success',
    },
    {
      label: 'Learning Tasks',
      value: formatPercentage(learningCompletion),
      helper: `${data?.learningTasks?.pending || 0} pending, ${data?.learningTasks?.late || 0} late`,
      icon: 'mdi:clipboard-text-outline',
      color: 'warning',
    },
    {
      label: 'Subject Average',
      value: formatPercentage(subjectAverage),
      helper: `${data?.subjectPerformance?.length || 0} subjects tracked`,
      icon: 'mdi:chart-line',
      color: 'info',
    },
  ];
};
