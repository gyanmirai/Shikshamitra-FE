import type { IColumn } from 'src/components/customizabaleTable/types';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Avatar, Tooltip, Typography } from '@mui/material';

import { studentAcademicMetricColumns } from './studentAcademicMetricColumns';

import type { StudentAcademicListItem } from '../listUtils';

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

export const studentAcademic360Columns: IColumn[] = [
  {
    id: 'name',
    label: 'Student',
    sticky: true,
    stickyPosition: 'left' as const,
    minWidth: 280,
    render: (_value, row) => {
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
  ...studentAcademicMetricColumns,
  {
    id: 'trend',
    label: 'Trend',
    render: (_value, row) => {
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
          color={trendCol}
          icon={<Iconify icon={trendIcon} />}
          label={item.trend}
        />
      );
    },
  },
  {
    id: 'academicHealth',
    label: 'Academic Health',
    render: (_value, row) => {
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
    render: (_value, row) => {
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
    render: (_value, row) => {
      const item = row as StudentAcademicListItem;
      return <Box sx={{ fontSize: '13px' }}>{formatLastUpdated(item.lastUpdatedAt)}</Box>;
    },
  },
  ];
