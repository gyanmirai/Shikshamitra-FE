import { vi, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { roomsApi } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { createRoomTestWrapper } from 'src/components/timetable/room-defaults-test-fixture';

import { restoreRoomToPage, removeRoomFromPage } from './room-cache';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('restores overlapping removals in their original order with the current total', async () => {
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/room', () =>
      HttpResponse.json({ items: [{ id: 'room-a' }, { id: 'room-b' }], totalCount: 2 })
    )
  );
  const { store } = createRoomTestWrapper();
  const params = { maxResultCount: 25 };
  const page = await store.dispatch(roomsApi.endpoints.getRooms.initiate(params)).unwrap();
  const order = page.items.map((room) => room.id);
  store.dispatch(removeRoomFromPage(params, 'room-a'));
  store.dispatch(removeRoomFromPage(params, 'room-b'));
  store.dispatch(restoreRoomToPage(params, page.items[0], order));
  expect(roomsApi.endpoints.getRooms.select(params)(store.getState()).data).toMatchObject({
    items: [{ id: 'room-a' }],
    totalCount: 1,
  });
  store.dispatch(restoreRoomToPage(params, page.items[1], order));
  expect(roomsApi.endpoints.getRooms.select(params)(store.getState()).data).toMatchObject({
    items: [{ id: 'room-a' }, { id: 'room-b' }],
    totalCount: 2,
  });
  store.dispatch(roomsApi.util.resetApiState());
});

it('removes and restores the exact filtered page and total without modifying another page', async () => {
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/room', ({ request }) =>
      HttpResponse.json({
        items: [
          {
            id:
              new URL(request.url).searchParams.get('floorId') === 'floor-a' ? 'room-a' : 'room-b',
          },
        ],
        totalCount: 51,
      })
    )
  );
  const { store } = createRoomTestWrapper();
  const first = { buildingId: 'building-a', floorId: 'floor-a', skipCount: 25, maxResultCount: 25 };
  const other = { ...first, floorId: 'floor-b' };
  await Promise.all([
    store.dispatch(roomsApi.endpoints.getRooms.initiate(first)).unwrap(),
    store.dispatch(roomsApi.endpoints.getRooms.initiate(other)).unwrap(),
  ]);
  const patch = store.dispatch(removeRoomFromPage(first, 'room-a'));
  expect(roomsApi.endpoints.getRooms.select(first)(store.getState()).data).toMatchObject({
    items: [],
    totalCount: 50,
  });
  expect(roomsApi.endpoints.getRooms.select(other)(store.getState()).data).toMatchObject({
    items: [{ id: 'room-b' }],
    totalCount: 51,
  });
  patch.undo();
  expect(roomsApi.endpoints.getRooms.select(first)(store.getState()).data).toMatchObject({
    items: [{ id: 'room-a' }],
    totalCount: 51,
  });
  store.dispatch(roomsApi.util.resetApiState());
});
