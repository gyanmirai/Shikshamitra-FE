'use client';

import React from 'react';
import {
  Box,
  Card,
  Chip,
  Avatar,
  Button,
  Tooltip,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { readText } from '../types';
import { getMetricPercentage, normalizeAcademicStudent } from '../listUtils';

import type { Academic360Metric, Academic360StudentRow } from '../types';
import type { StudentAcademicListItem } from '../listUtils';

type StudentAcademic360TableProps = {
  students: Academic360StudentRow[];
  isLoading: boolean;
  isError: boolean;
  hasDivision: boolean;
  activeFilterLabel?: string;
  onOpenStudent: (student: Academic360StudentRow) => void;
  onRetry: () => void;
};

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

const formatLastUpdated = (value?: string) => {
  if (!value) return 'No data';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const healthColor = (status: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
  const normalized = status.toLowerCase();
  if (normalized.includes('track')) return 'success';
  if (normalized.includes('improving')) return 'info';
  if (normalized.includes('support')) return 'error';
  if (normalized.includes('attention')) return 'warning';
  return 'default';
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

export function StudentAcademic360Table({
  students,
  isLoading,
  isError,
  hasDivision,
  activeFilterLabel,
  onOpenStudent,
  onRetry,
}: StudentAcademic360TableProps) {
  const items = students.map(normalizeAcademicStudent);

  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Student',
      sticky: true,
      stickyPosition: 'left' as const,
      minWidth: 280,
      render: (value: any, row: any) => {
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
      },
    },
    {
      id: 'attendance.percentage',
      label: 'Attendance',
      filterType: 'number',
      render: (value: any, row: any) => {
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
      render: (value: any, row: any) => {
        const item = row as StudentAcademicListItem;
        const homework = formatHomework(item.homework);
        return <MetricCell primary={homework.primary} secondary={homework.secondary} />;
      },
    },
    {
      id: 'examAverage.percentage',
      label: 'Exam Average',
      filterType: 'number',
      render: (value: any, row: any) => {
        const item = row as StudentAcademicListItem;
        return (
          <MetricCell
            primary={formatMetric(item.examAverage)}
            secondary={readText(item.examAverage?.count, 'Exams')}
          />
        );
      },
    },
    {
      id: 'trend',
      label: 'Trend',
      render: (value: any, row: any) => {
        const item = row as StudentAcademicListItem;
        return (
          <Chip
            size="small"
            variant="soft"
            icon={<Iconify icon="mdi:trending-up" />}
            label={item.trend}
          />
        );
      },
    },
    {
      id: 'academicHealth',
      label: 'Academic Health',
      render: (value: any, row: any) => {
        const item = row as StudentAcademicListItem;
        return (
          <Tooltip
            title={item.academicHealthReasons.join(', ') || 'Open 360 for detailed evidence'}
          >
            <Chip
              size="small"
              color={healthColor(item.academicHealth)}
              variant="soft"
              label={item.academicHealth}
            />
          </Tooltip>
        );
      },
    },
    {
      id: 'alertCount',
      label: 'Alerts',
      filterType: 'number',
      render: (value: any, row: any) => {
        const item = row as StudentAcademicListItem;
        const alerts = item.alertCount ?? 0;
        return (
          <Chip
            size="small"
            color={alerts > 0 ? 'warning' : 'default'}
            variant="soft"
            label={alerts > 0 ? `${alerts} alerts` : 'No alerts'}
          />
        );
      },
    },
    {
      id: 'lastUpdatedAt',
      label: 'Last Updated',
      filterType: 'date',
      render: (value: any, row: any) => {
        const item = row as StudentAcademicListItem;
        return <Box sx={{ fontSize: '13px' }}>{formatLastUpdated(item.lastUpdatedAt)}</Box>;
      },
    },
    {
      id: 'action',
      label: 'Action',
      align: 'left' as const,
      isSort: false,
      sticky: true,
      // stickyPosition: 'left' as const,
      isFilter: false,
      excludeFromExport: true,
      render: (value: any, row: any) => {
        const item = row as StudentAcademicListItem;
        return (
          <Tooltip title="Open Academic 360">
            <IconButton
              size="small"
              onClick={() => onOpenStudent(item.student)}
              disabled={!item.studentId}
            >
              <Iconify icon="mdi:eye" />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{ minHeight: 300, display: 'grid', placeItems: 'center', px: 2, textAlign: 'center' }}
      >
        <Box>
          <Iconify icon="mdi:cloud-alert-outline" width={42} sx={{ color: 'error.main', mb: 1 }} />
          <Typography variant="subtitle1">Student data could not be loaded.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Your selected filters have been preserved.
          </Typography>
          <Button size="small" variant="outlined" sx={{ mt: 1.5 }} onClick={onRetry}>
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (!hasDivision || students.length === 0) {
    return (
      <Box
        sx={{ minHeight: 300, display: 'grid', placeItems: 'center', px: 2, textAlign: 'center' }}
      >
        <Box>
          <Iconify
            icon="mdi:account-search-outline"
            width={42}
            sx={{ color: 'text.disabled', mb: 1 }}
          />
          <Typography variant="subtitle1">
            {!hasDivision ? 'Select class and division' : 'No students found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {!hasDivision
              ? 'Students will appear here after both filters are selected.'
              : activeFilterLabel && activeFilterLabel !== 'all'
                ? `No students match the ${activeFilterLabel} filter.`
                : 'Students will appear here after they are enrolled and assigned to this class.'}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <CustomizableTable
      tableId="student-academic-360-table"
      columns={columns}
      data={items}
      isLoading={isLoading}

      isShowedDense
      defaultRowsPerPage={10}
    />
  );
}
