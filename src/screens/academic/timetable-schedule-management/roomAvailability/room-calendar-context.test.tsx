import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { academicCalendarType } from 'src/redux/tagTypes';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useRoomSchedule, useRoomAvailability, useCreateRoomReservation } from './roomAvailability.hooks';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => { clearCachedAuthSession(); });

function fixture() {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: (state = { currentMedium: { id: 'english' } }, action = { type: '' }) =>
        action.type === 'test/medium' ? { currentMedium: { id: 'hindi' } } : state,
    },
    middleware: defaults => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  return { store, wrapper };
}

it('keys the room list and direct timeline by the selected medium and the exact date', async () => {
  const requests: URL[] = [];
  mswServer.use(
    http.get('*/api/academics/timetable/room-availability', ({ request }) => {
      requests.push(new URL(request.url)); return HttpResponse.json([]);
    }),
    http.get('*/api/academics/timetable/room-availability/schedule', ({ request }) => {
      requests.push(new URL(request.url)); return HttpResponse.json({ slots: [] });
    }),
  );
  const { store, wrapper } = fixture();
  const probe = renderHook(() => ({
    list: useRoomAvailability({ date: '2026-10-31' }),
    timeline: useRoomSchedule('room-1', '2026-10-31'),
  }), { wrapper });
  try {
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests.every(url => url.searchParams.get('academicMediumId') === 'english')).toBe(true);
    expect(requests.every(url => url.searchParams.get('date') === '2026-10-31')).toBe(true);
    act(() => { store.dispatch({ type: 'test/medium' }); });
    await waitFor(() => expect(requests).toHaveLength(4));
    expect(requests.slice(2).every(url => url.searchParams.get('academicMediumId') === 'hindi')).toBe(true);
  } finally { probe.unmount(); store.dispatch(api.util.resetApiState()); }
});

it('refreshes the room list and timeline when academic calendar days change', async () => {
  const counts = { list: 0, timeline: 0 };
  mswServer.use(
    http.get('*/api/academics/timetable/room-availability', () => {
      counts.list += 1; return HttpResponse.json([]);
    }),
    http.get('*/api/academics/timetable/room-availability/schedule', () => {
      counts.timeline += 1; return HttpResponse.json({ slots: [] });
    }),
  );
  const { store, wrapper } = fixture();
  const probe = renderHook(() => ({
    list: useRoomAvailability({ date: '2026-10-31' }), timeline: useRoomSchedule('room-1', '2026-10-31'),
  }), { wrapper });
  try {
    await waitFor(() => expect(counts).toEqual({ list: 1, timeline: 1 }));
    act(() => { store.dispatch(api.util.invalidateTags([academicCalendarType.calendarDay])); });
    await waitFor(() => expect(counts).toEqual({ list: 2, timeline: 2 }));
  } finally { probe.unmount(); store.dispatch(api.util.resetApiState()); }
});

it('validates direct booking in the same medium as its timeline', async () => {
  let body: Record<string, unknown> | undefined;
  mswServer.use(http.post('*/api/academics/timetable/room-reservations', async ({ request }) => {
    body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 'reservation-1', roomId: 'room-1', date: '2026-10-31', status: 1 });
  }));
  const { store, wrapper } = fixture();
  const probe = renderHook(() => useCreateRoomReservation(), { wrapper });
  try {
    await act(async () => { await probe.result.current.create({ roomId: 'room-1', date: '2026-10-31', purpose: 'Regression' }); });
    expect(body).toMatchObject({ academicMediumId: 'english', date: '2026-10-31' });
  } finally { probe.unmount(); store.dispatch(api.util.resetApiState()); }
});
