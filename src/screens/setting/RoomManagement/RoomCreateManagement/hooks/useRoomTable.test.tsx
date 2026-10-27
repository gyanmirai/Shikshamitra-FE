import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';
import {
  deferredResponse,
  createRoomTestWrapper,
} from 'src/components/timetable/room-defaults-test-fixture';

import { useRoomTable } from './useRoomTable';
import { ALL_ROOMS_FILTER } from '../types/room-table';
import { removeRoomFromPage } from '../services/room-cache';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(() => {
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/institute-setup/buildings', () => HttpResponse.json([])),
    http.get('*/api/app/room', () =>
      HttpResponse.json({ items: [{ id: 'room-a', roomName: 'A101' }] })
    )
  );
});

it('retains current rows during a same-context refresh and replaces them after success', async () => {
  const { result } = renderHook(useRoomTable, createRoomTestWrapper());
  await waitFor(() => expect(result.current.rooms[0]?.roomName).toBe('A101'));
  const gate = deferredResponse();
  mswServer.use(
    http.get('*/api/app/room', async () => {
      await gate.pending;
      return HttpResponse.json({ items: [{ id: 'room-a', roomName: 'Updated A101' }] });
    })
  );
  act(() => {
    result.current.roomsQuery.refetch();
  });
  await waitFor(() => expect(result.current.roomsQuery.isFetching).toBe(true));
  expect(result.current.rooms[0]?.roomName).toBe('A101');
  await act(async () => {
    gate.release();
  });
  await waitFor(() => expect(result.current.rooms[0]?.roomName).toBe('Updated A101'));
});

it('clears the dependent floor when changing buildings and never displays another context while loading', async () => {
  const { result } = renderHook(useRoomTable, createRoomTestWrapper());
  await waitFor(() => expect(result.current.rooms[0]?.roomName).toBe('A101'));
  act(() => {
    result.current.changeBuilding('building-a');
    result.current.setFloorId('floor-a');
  });
  await waitFor(() => expect(result.current.roomsQuery.isFetching).toBe(false));
  const gate = deferredResponse();
  let requestUrl: URL | undefined;
  mswServer.use(
    http.get('*/api/app/room', async ({ request }) => {
      requestUrl = new URL(request.url);
      await gate.pending;
      return HttpResponse.json({ items: [] });
    })
  );
  act(() => result.current.changeBuilding('building-b'));
  await waitFor(() => expect(requestUrl?.searchParams.get('buildingId')).toBe('building-b'));
  expect(requestUrl?.searchParams.has('floorId')).toBe(false);
  expect(result.current.floorId).toBe(ALL_ROOMS_FILTER);
  expect(result.current.rooms).toEqual([]);
  await act(async () => {
    gate.release();
  });
  await waitFor(() => expect(result.current.roomsQuery.isFetching).toBe(false));
});

it('requests bounded server pages and resets the page when search or sorting changes', async () => {
  const requests: URL[] = [];
  mswServer.use(
    http.get('*/api/app/room', ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json({ items: [{ id: 'room-a', roomName: 'A101' }], totalCount: 1201 });
    })
  );
  const { result } = renderHook(useRoomTable, createRoomTestWrapper());
  await waitFor(() => expect(result.current.rooms).toHaveLength(1));
  expect(requests.at(-1)?.searchParams.get('maxResultCount')).toBe('25');
  expect(result.current.totalCount).toBe(1201);
  act(() => result.current.changePage(2, 25));
  await waitFor(() => expect(requests.at(-1)?.searchParams.get('skipCount')).toBe('50'));
  act(() => result.current.changeSearch('Laboratory'));
  await waitFor(() => expect(requests.at(-1)?.searchParams.get('filter')).toBe('Laboratory'));
  expect(requests.at(-1)?.searchParams.get('skipCount')).toBe('0');
  act(() => result.current.changeSort([{ column: 'capacity', direction: 'desc' }]));
  await waitFor(() => expect(requests.at(-1)?.searchParams.get('sorting')).toBe('capacity desc'));
});

it('moves an empty final page to the previous page after the server confirms a deletion', async () => {
  let totalCount = 51;
  const requests: number[] = [];
  mswServer.use(
    http.get('*/api/app/room', ({ request }) => {
      const skip = Number(new URL(request.url).searchParams.get('skipCount'));
      requests.push(skip);
      return HttpResponse.json({
        items:
          skip >= totalCount
            ? []
            : [{ id: skip === 50 ? 'last-room' : 'room-a', roomName: 'Room' }],
        totalCount,
      });
    })
  );
  const wrapper = createRoomTestWrapper();
  const { result } = renderHook(useRoomTable, wrapper);
  await waitFor(() => expect(result.current.totalCount).toBe(51));
  act(() => result.current.changePage(2, 25));
  await waitFor(() => expect(result.current.rooms[0]?.id).toBe('last-room'));
  act(() => {
    wrapper.store.dispatch(removeRoomFromPage(result.current.params, 'last-room'));
  });
  expect(result.current.page).toBe(2);
  totalCount = 50;
  await act(async () => {
    await result.current.roomsQuery.refetch();
  });
  await waitFor(() => expect(result.current.page).toBe(1));
  await waitFor(() => expect(requests.at(-1)).toBe(25));
  expect(result.current.totalCount).toBe(50);
});
