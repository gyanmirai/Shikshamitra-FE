'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Chip,
  Stack,
  Avatar,
  Button,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';

import { readText } from '../types';
import { NotifyParentDialog } from './NotifyParentDialog';
import { getMetricPercentage, normalizeAcademicStudent } from '../listUtils';

import type { StudentAcademicListItem } from '../listUtils';
import type { Academic360Metric, Academic360StudentRow } from '../types';

type StudentAcademic360TableProps = {
  students: Academic360StudentRow[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  searchTerm: string;
  isLoading: boolean;
  isError: boolean;
  isReady: boolean;
  activeFilterLabel?: string;
  onOpenStudent: (student: Academic360StudentRow) => void;
  onRetry: () => void;
  onPagination: (page: number, rowsPerPage: number) => void;
  onSearch: (searchTerm: string) => void;
  onSort: (
    column: string,
    sorts: Array<{ column: string; direction: 'asc' | 'desc' }>
  ) => void;
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
  totalCount,
  page,
  rowsPerPage,
  searchTerm,
  isLoading,
  isError,
  isReady,
  activeFilterLabel,
  onOpenStudent,
  onRetry,
  onPagination,
  onSearch,
  onSort,
}: StudentAcademic360TableProps) {
  const items = students.map(normalizeAcademicStudent);
  const [notifyStudent, setNotifyStudent] = useState<Academic360StudentRow | null>(null);

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
      render: (_value: any, row: any) => {
        const item = row as StudentAcademicListItem;
        const normalized = (item.trend || '').toLowerCase();
        const isUp = normalized.includes('improv') || normalized.includes('up');
        const isDown = normalized.includes('declin') || normalized.includes('down') || normalized.includes('drop');
        const trendIcon = isUp ? 'mdi:trending-up' : isDown ? 'mdi:trending-down' : 'mdi:trending-neutral';
        const trendCol = isUp ? 'success' : isDown ? 'error' : 'default';
        return (
          <Chip
            size="small"
            variant="soft"
            color={trendCol as any}
            icon={<Iconify icon={trendIcon} />}
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
      label: 'Actions',
      align: 'left' as const,
      isSort: false,
      sticky: true,
      stickyPosition: 'right' as const,
      isFilter: false,
      excludeFromExport: true,
      render: (_value: any, row: any) => {
        const item = row as StudentAcademicListItem;
        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Notify Parent">
              <IconButton
                size="small"
                color="warning"
                onClick={() => setNotifyStudent(item.student)}
                disabled={!item.studentId}
              >
                <Iconify icon="mdi:bell-outline" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open Academic 360">
              <IconButton
                size="small"
                onClick={() => onOpenStudent(item.student)}
                disabled={!item.studentId}
              >
                <Iconify icon="mdi:eye" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

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

  if (!isReady) {
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
            Select academic year, board and medium
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Students will appear after the academic context is selected.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <CustomizableTable
        tableId="student-academic-360-table"
        columns={columns}
        data={items}
        isLoading={isLoading}
        isShowedDense
        isFilter={false}
        serverSidePagination
        serverSideSearch
        serverSideSort
        serverSideSortMode="single"
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        rowsPerPageOptions={[10, 25, 100]}
        onServerPagination={onPagination}
        onServerSearch={onSearch}
        onServerSort={onSort}
        exportLabel="Export current page"
        noDataText={
          activeFilterLabel && activeFilterLabel !== 'all'
            ? `No students match the ${activeFilterLabel} filter.`
            : 'No students found in the selected scope.'
        }
      />
      <NotifyParentDialog
        open={!!notifyStudent}
        student={notifyStudent}
        onClose={() => setNotifyStudent(null)}
      />
    </>
  );
}
