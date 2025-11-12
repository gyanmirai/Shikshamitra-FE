import type FullCalendar from '@fullcalendar/react';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import type { EventDropArg, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import type { ICalendarView, ICalendarRange, ICalendarEvent } from 'src/types/calendar';

import { useResponsive } from 'src/hooks/use-responsive';
import { useRef, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export function useCalendar({
  initialDate,
  initialView,
}: {
  initialDate?: any;
  initialView?: any;
} = {}) {
  const calendarRef = useRef<FullCalendar | null>(null);

  const calendarEl = calendarRef.current;

  const smUp = useResponsive('up', 'sm');

  const [date, setDate] = useState<Date | string>(new Date());

  const [openForm, setOpenForm] = useState(false);

  const [selectEventId, setSelectEventId] = useState('');

  const [selectedRange, setSelectedRange] = useState<ICalendarRange>(null);

  const [view, setView] = useState<ICalendarView>(smUp ? 'dayGridMonth' : 'listWeek');

  // Function to scroll to current time
  const scrollToCurrentTime = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const now = new Date();
      const currentTime = `${now.getHours()}:00:00`;
      calendarApi.scrollToTime(currentTime);
    }
  };

  // Scroll when the calendar initially loads
  useEffect(() => {
    scrollToCurrentTime();
  }, [view]);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    } else {
      setDate(new Date());
    }
  }, [initialDate]);

  useEffect(() => {
    if (initialView) {
      setView(initialView);
    } else {
      setView(initialView || smUp ? 'dayGridMonth' : 'listWeek');
    }
  }, [initialView, smUp]);

  const onOpenForm = useCallback(() => {
    setOpenForm(true);
  }, []);

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedRange(null);
    setSelectEventId('');
  }, []);

  const onInitialView = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      console.log('🚀 ~ onInitialView ~ calendarApi:', calendarApi);

      const newView = initialView || (smUp ? 'dayGridMonth' : 'listWeek');
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [calendarEl, initialView, smUp]);

  const onChangeView = useCallback(
    (newView: ICalendarView) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.changeView(newView);
        setView(newView);
      }
    },
    [calendarEl]
  );

  const onDateToday = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDatePrev = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onDateNext = useCallback(() => {
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  }, [calendarEl]);

  const onSelectRange = useCallback(
    (arg: DateSelectArg) => {
      if (calendarEl) {
        const calendarApi = calendarEl.getApi();

        calendarApi.unselect();
      }

      onOpenForm();
      setSelectedRange({ start: arg.startStr, end: arg.endStr });
    },
    [calendarEl, onOpenForm]
  );

  const onClickEvent = useCallback(
    (arg: EventClickArg) => {
      const { event } = arg;

      onOpenForm();
      setSelectEventId(event.id);
    },
    [onOpenForm]
  );

  const onResizeEvent = useCallback(
    (arg: EventResizeDoneArg, updateEvent: (eventData: Partial<ICalendarEvent>) => void) => {
      const { event } = arg;

      updateEvent({
        id: event.id,
        allDay: event.allDay,
        start: event.startStr,
        end: event.endStr,
      });
    },
    []
  );

  const onDropEvent = useCallback(
    (arg: EventDropArg, updateEvent: (eventData: Partial<ICalendarEvent>) => void) => {
      const { event } = arg;

      updateEvent({
        id: event.id,
        allDay: event.allDay,
        start: event.startStr,
        end: event.endStr,
      });
    },
    []
  );

  const onClickEventInFilters = useCallback(
    (eventId: string) => {
      if (eventId) {
        onOpenForm();
        setSelectEventId(eventId);
      }
    },
    [onOpenForm]
  );

  return {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onClickEvent,
    onChangeView,
    onSelectRange,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
    setDate,
  };
}
