import type { IDateValue } from 'src/types/common';
import type { Calendar } from '@fullcalendar/core';
import type FullCalendar from '@fullcalendar/react';
import type { Dispatch, SetStateAction } from 'react';
import type { ICalendarView } from 'src/types/calendar';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Badge, Button, Tooltip, IconButton, LinearProgress } from '@mui/material';

import { CalendarViewSwitcher } from './calendar-view-switcher';
import { CalendarDateNavigator } from './calendar-date-navigator';

import type { CalendarViewOption } from './calendar-view-switcher';

type Props = {
  loading: boolean;
  canReset: boolean;
  view: ICalendarView;
  date: IDateValue | Date;
  title?: string;
  onToday: () => void;
  onNextDate: () => void;
  onPrevDate: () => void;
  onOpenFilters: () => void;
  onChangeView: (newView: ICalendarView) => void;
  viewOptions?: readonly CalendarViewOption[];
  renderCompToHeader?: React.ReactNode;
  calendarRef?: React.RefObject<Calendar | FullCalendar | null>;
  format?: string;
  showCalendarFilter?: boolean;
  setDate?: Dispatch<SetStateAction<string | Date>>;
};

export function CalendarToolbar({
  date,
  title,
  view,
  loading,
  onToday,
  canReset,
  onNextDate,
  onPrevDate,
  onChangeView,
  onOpenFilters,
  viewOptions,
  renderCompToHeader = null,
  calendarRef,
  format,
  setDate,
  showCalendarFilter = false,
}: Props) {
  return (
    <Box
      sx={{ p: { xs: 1, sm: 2 }, position: 'relative', borderBottom: 1, borderColor: 'divider' }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} alignItems={{ md: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <CalendarDateNavigator
            date={date}
            title={title}
            view={view}
            format={format}
            calendarRef={calendarRef}
            setDate={setDate}
            onPrevDate={onPrevDate}
            onNextDate={onNextDate}
          />
          <Button size="small" variant="outlined" onClick={onToday}>
            Today
          </Button>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
          sx={{ ml: { md: 'auto' }, minWidth: 0 }}
        >
          {renderCompToHeader}
          <CalendarViewSwitcher view={view} options={viewOptions} onChangeView={onChangeView} />
          {showCalendarFilter && (
            <Tooltip title="Filter calendar">
              <IconButton aria-label="Filter calendar" onClick={onOpenFilters}>
                <Badge color="error" variant="dot" invisible={!canReset}>
                  <Iconify icon="mdi:filter-variant" />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
      {loading && (
        <LinearProgress sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2 }} />
      )}
    </Box>
  );
}
