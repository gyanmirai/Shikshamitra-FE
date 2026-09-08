import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DayType, DAY_TYPE_LABELS } from 'src/enums/academic-calendar';

import { getDayTypeSemanticColor } from './calendarDayTypePresentation';

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
  const icon = DAY_TYPE_ICONS[dayType] ?? 'mdi:calendar-outline';

  return (
    <Label
      color={getDayTypeSemanticColor(dayType)}
      variant="soft"
      startIcon={<Iconify icon={icon} width={12} />}
      sx={{
        fontWeight: 700,
        fontSize: '11px',
        height: size === 'small' ? 20 : 24,
      }}
    >
      {label}
    </Label>
  );
};

export default CalendarDayTypeChip;
