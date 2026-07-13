'use client';

import type { KeyboardEvent } from 'react';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Avatar,
  Tooltip,
  TableRow,
  TableCell,
  Typography,
  IconButton,
} from '@mui/material';

import { readText } from '../types';
import { getMetricPercentage } from '../listUtils';

import type { Academic360Metric, Academic360StudentRow } from '../types';
import type { StudentAcademicListItem } from '../listUtils';

type StudentAcademic360TableRowProps = {
  item: StudentAcademicListItem;
  onOpenStudent: (student: Academic360StudentRow) => void;
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
  <TableCell>
    <Typography variant="body2" fontWeight={600}>
      {primary}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {secondary}
    </Typography>
  </TableCell>
);

const handleRowKeyDown = (
  event: KeyboardEvent<HTMLTableRowElement>,
  item: StudentAcademicListItem,
  onOpenStudent: (student: Academic360StudentRow) => void
) => {
  if (event.key === 'Enter') onOpenStudent(item.student);
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;

  event.preventDefault();
  const rows = Array.from(
    document.querySelectorAll<HTMLTableRowElement>('[data-academic-student-row="true"]')
  );
  const currentIndex = rows.findIndex((row) => row === event.currentTarget);
  const nextIndex = event.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
  rows[nextIndex]?.focus();
};

export function StudentAcademic360TableRow({
  item,
  onOpenStudent,
}: StudentAcademic360TableRowProps) {
  const homework = formatHomework(item.homework);
  const alerts = item.alertCount ?? 0;

  return (
    <TableRow
      hover
      tabIndex={0}
      key={item.studentId || item.name}
      data-student-id={item.studentId}
      data-academic-student-row="true"
      onClick={() => onOpenStudent(item.student)}
      onKeyDown={(event) => handleRowKeyDown(event, item, onOpenStudent)}
      sx={{
        cursor: 'pointer',
        '&:focus-visible': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: -2,
        },
      }}
    >
      <TableCell sx={{ minWidth: 250 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
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
      </TableCell>
      <MetricCell primary={formatMetric(item.attendance)} secondary={readText(item.attendance?.status, 'Attendance')} />
      <MetricCell primary={homework.primary} secondary={homework.secondary} />
      <MetricCell primary={formatMetric(item.examAverage)} secondary={readText(item.examAverage?.count, 'Exams')} />
      <TableCell>
        <Chip size="small" variant="soft" icon={<Iconify icon="mdi:trending-up" />} label={item.trend} />
      </TableCell>
      <TableCell>
        <Tooltip title={item.academicHealthReasons.join(', ') || 'Open 360 for detailed evidence'}>
          <Chip size="small" color={healthColor(item.academicHealth)} variant="soft" label={item.academicHealth} />
        </Tooltip>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          color={alerts > 0 ? 'warning' : 'default'}
          variant="soft"
          label={alerts > 0 ? `${alerts} alerts` : 'No alerts'}
        />
      </TableCell>
      <TableCell>{formatLastUpdated(item.lastUpdatedAt)}</TableCell>
      <TableCell align="right" onClick={(event) => event.stopPropagation()}>
        <Tooltip title="Open Academic 360">
          <IconButton size="small" onClick={() => onOpenStudent(item.student)} disabled={!item.studentId}>
            <Iconify icon="mdi:arrow-right" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
