import type { RootState } from 'src/redux/store';
import type { IDateValue } from 'src/types/common';
import type { Calendar } from '@fullcalendar/core';
import type FullCalendar from '@fullcalendar/react';
import type { Dispatch, SetStateAction } from 'react';
import type { ICalendarView } from 'src/types/calendar';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { formatStr } from 'src/utils/format-time';
import { DateCalendar } from '@mui/x-date-pickers';
import { Box, Stack, Button, Tooltip, IconButton } from '@mui/material';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

type Props = {
  date: IDateValue | Date;
  title?: string;
  view: ICalendarView;
  format?: string;
  calendarRef?: React.RefObject<Calendar | FullCalendar | null>;
  setDate?: Dispatch<SetStateAction<string | Date>>;
  onPrevDate: () => void;
  onNextDate: () => void;
};

export function CalendarDateNavigator({
  date,
  title,
  view,
  format,
  calendarRef,
  setDate,
  onPrevDate,
  onNextDate,
}: Props) {
  const popover = usePopover();
  const parsedDate = dayjs(date);
  const dateValue = parsedDate.isValid() ? parsedDate : dayjs(date, format ?? formatStr.date);
  const [draftDate, setDraftDate] = useState(dateValue);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const period = view === 'dayGridMonth' ? 'month' : view === 'timeGridDay' ? 'day' : 'week';
  const heading =
    title || dateValue.format(format || (period === 'month' ? 'MMMM YYYY' : formatStr.date));

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
        <Tooltip title={`Previous ${period}`}>
          <IconButton aria-label={`Previous ${period}`} onClick={onPrevDate}>
            <Iconify icon="mdi:chevron-left" />
          </IconButton>
        </Tooltip>
        <Button
          aria-label={`Choose date, ${heading}`}
          aria-haspopup="dialog"
          aria-expanded={popover.open}
          onClick={(event) => {
            setDraftDate(dateValue);
            popover.onOpen(event);
          }}
          endIcon={<Iconify icon="mdi:chevron-down" width={16} />}
          sx={{
            typography: { xs: 'subtitle1', sm: 'h6' },
            color: 'text.primary',
            minWidth: 0,
            px: 0.5,
          }}
        >
          <Box component="span" aria-live="polite">
            {heading}
          </Box>
        </Button>
        <Tooltip title={`Next ${period}`}>
          <IconButton aria-label={`Next ${period}`} onClick={onNextDate}>
            <Iconify icon="mdi:chevron-right" />
          </IconButton>
        </Tooltip>
      </Stack>
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <Box role="dialog" aria-label="Choose calendar date">
          <DateCalendar
            views={period === 'month' ? ['year', 'month'] : ['year', 'month', 'day']}
            openTo={period === 'month' ? 'month' : 'day'}
            minDate={currentYear?.startDate ? dayjs(currentYear.startDate) : undefined}
            maxDate={currentYear?.endDate ? dayjs(currentYear.endDate) : undefined}
            value={draftDate}
            onChange={(value) => {
              if (value) setDraftDate(value);
            }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 1 }}>
            <Button size="small" onClick={popover.onClose}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={!draftDate.isValid()}
              onClick={() => {
                const calendar = calendarRef?.current;
                const api = calendar && ('getApi' in calendar ? calendar.getApi() : calendar);
                api?.gotoDate(draftDate.format('YYYY-MM-DD'));
                setDate?.(draftDate.toDate());
                popover.onClose();
              }}
            >
              OK
            </Button>
          </Stack>
        </Box>
      </CustomPopover>
    </>
  );
}
