import type { PropsWithChildren } from 'react';

import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import globalState from 'src/redux/globalState/globalSlice';
import { act, waitFor, renderHook } from '@testing-library/react';
import { DayType, CalendarStatus, CalendarDayStatus } from 'src/enums/academic-calendar';
import { academicCalendarApi } from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

import { useAcademicDatePickerRules } from './useAcademicDatePickerRules';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

describe('academic picker holiday synchronization', () => {
  it('selects the calendar covering the school date and excludes archived defaults', async () => {
    const requested: string[] = [];
    mswServer.use(
      http.get('*/api/auth/session', () => HttpResponse.json(null)),
      http.get('*/api/academic/calendars', () => HttpResponse.json({ items: [
        { id: 'archived', status: CalendarStatus.Archived, isDefault: true,
          startDate: '2026-06-01', endDate: '2027-05-31' },
        { id: 'old-published', status: CalendarStatus.Published,
          startDate: '2025-06-01', endDate: '2026-05-31' },
        { id: 'current', status: CalendarStatus.Published,
          startDate: '2026-06-01T00:00:00+05:30', endDate: '2027-05-31T00:00:00+05:30' },
      ] })),
      http.get('*/api/academic/calendars/:calendarId/days', ({ params }) => {
        requested.push(String(params.calendarId));
        return HttpResponse.json([]);
      })
    );
    const store = configureStore({
      reducer: { globalState, [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware),
    });
    const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
    const { result } = renderHook(() => useAcademicDatePickerRules({
      academicMediumId: 'english', anchorDate: dayjs('2026-10-29'),
    }), { wrapper });
    await waitFor(() => expect(requested.length).toBeGreaterThan(0));
    expect(requested).toEqual(['current']);
    await act(async () => { result.current.setVisibleMonth(dayjs('2026-11-01')); });
    await waitFor(() => expect(result.current.visibleMonth.format('YYYY-MM')).toBe('2026-11'));
  });

  it('uses the school date, ignores cancelled holidays and unblocks after deletion', async () => {
    const timestamp = '2026-09-14T00:00:00Z';
    const calendarDate = dayjs('2026-09-14');
    const earlierDate = calendarDate.subtract(1, 'day');
    let deleted = false;
    let reads = 0;
    mswServer.use(
      http.get('*/api/auth/session', () => HttpResponse.json(null)),
      http.get('*/api/academic/calendars/calendar-one/days', () => {
        reads += 1;
        return HttpResponse.json([
          ...(!deleted
            ? [
                {
                  id: 'holiday-one',
                  date: timestamp,
                  title: 'Ganesh Chaturthi',
                  dayType: DayType.Holiday,
                  status: CalendarDayStatus.Active,
                  appliesToAll: true,
                },
              ]
            : []),
          {
            id: 'cancelled-holiday',
            date: earlierDate.format('YYYY-MM-DD'),
            title: 'Cancelled holiday',
            dayType: DayType.Holiday,
            status: CalendarDayStatus.Cancelled,
            appliesToAll: true,
          },
        ]);
      }),
      http.delete('*/api/academic/calendar-days/holiday-one', () => {
        deleted = true;
        return new HttpResponse(null, { status: 204 });
      })
    );
    const store = configureStore({
      reducer: { globalState, [api.reducerPath]: api.reducer },
      middleware: (defaults) => defaults().concat(api.middleware),
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(
      () =>
        useAcademicDatePickerRules({
          calendarId: 'calendar-one',
          anchorDate: calendarDate,
        }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    await waitFor(() => expect(reads).toBe(1));
    expect(result.current.getBlockingDay(calendarDate)?.id).toBe('holiday-one');
    expect(result.current.getBlockingDay(earlierDate)).toBeUndefined();
    await act(async () => {
      await store
        .dispatch(academicCalendarApi.endpoints.deleteCalendarDay.initiate('holiday-one'))
        .unwrap();
    });
    await waitFor(() => expect(reads).toBe(2));
    await waitFor(() => expect(result.current.getBlockingDay(calendarDate)).toBeUndefined());
  });
});
