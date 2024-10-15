import type { DateSelectArg } from '@fullcalendar/core';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useRef, useState, useEffect } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

import { Card } from '@mui/material';

import { uuidv4 } from 'src/utils/uuidv4';

import { updateEvent } from 'src/actions/calendar';
import { DashboardContent } from 'src/layouts/dashboard';

import { StyledCalendar } from '../styles';
import { EventDialog } from './eventDialog';
import { useCalendar } from '../hooks/use-calendar';

type CalendarEvent = {
  id: string;
  resourceId?: string;
  start: string;
  end: string;
  title: string;
  color?: string;
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

const predefinedBreaks: CalendarEvent[] = [
  {
    id: uuidv4(),
    start: '2024-10-16T12:00:00', // Example time for lunch break
    end: '2024-10-16T13:00:00',
    title: 'Lunch Break',
    color: '#FFD700', // A different color for breaks
  },
  {
    id: uuidv4(),
    start: '2024-10-16T10:30:00', // Example time for short break
    end: '2024-10-16T10:45:00',
    title: 'Short Break',
    color: '#FF4500', // Another color for short breaks
  },
];

export function CalendarTimeTable() {
  //   const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [newEventInfo, setNewEventInfo] = useState<DateSelectArg | null>(null);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  console.log('events0000', events);

  const {
    view,
    date,
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
    // openForm,
    // onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    // onClickEventInFilters,
  } = useCalendar();

  const timePeriods = [
    { id: '1', title: '09:00 - 10:00' },
    { id: '2', title: '10:00 - 11:00' },
    { id: '3', title: '11:00 - 12:00' },
    { id: '4', title: '12:00 - 13:00' },
    { id: '5', title: '13:00 - 14:00' },
    { id: '6', title: '14:00 - 15:00' },
  ];

  const calendarRef = useRef<FullCalendar>(null);
  // const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // const resources = weekDays.map((day) => ({ id: day, title: day }));

  const handleDateSelect = (selectInfo: DateSelectArg) => {
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

  useEffect(() => {
    setEvents((prevEvents) => [...prevEvents, ...predefinedBreaks]);
  }, []);

  const handleSaveEvent = () => {
    if (selectedSubject && selectedTeacher && newEventInfo) {
      const subject = subjects.find((sub) => sub.id === selectedSubject);
      console.log('subject---', subject);

      const newEvent = {
        id: uuidv4(),
        resourceId: newEventInfo.resource?.id,
        start: newEventInfo.startStr,
        end: newEventInfo.endStr,
        title: `${subject?.name} / ${selectedTeacher}`,
        textColor: subject?.color,
      };

      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setOpenDialog(false);
      updateEvent(newEvent);
      setSelectedSubject(null);
      setSelectedTeacher(null);
    }
  };

  const handleEventDrop = (info: { event: { id: any; start: any; end: any; resourceId: any } }) => {
    const updatedEvent = {
      id: info.event.id,
      start: info.event.start,
      end: info.event.end,
      resourceId: info.event.resourceId,
    };

    setEvents((prevEvents) =>
      prevEvents.map((ev) => (ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev))
    );

    updateEvent(updatedEvent); // Update the event on the server and in local state
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
              plugins={[dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              slotDuration="01:00:00"
              slotLabelInterval="01:00:00"
              slotMinTime="09:00:00"
              slotMaxTime="15:00:00"
              height="100%"
              expandRows
              dayMaxEvents
              allDaySlot={false}
              events={events}
              hiddenDays={[0]}
              selectable
              select={handleDateSelect}
              eventAllow={(dropInfo, draggedEvent) => {
                // Disallow dragging or resizing for break events
                if (draggedEvent?.title.includes('Break')) {
                  return false; // Prevent moving or resizing break events
                }
                return true; // Allow other events
              }}
              eventDrop={(arg) => {
                // Ensure the dropped event isn't a break event
                if (!arg.event.title.includes('Break')) {
                  onDropEvent(arg, updateEvent);
                }
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
        onSelectSubject={setSelectedSubject}
        onSelectTeacher={setSelectedTeacher}
        onSave={handleSaveEvent}
      />
    </>
  );
}
