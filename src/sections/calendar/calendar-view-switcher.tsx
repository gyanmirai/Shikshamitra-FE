import type { ICalendarView } from 'src/types/calendar';

import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export type CalendarViewOption = { value: ICalendarView; label: string; icon: string };

const VIEW_OPTIONS: readonly CalendarViewOption[] = [
  { value: 'dayGridMonth', label: 'Month', icon: 'mdi:calendar-month-outline' },
  { value: 'timeGridWeek', label: 'Week', icon: 'mdi:calendar-week-outline' },
  { value: 'timeGridDay', label: 'Day', icon: 'mdi:calendar-today-outline' },
  { value: 'listWeek', label: 'Agenda', icon: 'mdi:format-list-bulleted' },
];

type Props = {
  view: ICalendarView;
  options?: readonly CalendarViewOption[];
  onChangeView: (view: ICalendarView) => void;
};

export function CalendarViewSwitcher({ view, options = VIEW_OPTIONS, onChangeView }: Props) {
  return (
    <Box
      role="group"
      aria-label="Calendar view"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        p: 0.5,
        borderRadius: 1,
        bgcolor: 'background.neutral',
      }}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          size="small"
          aria-pressed={view === option.value}
          onClick={() => onChangeView(option.value)}
          startIcon={<Iconify icon={option.icon} width={18} />}
          sx={{
            px: 1,
            minWidth: 0,
            color: view === option.value ? 'text.primary' : 'text.secondary',
            bgcolor: view === option.value ? 'background.paper' : 'transparent',
            boxShadow: view === option.value ? (theme) => theme.customShadows.z1 : 'none',
            '&:hover': { bgcolor: view === option.value ? 'background.paper' : 'action.hover' },
          }}
        >
          {option.label}
        </Button>
      ))}
    </Box>
  );
}
