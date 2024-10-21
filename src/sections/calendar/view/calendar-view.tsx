'use client';

// eslint-disable-next-line import/no-duplicates
import Calendar from '@fullcalendar/react'; // => request placed at the top
import type { ICalendarEvent, ICalendarFilters } from 'src/types/calendar';

import { useEffect } from 'react';
import listPlugin from '@fullcalendar/list';
// eslint-disable-next-line import/no-duplicates
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';
// eslint-disable-next-line import/no-extraneous-dependencies
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

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

export function SchoolTimetableCalendar() {
  const timePeriods = [
    { id: '1', title: '09:00 - 10:00' },
    { id: '2', title: '10:00 - 11:00' },
    { id: '3', title: '11:00 - 12:00' },
    { id: '4', title: '12:00 - 13:00' },
    { id: '5', title: '13:00 - 14:00' },
    { id: '6', title: '14:00 - 15:00' },
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const resources = weekDays.map(day => ({ id: day, title: day }));

  const events = [
    { resourceId: 'Monday', start: '2024-10-14T09:00:00', end: '2024-10-14T10:00:00', title: 'Math / Mr. Smith' },
    { resourceId: 'Monday', start: '2024-10-14T10:00:00', end: '2024-10-14T11:00:00', title: 'English / Ms. Johnson' },
    { resourceId: 'Tuesday', start: '2024-10-14T09:00:00', end: '2024-10-14T10:00:00', title: 'Science / Mr. Brown' },
    // Add more events for other days and time slots
  ];

  return (
    <Card className="w-full p-4">
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimelineWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimelineDay,resourceTimelineWeek'
        }}
        slotDuration="01:00:00"
        slotLabelInterval="01:00:00"
        slotMinTime="09:00:00"
        slotMaxTime="15:00:00"
        height="auto"
        resourceAreaWidth="15%"
        resources={resources}
        events={events}
        resourceLabelContent={(arg) => ({
            html: `<div class="fc-cell-text">${arg.resource.title}</div>`
          })}
        slotLabelContent={(arg) => ({
            html: `<div class="fc-cell-text">${timePeriods[arg.date.getHours() - 9].title}</div>`
          })}
        eventContent={(arg) => ({
            html: `<div class="fc-event-title">${arg.event.title}</div>`
          })}
      />
    </Card>
  );
}


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
