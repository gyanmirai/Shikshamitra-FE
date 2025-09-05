import type { ICalendarEvent } from 'src/types/calendar';
import type { EventClickArg, CalendarOptions, EventSourceInput } from '@fullcalendar/core';

import { Card } from '@mui/material';
import React, { useEffect } from 'react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import { fDate } from 'src/utils/format-time';
import { useTheme } from '@mui/material/styles';
// eslint-disable-next-line import/no-duplicates
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import { DashboardContent } from 'src/layouts/dashboard';
import interactionPlugin from '@fullcalendar/interaction';
import { StyledCalendar } from 'src/sections/calendar/styles';
import { useCalendar } from 'src/sections/calendar/hooks/use-calendar';
import { CalendarToolbar } from 'src/sections/calendar/calendar-toolbar';

const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };

type CommonCalenderProps = CalendarOptions & {
  data: EventSourceInput | undefined;
  isLoading?: boolean;
  onEventDrop?: (eventData: Partial<ICalendarEvent>) => void;
  onEventResize?: (eventData: Partial<ICalendarEvent>) => void;
  onDateClick?: (arg: EventClickArg) => void;
  showCalendarToolbar?: boolean;
  formate?: string;
  viewOptions?: {
    value: string;
    label: string;
    icon: string;
  }[];
  renderCompToHeader?: React.ReactNode;
};

const CommonCalender = ({
  data,
  isLoading = false,
  onEventDrop = () => {},
  onEventResize = () => {},
  onDateClick = () => {},
  showCalendarToolbar = true,
  initialView,
  initialDate,
  formate,
  viewOptions,
  renderCompToHeader = null,
  ...props
}: CommonCalenderProps) => {
  const theme = useTheme();
  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,

    onResizeEvent,
    onInitialView,
    //
    setDate,
    selectedRange,
    //
    // onClickEventInFilters,
  } = useCalendar({
    initialView,
    initialDate,
  });

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  return (
    <DashboardContent
      maxWidth="xl"
      sx={{
        ...flexProps,
        [theme.breakpoints.up('lg')]: {
          px: 0,
        },
      }}
    >
      <Card sx={{ ...flexProps, minHeight: '70vh' }}>
        <StyledCalendar sx={{ ...flexProps, '.fc.fc-media-screen': { flex: '1 1 auto' } }}>
          {showCalendarToolbar && (
            <CalendarToolbar
              date={fDate(date, formate)}
              format={formate}
              setDate={setDate}
              calendarRef={calendarRef}
              view={view}
              canReset
              loading={isLoading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
              onOpenFilters={() => {}}
              viewOptions={viewOptions as any}
              renderCompToHeader={renderCompToHeader}
            />
          )}

          <Calendar
            weekends
            editable
            droppable
            selectable
            rerenderDelay={10}
            allDayMaintainDuration
            eventResizableFromStart
            ref={calendarRef}
            initialDate={date}
            initialView={view}
            dayMaxEventRows={3}
            eventDisplay="block"
            events={data || []}
            headerToolbar={false}
            select={onSelectRange}
            eventClick={onDateClick}
            aspectRatio={3}
            eventDrop={(arg) => {
              onDropEvent(arg, onEventDrop);
            }}
            eventResize={(arg) => {
              onResizeEvent(arg, onEventResize);
            }}
            plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
            {...props}
          />
        </StyledCalendar>
      </Card>
    </DashboardContent>
  );
};

export default CommonCalender;
