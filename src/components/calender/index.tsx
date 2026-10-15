import type { CardProps } from '@mui/material';
import type { ICalendarEvent } from 'src/types/calendar';
import type { CalendarViewOption } from 'src/sections/calendar/calendar-view-switcher';
import type { EventClickArg, CalendarOptions, EventSourceInput } from '@fullcalendar/core';

import { Card } from '@mui/material';
import Calendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
// eslint-disable-next-line import/no-duplicates
import dayGridPlugin from '@fullcalendar/daygrid';
import React, { useState, useEffect } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
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
  viewOptions?: CalendarViewOption[];
  renderCompToHeader?: React.ReactNode;
  showCalendarFilter?: boolean;
  onOPenFiler?: () => void;
  containerProps?: CardProps;
  canReset?: boolean;
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
  showCalendarFilter = false,
  onOPenFiler = () => {},
  containerProps = {},
  canReset,
  datesSet,
  eventDidMount,
  ...props
}: CommonCalenderProps) => {
  const [title, setTitle] = useState('');
  const {
    calendarRef,
    view,
    date,
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,

    onResizeEvent,
    onInitialView,
    setDate,
  } = useCalendar({
    initialView,
    initialDate,
  });

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  return (
    <Card sx={{ minHeight: '70vh', ...flexProps }} {...containerProps}>
      <StyledCalendar
        sx={{
          ...flexProps,
          minHeight: 0,
          height: '100%',
          '.fc.fc-media-screen': { flex: '1 1 auto', minHeight: 0 },
        }}
      >
        {showCalendarToolbar && (
          <CalendarToolbar
            date={date}
            title={formate ? undefined : title}
            format={formate}
            setDate={setDate}
            calendarRef={calendarRef}
            view={view}
            canReset={!!canReset}
            loading={isLoading}
            onNextDate={onDateNext}
            onPrevDate={onDatePrev}
            onToday={onDateToday}
            onChangeView={onChangeView}
            onOpenFilters={onOPenFiler}
            viewOptions={viewOptions}
            renderCompToHeader={renderCompToHeader}
            showCalendarFilter={showCalendarFilter}
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
          expandRows
          datesSet={(arg) => {
            setTitle(arg.view.title);
            datesSet?.(arg);
          }}
          eventDidMount={(arg) => {
            arg.el.title ||= arg.event.title;
            eventDidMount?.(arg);
          }}
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
  );
};

export default CommonCalender;
