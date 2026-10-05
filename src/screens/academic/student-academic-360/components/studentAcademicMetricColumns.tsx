import type { IColumn } from 'src/components/customizabaleTable/types';

import { Box, Typography } from '@mui/material';

import { readText } from '../types';
import { getMetricPercentage } from '../listUtils';

import type { Academic360Metric } from '../types';
import type { StudentAcademicListItem } from '../listUtils';

const formatMetric = (metric?: Academic360Metric, suffix = '%') => {
  const value = getMetricPercentage(metric);
  return typeof value === 'number' ? `${Math.round(value)}${suffix}` : 'No data';
};

const formatHomework = (metric?: Academic360Metric) => {
  if (!metric) return { primary: 'No data', secondary: 'Setup pending' };
  if (typeof metric.completed === 'number' && typeof metric.total === 'number') {
    return {
      primary: `${metric.completed}/${metric.total} completed`,
      secondary: `${metric.pending ?? Math.max(metric.total - metric.completed, 0)} pending`,
    };
  }
  return { primary: formatMetric(metric), secondary: readText(metric.status, 'Homework') };
};

const MetricCell = ({ primary, secondary }: { primary: string; secondary: string }) => (
  <Box>
    <Typography variant="body2" fontWeight={600}>
      {primary}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {secondary}
    </Typography>
  </Box>
);

export const studentAcademicMetricColumns: IColumn[] = [
  {
    id: 'attendance.percentage',
    label: 'Attendance',
    filterType: 'number',
    render: (_value, row) => {
      const item = row as StudentAcademicListItem;
      return (
        <MetricCell
          primary={formatMetric(item.attendance)}
          secondary={readText(item.attendance?.status, 'Attendance')}
        />
      );
    },
  },
  {
    id: 'homework.percentage',
    label: 'Homework',
    filterType: 'number',
    render: (_value, row) => {
      const item = row as StudentAcademicListItem;
      const homework = formatHomework(item.homework);
      return <MetricCell primary={homework.primary} secondary={homework.secondary} />;
    },
  },
  {
    id: 'examAverage.percentage',
    label: 'Exam Average',
    filterType: 'number',
    render: (_value, row) => {
      const item = row as StudentAcademicListItem;
      return (
        <MetricCell
          primary={formatMetric(item.examAverage)}
          secondary={readText(item.examAverage?.count, 'Exams')}
        />
      );
    },
  },
];
