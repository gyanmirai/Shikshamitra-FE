import type { ChipProps } from '@mui/material';
import type { IData } from 'src/components/customizabaleTable/types';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Tooltip, IconButton } from '@mui/material';

import type { Academic360StudentRow } from '../types';
import type { StudentAcademicListItem } from '../listUtils';

export const TrendCell = ({ row }: { row: IData }) => {
  const item = row as StudentAcademicListItem;
  const normalized = item.trend.toLowerCase();
  const isUp = normalized.includes('improv') || normalized.includes('up');
  const isDown =
    normalized.includes('declin') || normalized.includes('down') || normalized.includes('drop');
  const color: ChipProps['color'] = isUp ? 'success' : isDown ? 'error' : 'default';
  const icon = isUp ? 'mdi:trending-up' : isDown ? 'mdi:trending-down' : 'mdi:trending-neutral';

  return (
    <Chip
      size="small"
      variant="soft"
      color={color}
      icon={<Iconify icon={icon} />}
      label={item.trend}
    />
  );
};

export const HealthCell = ({ row }: { row: IData }) => {
  const item = row as StudentAcademicListItem;
  const normalized = item.academicHealth.toLowerCase();
  let color: ChipProps['color'] = 'default';
  if (normalized.includes('track')) color = 'success';
  else if (normalized.includes('improving')) color = 'info';
  else if (normalized.includes('support')) color = 'error';
  else if (normalized.includes('attention')) color = 'warning';

  return (
    <Tooltip title={item.academicHealthReasons.join(', ') || 'Open 360 for detailed evidence'}>
      <Chip size="small" color={color} variant="soft" label={item.academicHealth} />
    </Tooltip>
  );
};

export const AlertCell = ({ row }: { row: IData }) => {
  const alerts = (row as StudentAcademicListItem).alertCount ?? 0;
  return (
    <Chip
      size="small"
      color={alerts > 0 ? 'warning' : 'default'}
      variant="soft"
      label={alerts > 0 ? `${alerts} alerts` : 'No alerts'}
    />
  );
};

export const LastUpdatedCell = ({ row }: { row: IData }) => {
  const value = (row as StudentAcademicListItem).lastUpdatedAt;
  if (!value) return <Box sx={{ fontSize: '13px' }}>No data</Box>;

  const date = new Date(value);
  const label = Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
  return <Box sx={{ fontSize: '13px' }}>{label}</Box>;
};

export const ActionCell = ({
  row,
  onNotify,
  onOpen,
}: {
  row: IData;
  onNotify: (student: Academic360StudentRow) => void;
  onOpen: (student: Academic360StudentRow) => void;
}) => {
  const item = row as StudentAcademicListItem;
  return (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Notify Parent">
        <span>
          <IconButton
            aria-label={`Notify parent of ${item.name}`}
            size="small"
            color="warning"
            onClick={() => onNotify(item.student)}
            disabled={!item.studentId}
          >
            <Iconify icon="mdi:bell-outline" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Open Academic 360">
        <span>
          <IconButton
            aria-label={`Open Academic 360 for ${item.name}`}
            size="small"
            onClick={() => onOpen(item.student)}
            disabled={!item.studentId}
          >
            <Iconify icon="mdi:eye" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
};
