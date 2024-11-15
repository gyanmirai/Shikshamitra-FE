import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import { Card } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { updateEvent } from 'src/actions/calendar';
import { DashboardContent } from 'src/layouts/dashboard';

import CustomDialog from 'src/components/customDialog';

import { StyledCalendar } from '../styles';
// eslint-disable-next-line import/no-cycle
import { EventDialog } from './eventDialog';
// eslint-disable-next-line import/no-cycle

export type CalendarEvent = {
  id: string;
  startTime?: string;
  endTime?: string;
  start?: string;
  end?: string;
  title: string;
  textColor?: string;
  teacherId?: string;
  subjectId?: string;
  classRoomNumber?: string;
  daysOfWeek?: number[];
};

type Teacher = {
  id: string;
  name: string;
};

const subjects = [
  { id: '1', name: 'Math', color: '#FF5733', teachers: ['1', '3'] },
  { id: '2', name: 'English', color: '#33FF57', teachers: ['2'] },
  { id: '3', name: 'Science', color: '#3357FF', teachers: ['1', '2'] },
];

const teachers: Teacher[] = [
  { id: '1', name: 'Mr. Smith' },
  { id: '2', name: 'Ms. Johnson' },
  { id: '3', name: 'Mr. Brown' },
];

interface CalendarTimeTableProps {
  grade: number;
  isEdit: boolean;
  division: string;
  duration: string;
  schoolStartTime: string;
  classRoomNumber: string;
  schoolEndTime: string;
  onEventsChange?: (events: CalendarEvent[]) => void;
  breakEvents?: CalendarEvent[];
}

export const CalendarTimeTable: React.FC<CalendarTimeTableProps> = ({
  grade,
  isEdit,
  division,
  duration,
  schoolStartTime,
  schoolEndTime,
  classRoomNumber,
  onEventsChange,
  breakEvents = [],
}: CalendarTimeTableProps) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const dialog = useBoolean();
  // const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  // const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEventInfo, setNewEventInfo] = useState<DateSelectArg | null>(null);
  const [selectedRoom, setSelectedRoom] = useState(classRoomNumber);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [isNewEvent, setIsNewEvent] = useState(true);

  useEffect(() => {
    setEvents((currentEvents) => {
      const nonBreakEvents = currentEvents.filter(
        (event) => !breakEvents.some((breakEvent) => breakEvent.id === event.id)
      );
      return [...nonBreakEvents, ...breakEvents];
    });
  }, [breakEvents]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const eventData = {
      isNewEvent: true,
      newEventInfo: selectInfo,
      selectedEvent: null,
      selectedRoom: classRoomNumber,
    };

    // Batch state updates together
    setIsNewEvent(true);
    setNewEventInfo(selectInfo);
    setSelectedEvent(null);
    setSelectedRoom(classRoomNumber);
    dialog.onTrue();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    // Skip editing for break events
    if (clickInfo.event.title.includes('Break')) {
      return;
    }

    const event = events.find((e) => e.id === clickInfo.event.id);
    if (event) {
      // Batch state updates together
      const dateSelectInfo = {
        start: clickInfo.event.start!,
        end: clickInfo.event.end!,
        startStr: clickInfo.event.startStr,
        endStr: clickInfo.event.endStr,
        allDay: clickInfo.event.allDay,
        view: clickInfo.view,
      } as DateSelectArg;

      setIsNewEvent(false);
      setSelectedEvent(event);
      setSelectedRoom(event.classRoomNumber || classRoomNumber);
      setNewEventInfo(dateSelectInfo);
      dialog.onTrue();
    }
  };

  const handleCloseDialog = () => {
    setNewEventInfo(null);
    setSelectedEvent(null);
    // setSelectedSubject(null);
    // setSelectedTeacher(null);
    setSelectedRoom(classRoomNumber);
    dialog.onFalse();
  };

  useMemo(() => {
    setEvents((prevEvents) => [...prevEvents, ...breakEvents]);
  }, [breakEvents]);

  const updateEvents = (newEvents: CalendarEvent[]) => {
    const updatedEvents = newEvents.filter(
      (event) => !breakEvents.some((breakEvent) => breakEvent.id === event.id)
    );
    setEvents([...updatedEvents, ...breakEvents]);

    if (onEventsChange) {
      onEventsChange([...updatedEvents, ...breakEvents]);
    }
  };

  const handleSaveEvent = (formValues: any) => {
    const subject = subjects.find((sub) => sub.id === formValues.subject);
    const teacher = teachers.find((teach) => teach.id === formValues.teacher);

    const startDate = dayjs(newEventInfo!.start);
    const endDate = dayjs(newEventInfo!.end);

    // Get the time from the TimePicker values
    const startTime = dayjs(formValues.start);
    const endTime = dayjs(formValues.end);

    // Combine the date and time
    const combinedStart = startDate.hour(startTime.hour()).minute(startTime.minute()).toISOString();

    const combinedEnd = endDate.hour(endTime.hour()).minute(endTime.minute()).toISOString();

    const eventData = {
      id: formValues.id,
      start: combinedStart,
      end: combinedEnd,
      title: `${subject?.name} / ${teacher?.name}    ${formValues.classRoom}`,
      textColor: subject?.color,
      teacherId: teacher?.id,
      subjectId: subject?.id,
      classRoomNumber: formValues.classRoom,
    };

    if (isNewEvent) {
      updateEvents([...events, eventData]);
    } else {
      updateEvents(events.map((ev) => (ev.id === eventData.id ? eventData : ev)));
    }

    dialog.onFalse();
    updateEvent(eventData);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      const updatedEvents = events.filter((ev) => ev.id !== selectedEvent.id);
      updateEvents(updatedEvents);
      dialog.onFalse();
    }
  };

  const isEventOverlappingBreak = (start: Date, end: Date) =>
    breakEvents.some((breakEvent) => {
      const breakStart = new Date(start);
      const breakEnd = new Date(start);
      const [breakStartHours, breakStartMinutes] = breakEvent.startTime!.split(':').map(Number);
      const [breakEndHours, breakEndMinutes] = breakEvent.endTime!.split(':').map(Number);

      breakStart.setHours(breakStartHours, breakStartMinutes, 0, 0);
      breakEnd.setHours(breakEndHours, breakEndMinutes, 0, 0);

      return start < breakEnd && end > breakStart;
    });

  const handleEventDrop = (info: any) => {
    const { event } = info;

    if (event.title.includes('Break')) {
      info.revert();
      return;
    }

    if (isEventOverlappingBreak(event.start!, event.end!)) {
      info.revert();
      return;
    }

    const updatedEvent = {
      id: event.id,
      start: event.startStr,
      end: event.endStr,
      resourceId: event.resourceId,
    };

    setEvents((prevEvents) =>
      prevEvents.map((ev) => (ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev))
    );

    updateEvent(updatedEvent);
  };

  const handleEventResize = (info: any) => {
    const { event } = info;

    const updatedEvent = {
      id: event.id,
      start: event.startStr,
      end: event.endStr,
      resourceId: event.resourceId,
    };
    setEvents((prevEvents) =>
      prevEvents.map((ev) => (ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev))
    );
    updateEvent(updatedEvent);
  };

  const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ ...flexProps }}>
        <Card sx={{ ...flexProps, minHeight: '70vh' }}>
          <StyledCalendar sx={{ ...flexProps, '.fc.fc-media-screen': { flex: '1 1 auto' } }}>
            <FullCalendar
              droppable
              editable
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: '',
                center: 'title',
                right: '',
              }}
              titleFormat={{ year: 'numeric' }}
              slotDuration={duration}
              slotLabelInterval={duration}
              slotMinTime={schoolStartTime}
              slotMaxTime={schoolEndTime}
              height="100%"
              expandRows
              dayMaxEvents
              allDaySlot={false}
              events={events}
              hiddenDays={[0]}
              selectable
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventAllow={(dropInfo, draggedEvent) => {
                if (draggedEvent?.title.includes('Break')) {
                  return false;
                }
                return !isEventOverlappingBreak(dropInfo.start, dropInfo.end);
              }}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              dayHeaderFormat={{ weekday: 'short' }}
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: true,
                meridiem: false,
              }}
            />
          </StyledCalendar>
        </Card>
      </DashboardContent>
      {dialog.value && (
        <CustomDialog
          open={dialog.value}
          handleClose={handleCloseDialog}
          title={isNewEvent ? 'Create Timetable Entry' : 'Edit Timetable Entry'}
        >
          <EventDialog
            subjects={subjects}
            teachers={teachers}
            event={selectedEvent}
            onSave={handleSaveEvent}
            onDelete={!isNewEvent ? handleDeleteEvent : undefined}
            isEdit={!isNewEvent}
          />
        </CustomDialog>
      )}
    </>
  );
};
