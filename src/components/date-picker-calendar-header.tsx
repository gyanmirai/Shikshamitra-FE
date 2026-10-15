import type { PickersCalendarHeaderProps } from '@mui/x-date-pickers/PickersCalendarHeader';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, IconButton } from '@mui/material';

export default function DatePickerCalendarHeader({
  currentMonth,
  onMonthChange,
  view,
  onViewChange,
  labelId,
  disabled,
  minDate,
  maxDate,
  disablePast,
  disableFuture,
}: PickersCalendarHeaderProps) {
  const previous = currentMonth.subtract(1, 'month');
  const next = currentMonth.add(1, 'month');
  const today = dayjs();
  const previousDisabled =
    disabled ||
    previous.isBefore(minDate, 'month') ||
    (disablePast && previous.isBefore(today, 'month'));
  const nextDisabled =
    disabled || next.isAfter(maxDate, 'month') || (disableFuture && next.isAfter(today, 'month'));
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 1.5, py: 1 }}
    >
      <Box component="span" id={labelId} sx={{ display: 'none' }}>
        {currentMonth.format('MMMM YYYY')}
      </Box>
      <Stack direction="row" spacing={0.5}>
        <Button
          size="small"
          color="inherit"
          aria-label="Choose month"
          aria-pressed={view === 'month'}
          disabled={disabled}
          onClick={() => onViewChange?.(view === 'month' ? 'day' : 'month')}
          endIcon={<Iconify icon="mdi:chevron-down" width={16} />}
          sx={{ minHeight: 44 }}
        >
          {currentMonth.format('MMMM')}
        </Button>
        <Button
          size="small"
          color="inherit"
          aria-label="Choose year"
          aria-pressed={view === 'year'}
          disabled={disabled}
          onClick={() => onViewChange?.(view === 'year' ? 'day' : 'year')}
          endIcon={<Iconify icon="mdi:chevron-down" width={16} />}
          sx={{ minHeight: 44 }}
        >
          {currentMonth.format('YYYY')}
        </Button>
      </Stack>
      {view === 'day' && (
        <Stack direction="row">
          <IconButton
            size="small"
            aria-label="Previous month"
            disabled={previousDisabled}
            onClick={() => onMonthChange(previous)}
            sx={{ width: 44, height: 44 }}
          >
            <Iconify icon="mdi:chevron-left" width={20} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Next month"
            disabled={nextDisabled}
            onClick={() => onMonthChange(next)}
            sx={{ width: 44, height: 44 }}
          >
            <Iconify icon="mdi:chevron-right" width={20} />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
}
