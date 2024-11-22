import type { ICalendarEvent } from 'src/types/calendar';
import type { EventClickArg, CalendarOptions, EventSourceInput } from '@fullcalendar/core';

import React, { useEffect } from 'react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
// eslint-disable-next-line import/no-duplicates
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

import { Card } from '@mui/material';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

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
  ...props
}: CommonCalenderProps) => {
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
    <DashboardContent maxWidth="xl" sx={{ ...flexProps }}>
      <Card sx={{ ...flexProps, minHeight: '70vh' }}>
        <StyledCalendar sx={{ ...flexProps, '.fc.fc-media-screen': { flex: '1 1 auto' } }}>
          {showCalendarToolbar && (
            <CalendarToolbar
              date={fDate(date)}
              view={view}
              canReset
              loading={isLoading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
              onOpenFilters={() => {}}
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
