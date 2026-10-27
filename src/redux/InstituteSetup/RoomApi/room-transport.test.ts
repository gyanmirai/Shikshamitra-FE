import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { roomTypeApi } from 'src/redux/InstituteSetup/RoomTypeApi/roomTypeApi';
import { buildingsApi } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import { roomsApi } from './RoomApi';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const createStore = () =>
  configureStore({
    reducer: { [roomsApi.reducerPath]: roomsApi.reducer },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(roomsApi.middleware),
  });

beforeEach(() => {
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

it.each(['create', 'update'] as const)(
  'sends %s metadata and an optional photo as one multipart request',
  async (operation) => {
    let submitted: FormData | undefined;
    const handle = async ({ request }: { request: Request }) => {
      submitted = await request.formData();
      return HttpResponse.json({ id: 'room-a', roomName: 'A101' });
    };
    mswServer.use(
      http.post('*/api/institute-setup/rooms', handle),
      http.put('*/api/institute-setup/rooms/room-a', handle)
    );
    const store = createStore();
    const body = {
      roomName: 'A101',
      removeImage: false,
      image: new File(['photo'], 'room.png', { type: 'image/png' }),
    };
    const response =
      operation === 'create'
        ? store.dispatch(roomsApi.endpoints.addRoom.initiate(body))
        : store.dispatch(roomsApi.endpoints.updateRoom.initiate({ id: 'room-a', body }));
    await response.unwrap();
    expect(JSON.parse(String(submitted?.get('input')))).toEqual({
      roomName: 'A101',
      removeImage: false,
    });
    const photo = submitted?.get('image') as File;
    expect(photo.name).toBe('room.png');
    expect(await photo.text()).toBe('photo');
    store.dispatch(roomsApi.util.resetApiState());
  }
);

it('reads the authenticated binary photo endpoint without a base64 JSON response', async () => {
  mswServer.use(
    http.get(
      '*/api/institute-setup/rooms/room-a/image/file',
      () => new HttpResponse('image bytes', { headers: { 'Content-Type': 'image/png' } })
    )
  );
  const store = createStore();
  const image = await store.dispatch(roomsApi.endpoints.getRoomImage.initiate('room-a')).unwrap();
  expect(image).toBeInstanceOf(Blob);
  expect(await image?.text()).toBe('image bytes');
  store.dispatch(roomsApi.util.resetApiState());
});

it('refreshes only the feature catalogue when a reusable feature is added', async () => {
  const reads = { rooms: 0, image: 0, features: 0 };
  mswServer.use(
    http.get('*/api/app/room', () => {
      reads.rooms += 1;
      return HttpResponse.json({ items: [], totalCount: 0 });
    }),
    http.get('*/api/institute-setup/rooms/room-a/image/file', () => {
      reads.image += 1;
      return new HttpResponse('photo', { headers: { 'Content-Type': 'image/png' } });
    }),
    http.get('*/api/institute-setup/rooms/features', () => {
      reads.features += 1;
      return HttpResponse.json({ items: [] });
    }),
    http.post('*/api/institute-setup/rooms/features', () =>
      HttpResponse.json({ id: 'smart', name: 'Smart board' })
    )
  );
  const store = createStore();
  await Promise.all([
    store.dispatch(roomsApi.endpoints.getRooms.initiate({ maxResultCount: 25 })).unwrap(),
    store.dispatch(roomsApi.endpoints.getRoomImage.initiate('room-a')).unwrap(),
    store.dispatch(roomsApi.endpoints.getRoomFeatures.initiate()).unwrap(),
  ]);
  await store
    .dispatch(roomsApi.endpoints.addRoomFeature.initiate({ name: 'Smart board' }))
    .unwrap();
  await waitFor(() => expect(reads.features).toBe(2));
  expect(reads).toEqual({ rooms: 1, image: 1, features: 2 });
  store.dispatch(roomsApi.util.resetApiState());
});

it.each(['building', 'room type'] as const)(
  'refreshes room labels after a %s rename',
  async (resource) => {
    let reads = 0;
    mswServer.use(
      http.get('*/api/app/room', () => {
        reads += 1;
        return HttpResponse.json({ items: [], totalCount: 0 });
      }),
      http.put('*/api/institute-setup/buildings/building-a', () =>
        HttpResponse.json({ id: 'building-a' })
      ),
      http.put('*/api/app/room-type/type-a', () => HttpResponse.json({ id: 'type-a' }))
    );
    const store = createStore();
    await store.dispatch(roomsApi.endpoints.getRooms.initiate({ maxResultCount: 25 })).unwrap();
    if (resource === 'building')
      await store
        .dispatch(
          buildingsApi.endpoints.updateBuilding.initiate({
            id: 'building-a',
            body: { buildingName: 'Renamed' },
          })
        )
        .unwrap();
    else
      await store
        .dispatch(
          roomTypeApi.endpoints.updateRoomType.initiate({
            id: 'type-a',
            body: { roomTypeName: 'Renamed' },
          })
        )
        .unwrap();
    await waitFor(() => expect(reads).toBe(2));
    store.dispatch(roomsApi.util.resetApiState());
  }
);
