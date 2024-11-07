import type { EventSourceInput } from '@fullcalendar/core';

import React, { useEffect } from 'react';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
// eslint-disable-next-line import/no-duplicates
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

import { Card } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { StyledCalendar } from 'src/sections/calendar/styles';
import { useCalendar } from 'src/sections/calendar/hooks/use-calendar';
import { CalendarToolbar } from 'src/sections/calendar/calendar-toolbar';

const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };

interface CommonCalenderProps {
  data: EventSourceInput | undefined;
  isLoading: boolean;
}

const CommonCalender = ({ data, isLoading }: CommonCalenderProps) => {
  const openFilters = useBoolean();
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
    onClickEvent,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    // onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    // onClickEventInFilters,
  } = useCalendar();

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  return (
    <DashboardContent maxWidth="xl" sx={{ ...flexProps }}>
      <Card sx={{ ...flexProps, minHeight: '70vh' }}>
        <StyledCalendar sx={{ ...flexProps, '.fc.fc-media-screen': { flex: '1 1 auto' } }}>
          <CalendarToolbar
            date={fDate(date)}
            view={view}
            canReset
            loading={isLoading}
            onNextDate={onDateNext}
            onPrevDate={onDatePrev}
            onToday={onDateToday}
            onChangeView={onChangeView}
            onOpenFilters={openFilters.onTrue}
          />

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
            eventClick={onClickEvent}
            aspectRatio={3}
            eventDrop={(arg) => {
              // onDropEvent(arg, updateEvent);
            }}
            eventResize={(arg) => {
              //   onResizeEvent(arg, updateEvent);
            }}
            plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
          />
        </StyledCalendar>
      </Card>
    </DashboardContent>
  );
};

export default CommonCalender;
