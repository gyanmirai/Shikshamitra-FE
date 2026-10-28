import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useRoomAuditLogs } from './roomAvailability.hooks';
import { useRoomReservationPage } from './useRoomReservationPage';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
const exported = vi.hoisted(() => vi.fn());
vi.mock('src/components/customizabaleTable/table-export', () => ({ exportTable: exported }));

beforeEach(() => {
  exported.mockReset();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

const wrapperFor = () => {
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: defaults => defaults().concat(api.middleware) });
  return { store, wrapper: ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider> };
};
const row = (id: number) => ({ id: String(id), roomId: 'room', roomName: `Room ${id}`, status: 2, reservationType: 1 });

it('pages on the server, resets criteria before requesting, and sends visible search columns separately', async () => {
  const requests: URL[] = [];
  mswServer.use(http.get('*/api/academics/timetable/room-reservations/page', ({ request }) => {
    const url = new URL(request.url); requests.push(url);
    return HttpResponse.json({ items: [row(Number(url.searchParams.get('skipCount')))], totalCount: 70, statusCounts: { all: 70, pendingApproval: 70 } });
  }));
  const { store, wrapper } = wrapperFor();
  const probe = renderHook(({ scope }) => useRoomReservationPage(scope, false), { wrapper, initialProps: { scope: { isApprovalView: false } } });
  try {
    await waitFor(() => expect(probe.result.current.data[0]?.id).toBe('0'));
    await act(() => probe.result.current.tableProps.onServerPagination?.(3, 10));
    await waitFor(() => expect(probe.result.current.data[0]?.id).toBe('20'));
    await act(() => probe.result.current.tableProps.onServerSearch?.(''));
    expect(probe.result.current.tableProps.page).toBe(2);
    await act(() => probe.result.current.tableProps.onVisibleColumnsChange?.(['roomName', 'purpose']));
    expect(probe.result.current.tableProps.page).toBe(2);
    await act(() => probe.result.current.tableProps.onServerSearch?.('rare'));
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('searchTerm')).toBe('rare'));
    expect(requests.at(-1)?.searchParams.get('skipCount')).toBe('0');
    expect(requests.at(-1)?.searchParams.getAll('searchColumns')).toEqual(['roomName', 'purpose']);
    expect(probe.result.current.counts.all).toBe(70);
    probe.rerender({ scope: { isApprovalView: true } });
    await waitFor(() => expect(requests.at(-1)?.searchParams.get('isApprovalView')).toBe('true'));
    expect(requests.at(-1)?.searchParams.get('skipCount')).toBe('0');
    probe.rerender({ scope: { isApprovalView: false } });
    await waitFor(() => expect(probe.result.current.tableProps.searchTerm).toBe(''));
  } finally { probe.unmount(); store.dispatch(api.util.resetApiState()); }
});

it('exports every filtered page with the same search, filters and sort', async () => {
  const offsets: number[] = [];
  mswServer.use(http.get('*/api/academics/timetable/room-reservations/page', ({ request }) => {
    const url = new URL(request.url); const skip = Number(url.searchParams.get('skipCount'));
    if (url.searchParams.get('searchTerm') === 'export') {
      offsets.push(skip);
      return HttpResponse.json({ items: skip === 0 ? [row(1), row(2)] : [row(3)], totalCount: 3, statusCounts: { all: 3 } });
    }
    return HttpResponse.json({ items: [], totalCount: 0, statusCounts: {} });
  }));
  const { store, wrapper } = wrapperFor();
  const probe = renderHook(() => useRoomReservationPage({ isApprovalView: false }, false), { wrapper });
  try {
    await act(async () => probe.result.current.tableProps.onExport?.({ format: 'excel', columns: [{ id: 'roomName', label: 'Room' }], searchTerm: 'export', filters: [], sorts: [{ column: 'roomName', direction: 'desc' }] }));
    expect(offsets).toEqual([0, 2]);
    expect(exported).toHaveBeenCalledOnce();
    expect(exported.mock.calls[0][0].rows.map((entry: { id: string }) => entry.id)).toEqual(['1', '2', '3']);
  } finally { probe.unmount(); store.dispatch(api.util.resetApiState()); }
});

it('pages full audit snapshots and searches the complete history before paging', async () => {
  const requests: URL[] = [];
  mswServer.use(http.get('*/api/academics/timetable/room-availability/audit-logs/page', ({ request }) => {
    const url = new URL(request.url); requests.push(url);
    const id = url.searchParams.get('searchTerm') ? 'rare' : url.searchParams.get('skipCount');
    return HttpResponse.json({ totalCount: 45, items: [{ id, action: 'Updated', user: 'Teacher', dateTime: '2026-10-28', newValue: '{"purpose":"kept inline"}' }] });
  }));
  const { store, wrapper } = wrapperFor();
  const probe = renderHook(({ search }) => useRoomAuditLogs('room', { searchTerm: search }), { wrapper, initialProps: { search: '' } });
  try {
    await waitFor(() => expect(probe.result.current.data[0]?.id).toBe('0'));
    await act(() => probe.result.current.setPage(1));
    await waitFor(() => expect(probe.result.current.data[0]?.id).toBe('20'));
    probe.rerender({ search: 'rare' });
    await waitFor(() => expect(probe.result.current.data[0]?.id).toBe('rare'));
    expect(requests.at(-1)?.searchParams.get('skipCount')).toBe('0');
    expect(probe.result.current.data[0]?.newValue).toBe('{"purpose":"kept inline"}');
  } finally { probe.unmount(); store.dispatch(api.util.resetApiState()); }
});
