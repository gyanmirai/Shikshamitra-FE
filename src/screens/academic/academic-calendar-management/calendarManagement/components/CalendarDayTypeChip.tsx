'use client';

import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { DayType, DAY_TYPE_LABELS, DAY_TYPE_COLORS } from 'src/enums/academic-calendar';

const DAY_TYPE_ICONS: Record<DayType, string> = {
  [DayType.WorkingDay]: 'mdi:briefcase-check-outline',
  [DayType.Holiday]: 'mdi:flag-outline',
  [DayType.Vacation]: 'mdi:beach',
  [DayType.HalfDay]: 'mdi:clock-time-four-outline',
  [DayType.Event]: 'mdi:party-popper',
  [DayType.Exam]: 'mdi:file-document-edit-outline',
  [DayType.PTM]: 'mdi:account-group-outline',
  [DayType.EmergencyClosure]: 'mdi:alert-octagon-outline',
};

interface CalendarDayTypeChipProps {
  dayType: DayType;
  size?: 'small' | 'medium';
}

const CalendarDayTypeChip = ({ dayType, size = 'small' }: CalendarDayTypeChipProps) => {
  const label = DAY_TYPE_LABELS[dayType] ?? 'Unknown';
  const color = DAY_TYPE_COLORS[dayType] ?? '#9e9e9e';
  const icon = DAY_TYPE_ICONS[dayType] ?? 'mdi:calendar-outline';

  return (
    <Chip
      label={label}
      size={size}
      icon={
        <Iconify
          icon={icon}
          width={12}
          sx={{ color: `${color} !important`, ml: '4px !important' }}
        />
      }
      sx={{
        backgroundColor: alpha(color, 0.13),
        color,
        border: `1px solid ${alpha(color, 0.35)}`,
        fontWeight: 700,
        fontSize: '11px',
        height: size === 'small' ? 20 : 24,
        '& .MuiChip-label': { px: 0.75 },
      }}
    />
  );
};

export default CalendarDayTypeChip;
