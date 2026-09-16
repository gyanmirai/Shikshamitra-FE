import type { IData } from 'src/components/customizabaleTable/types';

import { Box, Avatar, Typography } from '@mui/material';

import { readText } from '../types';
import { getMetricPercentage } from '../listUtils';

import type { Academic360Metric } from '../types';
import type { StudentAcademicListItem } from '../listUtils';

const formatMetric = (metric?: Academic360Metric, suffix = '%') => {
  const value = getMetricPercentage(metric);
  return typeof value === 'number' ? `${Math.round(value)}${suffix}` : 'No data';
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

export const StudentCell = ({ row }: { row: IData }) => {
  const item = row as StudentAcademicListItem;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar src={item.profileImageUrl} alt={item.name} sx={{ width: 36, height: 36 }}>
        {item.name.charAt(0)}
      </Avatar>
      <Box>
        <Typography variant="subtitle2">{item.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          GR No. {item.grNo} | Roll {item.rollNo}
        </Typography>
      </Box>
    </Box>
  );
};

export const AttendanceCell = ({ row }: { row: IData }) => {
  const item = row as StudentAcademicListItem;
  return (
    <MetricCell
      primary={formatMetric(item.attendance)}
      secondary={readText(item.attendance?.status, 'Attendance')}
    />
  );
};

export const HomeworkCell = ({ row }: { row: IData }) => {
  const metric = (row as StudentAcademicListItem).homework;
  if (!metric) return <MetricCell primary="No data" secondary="Setup pending" />;

  if (typeof metric.completed === 'number' && typeof metric.total === 'number') {
    return (
      <MetricCell
        primary={`${metric.completed}/${metric.total} completed`}
        secondary={`${metric.pending ?? Math.max(metric.total - metric.completed, 0)} pending`}
      />
    );
  }

  return (
    <MetricCell primary={formatMetric(metric)} secondary={readText(metric.status, 'Homework')} />
  );
};

export const ExamAverageCell = ({ row }: { row: IData }) => {
  const item = row as StudentAcademicListItem;
  return (
    <MetricCell
      primary={formatMetric(item.examAverage)}
      secondary={readText(item.examAverage?.count, 'Exams')}
    />
  );
};
