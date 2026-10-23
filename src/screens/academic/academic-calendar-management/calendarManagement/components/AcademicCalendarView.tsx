'use client';

import type { EventInput } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Box, Alert, Button } from '@mui/material';
import CommonCalender from 'src/components/calender';
import { alpha, useTheme } from '@mui/material/styles';
import { useResponsive } from 'src/hooks/use-responsive';
import { DAY_TYPE_LABELS } from 'src/enums/academic-calendar';

import { getDayTypeSemanticColor } from './calendarDayTypePresentation';

import type { CalendarDayViewRecord } from '../calendarViewModel';

type Props = {
  calendarId: string;
  dayMap: Record<string, CalendarDayViewRecord[]>;
  calendarStartDate: string;
  calendarEndDate: string;
  isLoading: boolean;
  onDayClick: (date: string, markerId?: string) => void;
};

function getInitialDate(startDate: string, endDate: string) {
  const today = dayjs();
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (start.isValid() && today.isBefore(start, 'day')) return start.format('YYYY-MM-DD');
  if (end.isValid() && today.isAfter(end, 'day')) return end.format('YYYY-MM-DD');
  return today.format('YYYY-MM-DD');
}

export default function AcademicCalendarView({
  calendarId,
  dayMap,
  calendarStartDate,
  calendarEndDate,
  isLoading,
  onDayClick,
}: Props) {
  const theme = useTheme();
  const smUp = useResponsive('up', 'sm');

  /**
   * Memoization Justification:
   * The academic calendar expands date ranges and class markers into a day index.
   * Convert that index only when its records or palette change, not on dialog renders.
   */
  const events = useMemo<EventInput[]>(
    () =>
      Object.entries(dayMap).flatMap(([date, records]) =>
        records.map((record, index) => {
          const color = theme.palette[getDayTypeSemanticColor(record.dayType)].main;
          return {
            id: `${date}:${record.dayType}:${record.id ?? index}`,
            title: record.title || DAY_TYPE_LABELS[record.dayType],
            start: date,
            end: dayjs(date).add(1, 'day').format('YYYY-MM-DD'),
            allDay: true,
            backgroundColor: alpha(color, 0.12),
            borderColor: color,
            textColor: (theme.vars?.palette ?? theme.palette).text.primary,
            extendedProps: { markerId: record.id },
          };
        })
      ),
    [dayMap, theme]
  );

  const initialDate = getInitialDate(calendarStartDate, calendarEndDate);
  const isInsideCalendar = (date: string) => {
    const selected = dayjs(date);
    const start = dayjs(calendarStartDate);
    const end = dayjs(calendarEndDate);
    return (
      selected.isValid() &&
      (!start.isValid() || !selected.isBefore(start, 'day')) &&
      (!end.isValid() || !selected.isAfter(end, 'day'))
    );
  };

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {!isLoading && events.length === 0 && (
        <Alert severity="info">No events are scheduled for this calendar.</Alert>
      )}
      <CommonCalender
        key={calendarId}
        data={events}
        isLoading={isLoading}
        initialDate={initialDate}
        initialView={smUp ? 'dayGridMonth' : 'listWeek'}
        showCalendarToolbar
        height="100%"
        editable={false}
        droppable={false}
        selectable={false}
        eventResizableFromStart={false}
        eventInteractive
        dayCellContent={({ date, dayNumberText }) => (
          <Button
            size="small"
            aria-label={`Add calendar marker on ${dayjs(date).format('D MMMM YYYY')}`}
            disabled={isLoading || !isInsideCalendar(dayjs(date).format('YYYY-MM-DD'))}
            onClick={(event) => {
              event.stopPropagation();
              onDayClick(dayjs(date).format('YYYY-MM-DD'));
            }}
          >
            {dayNumberText}
          </Button>
        )}
        dateClick={({ dateStr }) => {
          if (isInsideCalendar(dateStr)) onDayClick(dayjs(dateStr).format('YYYY-MM-DD'));
        }}
        onDateClick={({ event }) => {
          const date = event.startStr.slice(0, 10);
          if (isInsideCalendar(date)) onDayClick(date, event.extendedProps.markerId);
        }}
        containerProps={{
          sx: {
            flexGrow: 1,
            minHeight: 0,
            height: '100%',
            border: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            '--Paper-shadow': 'var(--shadows-0)',
          },
        }}
      />
    </Box>
  );
}
