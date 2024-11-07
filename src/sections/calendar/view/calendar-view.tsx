'use client';

// eslint-disable-next-line import/no-duplicates
import Calendar from '@fullcalendar/react'; // => request placed at the top
import type { ICalendarEvent, ICalendarFilters } from 'src/types/calendar';

import listPlugin from '@fullcalendar/list';
// eslint-disable-next-line import/no-duplicates
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useRef, useMemo, useEffect } from 'react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';
// eslint-disable-next-line import/no-extraneous-dependencies

import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import DialogTitle from '@mui/material/DialogTitle';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fDate, fIsAfter, fIsBetween } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import { updateEvent, useGetEvents } from 'src/actions/calendar';

import { StyledCalendar } from '../styles';
import { useEvent } from '../hooks/use-event';
import { CalendarForm } from '../calendar-form';
import { useCalendar } from '../hooks/use-calendar';
import { CalendarToolbar } from '../calendar-toolbar';

// ----------------------------------------------------------------------

export function CalendarView() {
  const theme = useTheme();

  const openFilters = useBoolean();

  const { events, eventsLoading } = useGetEvents();

  const filters = useSetState<ICalendarFilters>({
    colors: [],
    startDate: null,
    endDate: null,
  });

  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);

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

  const currentEvent = useEvent(events, selectEventId, selectedRange, openForm);

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  const canReset =
    filters.state.colors.length > 0 || (!!filters.state.startDate && !!filters.state.endDate);

  const dataFiltered = applyFilter({ inputData: events, filters: filters.state, dateError });

  console.log('dataFiltered', dataFiltered);

  // const renderResults = (
  //   <CalendarFiltersResult
  //     filters={filters}
  //     totalResults={dataFiltered.length}
  //     sx={{ mb: { xs: 3, md: 5 } }}
  //   />
  // );

  const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ ...flexProps }}>
        {/* <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: { xs: 3, md: 5 } }}
        >
          <Typography variant="h4">Calendar</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={onOpenForm}
          >
            New event
          </Button>
        </Stack> */}

        {/* {canReset && renderResults} */}

        <Card sx={{ ...flexProps, minHeight: '70vh' }}>
          <StyledCalendar sx={{ ...flexProps, '.fc.fc-media-screen': { flex: '1 1 auto' } }}>
            <CalendarToolbar
              date={fDate(date)}
              view={view}
              canReset={canReset}
              loading={eventsLoading}
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
              events={dataFiltered}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
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
            />
          </StyledCalendar>
        </Card>
      </DashboardContent>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        onClose={onCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
        PaperProps={{
          sx: {
            display: 'flex',
            overflow: 'hidden',
            flexDirection: 'column',
            '& form': { minHeight: 0, display: 'flex', flex: '1 1 auto', flexDirection: 'column' },
          },
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {openForm && <> {currentEvent?.id ? 'Edit' : 'Add'} event</>}
        </DialogTitle>

        <CalendarForm
          currentEvent={currentEvent}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={onCloseForm}
        />
      </Dialog>

      {/* <CalendarFilters
        events={events}
        filters={filters}
        canReset={canReset}
        dateError={dateError}
        open={openFilters.value}
        onClose={openFilters.onFalse}
        onClickEvent={onClickEventInFilters}
        colorOptions={CALENDAR_COLOR_OPTIONS}
      /> */}
    </>
  );
}

// ----------------------------------------------------------------------
interface SchoolTimetableCalendarProps {
  grade: number;
  division: string;
  teacherId?: string;
  subjectId?: string; // Optional teacherId, for filtering events in teacher view
}

export const SchoolTimetableCalendar: React.FC<SchoolTimetableCalendarProps> = ({
  grade,
  division,
  teacherId,
  subjectId,
}: SchoolTimetableCalendarProps) => {
  console.log('SchoolTimetableCalendar---');

  const calendarRef = useRef<FullCalendar>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const events = [
    {
      id: 'f3284f7d-4d9f-436f-b53c-2d771afdbb99',
      startTime: '12:00',
      endTime: '12:30',
      title: 'Lunch Break',
      textColor: '#FFD700',
      daysOfWeek: [1, 2, 3, 4, 5, 6],
    },
    {
      id: '290e1b2f-332f-4c47-947b-907100919623',
      startTime: '13:00:00',
      endTime: '13:15:00',
      title: 'Short Break',
      textColor: '#FF4500',
      daysOfWeek: [1, 2, 3, 4, 5, 6],
    },
    {
      id: '874d0843-937b-409b-8cb3-9a3ceee1d164',
      start: '2024-10-21T09:00:00+05:30',
      end: '2024-10-21T10:00:00+05:30',
      title: 'Math / Mr. Smith    103',
      textColor: '#FF5733',
      teacherId: '1',
      subjectId: '1',
      classRoomNumber: '103',
    },
    {
      id: '35b1ebd4-b5c2-490c-ad7a-0afbed1242ff',
      start: '2024-10-23T10:00:00+05:30',
      end: '2024-10-23T11:00:00+05:30',
      title: 'English / Ms. Johnson    102',
      textColor: '#33FF57',
      teacherId: '2',
      subjectId: '2',
      classRoomNumber: '102',
    },
    {
      id: '748afd81-d376-4798-8718-bd5413ccc14b',
      start: '2024-10-24T11:00:00+05:30',
      end: '2024-10-24T11:45:00+05:30',
      title: 'Science / Ms. Johnson    102',
      textColor: '#3357FF',
      teacherId: '2',
      subjectId: '3',
      classRoomNumber: '102',
    },
    {
      id: 'fd4e87ae-281b-4903-95c9-5d836c7d9d71',
      start: '2024-10-21T13:30:00+05:30',
      end: '2024-10-21T14:30:00+05:30',
      title: 'Math / Mr. Brown    103',
      textColor: '#FF5733',
      teacherId: '3',
      subjectId: '1',
      classRoomNumber: '103',
    },
    {
      id: '189f512e-f2f8-4c74-84b1-61615ea208b8',
      start: '2024-10-25T10:15:00+05:30',
      end: '2024-10-25T11:15:00+05:30',
      title: 'English / Ms. Johnson    101',
      textColor: '#33FF57',
      teacherId: '2',
      subjectId: '2',
      classRoomNumber: '101',
    },
  ];
  // const filteredEvents = teacherId
  //   ? events.filter((event) => !event.teacherId || event.teacherId === teacherId) // Keep break events (no teacherId) and specific teacher events
  //   : events; // For student view, show all events
  const filteredEvents = useMemo(() => {
    if (teacherId) {
      return events.filter((event) => !event.teacherId || event.teacherId === teacherId);
    }
    if (subjectId) {
      return events.filter((event) => !event.subjectId || event.subjectId === subjectId);
    }
    return events;
  }, [teacherId, subjectId, events]);

  console.log('feltured eventen====', filteredEvents);

  const flexProps = { flex: '1 1 auto', display: 'flex', flexDirection: 'column' };
  return (
    <DashboardContent maxWidth="xl" sx={{ ...flexProps }}>
      <Card sx={{ ...flexProps, minHeight: '70vh' }}>
        <StyledCalendar sx={{ ...flexProps, '.fc.fc-media-screen': { flex: '1 1 auto' } }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: '',
              center: 'title',
              right: '',
            }}
            titleFormat={{ year: 'numeric' }}
            initialView="timeGridWeek"
            slotDuration="00:15:00"
            slotLabelInterval="00:15:00"
            slotMinTime="09:00:00"
            slotMaxTime="15:45:00"
            height="100%"
            expandRows
            dayMaxEvents
            allDaySlot={false}
            dayHeaderFormat={{ weekday: 'short' }}
            events={filteredEvents}
            hiddenDays={[0]}
          />
        </StyledCalendar>
      </Card>
    </DashboardContent>
  );
};

type ApplyFilterProps = {
  dateError: boolean;
  filters: ICalendarFilters;
  inputData: ICalendarEvent[];
};

function applyFilter({ inputData, filters, dateError }: ApplyFilterProps) {
  const { colors, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  inputData = stabilizedThis.map((el) => el[0]);

  if (colors.length) {
    inputData = inputData.filter((event) => colors.includes(event.color as string));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((event) => fIsBetween(event.start, startDate, endDate));
    }
  }

  return inputData;
}
