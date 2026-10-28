import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useRoomAvailability, useRoomReservations } from './roomAvailability.hooks';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => { clearCachedAuthSession(); });

it('loads only the selected room tab and safely ignores refreshes for an inactive query', async () => {
  const counts = { availability: 0, reservations: 0 };
  mswServer.use(
    http.get('*/api/academics/timetable/room-availability', () => { counts.availability += 1; return HttpResponse.json([]); }),
    http.get('*/api/academics/timetable/room-reservations/page', () => { counts.reservations += 1; return HttpResponse.json({ items: [], totalCount: 0, statusCounts: {} }); }),
  );
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (defaults) => defaults().concat(api.middleware) });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const probe = renderHook(({ tab }: { tab: string }) => ({
    availability: useRoomAvailability({ date: '2026-10-28' }, { skip: tab !== 'availability' }),
    reservations: useRoomReservations({}, { skip: tab === 'availability' }),
  }), { wrapper, initialProps: { tab: 'availability' } });
  try {
    await waitFor(() => expect(counts.availability).toBe(1));
    expect(counts.reservations).toBe(0);
    await act(() => { probe.result.current.reservations.fetch(); });
    expect(counts.reservations).toBe(0);
    probe.rerender({ tab: 'reservations' });
    await waitFor(() => expect(counts.reservations).toBe(1));
    await act(() => { probe.result.current.availability.fetch(); });
    expect(counts.availability).toBe(1);
  } finally { probe.unmount(); store.dispatch(api.util.resetApiState()); }
});
