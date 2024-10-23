import type { DateSelectArg } from '@fullcalendar/core';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import { Card } from '@mui/material';

import { uuidv4 } from 'src/utils/uuidv4';

import { updateEvent } from 'src/actions/calendar';
import { DashboardContent } from 'src/layouts/dashboard';

import { StyledCalendar } from '../styles';
// eslint-disable-next-line import/no-cycle
import { EventDialog } from './eventDialog';

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
  division,
  duration,
  schoolStartTime,
  schoolEndTime,
  classRoomNumber,
  onEventsChange,
  breakEvents = [],
}: CalendarTimeTableProps) => {
  //   const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [newEventInfo, setNewEventInfo] = useState<DateSelectArg | null>(null);
  const [selectedRoom, setSelectedRoom] = useState(classRoomNumber);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  console.log('events0000', events);

  const calendarRef = useRef<FullCalendar>(null);
  // const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // const resources = weekDays.map((day) => ({ id: day, title: day }));

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // to open the dialog after click on box
    console.log('select info===', selectInfo);

    setNewEventInfo(selectInfo);
    setOpenDialog(true);
  };

  const filterTeachers = () => {
    // eslint-disable-next-line no-useless-return
    if (!selectedSubject && !newEventInfo) return;

    // need to access available teacher based on subject and their availabality

    // temp
    const subject = subjects.find((sub) => sub.id === selectedSubject);
    const subjectTeachers = subject?.teachers
      .map((tid) => teachers.find((teacher) => tid === teacher.id))
      .filter((teacher): teacher is Teacher => teacher !== undefined);
    setFilteredTeachers(subjectTeachers || []);
  };

  useEffect(() => {
    if (selectedSubject) {
      filterTeachers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  useMemo(() => {
    setEvents((prevEvents) => [...prevEvents, ...breakEvents]);
  }, [breakEvents]);

  const updateEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    if (onEventsChange) {
      onEventsChange(newEvents); // Notify parent of the event change
    }
  };

  const handleSaveEvent = () => {
    // save function after submit the the subject and teacher
    if (selectedSubject && selectedTeacher && newEventInfo) {
      const subject = subjects.find((sub) => sub.id === selectedSubject);
      const teacher = filteredTeachers.find((teach) => teach.id === selectedTeacher);
      console.log('subject---', subject);

      const newEvent = {
        id: uuidv4(),
        start: newEventInfo.startStr,
        end: newEventInfo.endStr,
        title: `${subject?.name} / ${teacher?.name}    ${selectedRoom}`,
        textColor: subject?.color,
        teacherId: teacher?.id,
        subjectId: subject?.id,
        classRoomNumber: selectedRoom,
      };

      const updatedEvents = [...events, newEvent];
      updateEvents(updatedEvents);
      setOpenDialog(false);
      updateEvent(newEvent);
      setSelectedSubject(null);
      setSelectedTeacher(null);
    }
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
            {/* <FullCalendar
              weekends
              editable
              droppable
              selectable
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart
              height="auto"
              resourceAreaWidth="15%"
              ref={calendarRef}
              initialDate={date}
              initialView="timeGridWeek"
              dayMaxEventRows={3}
              events={dataFiltered}
              headerToolbar={false}
              eventClick={handleEventClick}
              slotDuration="01:00:00"
              slotLabelInterval="01:00:00"
              slotMinTime="07:00:00" // Start at 7 AM
              slotMaxTime="13:00:00" // End at 7 PM
              aspectRatio={3}
              eventDrop={(arg) => {
                onDropEvent(arg, updateEvent);
              }}
              eventResize={(arg) => {
                onResizeEvent(arg, updateEvent);
              }}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
              eventReceive={handleEventReceive}
              select={handleDateSelect}
              // drop={(info: any) => {
              //   if (checkbox.checked) {
              //     // if so, remove the element from the "Draggable Events" list
              //     info.draggedEl.parentNode.removeChild(info.draggedEl);
              //   }
              // }}
            /> */}
          </StyledCalendar>
        </Card>
      </DashboardContent>

      <EventDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        subjects={subjects}
        teachers={filteredTeachers}
        selectedSubject={selectedSubject}
        selectedTeacher={selectedTeacher}
        selectedClassRoom={selectedRoom}
        onSelectSubject={setSelectedSubject}
        onSelectTeacher={setSelectedTeacher}
        onClassRoomSelect={setSelectedRoom}
        onSave={handleSaveEvent}
      />
    </>
  );
};
