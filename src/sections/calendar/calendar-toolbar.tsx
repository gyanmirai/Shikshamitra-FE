import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IDateValue } from 'src/types/common';
import type { Calendar } from '@fullcalendar/core';
import type FullCalendar from '@fullcalendar/react';
import type { Dispatch, SetStateAction } from 'react';
import type { ICalendarView } from 'src/types/calendar';
import type { UsePopoverReturn } from 'src/components/custom-popover';

import dayjs from 'dayjs';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { formatStr } from 'src/utils/format-time';
import { DateCalendar } from '@mui/x-date-pickers';
import LinearProgress from '@mui/material/LinearProgress';
import { Box, Badge, Tooltip, ButtonGroup } from '@mui/material';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const VIEW_OPTIONS = [
  { value: 'dayGridMonth', label: 'Month', icon: 'mingcute:calendar-month-line' },
  { value: 'timeGridWeek', label: 'Week', icon: 'mingcute:calendar-week-line' },
  { value: 'timeGridDay', label: 'Day', icon: 'mingcute:calendar-day-line' },
  { value: 'listWeek', label: 'Agenda', icon: 'fluent:calendar-agenda-24-regular' },
] as const;

// ----------------------------------------------------------------------

type Props = {
  loading: boolean;
  canReset: boolean;
  view: ICalendarView;
  date: IDateValue;
  onToday: () => void;
  onNextDate: () => void;
  onPrevDate: () => void;
  onOpenFilters: () => void;
  onChangeView: (newView: ICalendarView) => void;
  viewOptions?: typeof VIEW_OPTIONS;
  renderCompToHeader?: React.ReactNode;
  calendarRef?: React.RefObject<Calendar | FullCalendar | null>;
  format?: string;
  showCalendarFilter?: boolean;
  setDate?: Dispatch<SetStateAction<string | Date>>;
};

export function CalendarToolbar({
  date,
  view,
  loading,
  onToday,
  canReset,
  onNextDate,
  onPrevDate,
  onChangeView,
  onOpenFilters,
  viewOptions = VIEW_OPTIONS,
  renderCompToHeader = null,
  calendarRef,
  format,
  setDate,
  showCalendarFilter = false,
}: Props) {
  const popover = usePopover();
  const datePopover = usePopover();

  // const selectedItem = VIEW_OPTIONS.filter((item) => item.value === view)[0];

  const dateValue = dayjs(date, format ?? formatStr.date);

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pr: 2, position: 'relative' }}
      >
        <Box display="flex" gap={1}>
          <ButtonGroup
            size="small"
            sx={{
              border: (theme) => `1px solid ${theme.palette.divider}`,
              borderRadius: (theme) => theme.shape.borderRadius,
              px: 1,
              py: 0.5,
              backgroundColor: (theme) => theme.vars.palette.background.paper,
            }}
          >
            {viewOptions.map((viewOption) => (
              <Tooltip title={viewOption.label} key={viewOption.value}>
                <Button
                  key={viewOption.value}
                  onClick={() => {
                    popover.onClose();
                    onChangeView(viewOption.value);
                  }}
                  sx={{
                    border: 'none',
                    backgroundColor: (theme) =>
                      viewOption.value === view ? theme.palette.action.selected : 'transparent',
                    color: (theme) => theme.vars.palette.text.primary,
                    borderRadius: (theme) => `${theme.shape.borderRadius} !important`,
                    p: 0.5,
                    minWidth: 32,
                    '&:hover': {
                      border: 'none',
                      boxShadow: 'var(--shadows-1)',
                    },
                    '& .MuiButton-startIcon': {
                      margin: 0,
                    },
                  }}
                >
                  <Iconify
                    // sx={{ color: (theme) => theme.palette.text.primary }}
                    icon={viewOption.icon}
                  />
                </Button>
              </Tooltip>
            ))}
          </ButtonGroup>
          {renderCompToHeader}
        </Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton aria-label="Previous date" onClick={onPrevDate}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Typography variant="h6" sx={{ cursor: 'pointer' }} onClick={datePopover.onOpen}>
            {date}
          </Typography>

          <IconButton aria-label="Next date" onClick={onNextDate}>
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Button size="small" variant="contained" onClick={onToday} sx={{ px: '32px' }}>
            Today
          </Button>

          {showCalendarFilter && (
            <IconButton onClick={onOpenFilters}>
              <Badge color="error" variant="dot" invisible={!canReset}>
                <Iconify icon="ic:round-filter-list" />
              </Badge>
            </IconButton>
          )}
        </Stack>

        {loading && (
          <LinearProgress
            color="inherit"
            sx={{
              left: 0,
              width: 1,
              height: 2,
              bottom: 0,
              borderRadius: 0,
              position: 'absolute',
            }}
          />
        )}
      </Stack>

      <CustomPopover
        open={datePopover.open}
        anchorEl={datePopover.anchorEl}
        onClose={datePopover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <CalenderDateView
          dateValue={dateValue}
          calendarRef={calendarRef}
          format={format}
          datePopover={datePopover}
          setDate={setDate}
        />
      </CustomPopover>
    </>
  );
}

const CalenderDateView = ({
  dateValue,
  calendarRef,
  format,
  datePopover,
  setDate,
}: {
  dateValue: Dayjs | null;
  calendarRef?: React.RefObject<Calendar | FullCalendar | null>;
  format?: string;
  datePopover: UsePopoverReturn;
  setDate?: Dispatch<SetStateAction<string | Date>>;
}) => {
  const [tempDate, setTempDate] = useState<Dayjs | null>(dateValue);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  return (
    <Box>
      <DateCalendar
        views={['year', 'month']}
        minDate={dayjs(currentYear.startDate)}
        maxDate={dayjs(currentYear.endDate)}
        value={tempDate}
        sx={{
          '& .MuiPickersCalendarHeader-root': {
            pl: '12px !important',
          },
        }}
        onChange={(val) => {
          if (val) setTempDate(val);
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, p: 1 }}>
        <Button size="small" onClick={datePopover.onClose}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            // @ts-ignore
            calendarRef?.current?.calendar?.gotoDate?.(tempDate?.format() || '');
            setDate?.(tempDate?.format(format ?? formatStr.date) || '');
            datePopover.onClose();
          }}
          sx={{ ml: 1 }}
        >
          OK
        </Button>
      </Box>
    </Box>
  );
};
