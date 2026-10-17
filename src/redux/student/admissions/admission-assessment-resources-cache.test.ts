import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { roomsApi } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { buildingsApi } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import { admissionAssessmentPlanningApi } from './admission-assessment-planning-api';
import { assessmentPath, createAssessmentTestStore } from './assessment-test-fixture';

import type { AssessmentSessionRoom } from './admission-assessment-types';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createAssessmentTestStore>;
let rooms: AssessmentSessionRoom[];
let resourceReads: number;
const room: AssessmentSessionRoom = {
  id: 'room-1',
  roomName: 'A001',
  buildingId: 'building-1',
  buildingName: 'Main Block',
  floorId: 'floor-1',
  floorName: 'Ground Floor',
  capacity: 24,
};
const resources = admissionAssessmentPlanningApi.endpoints.getAssessmentSessionResources;
const cachedRooms = () => resources.select()(store.getState()).data?.rooms;

beforeEach(() => {
  clearCachedAuthSession();
  store = createAssessmentTestStore();
  rooms = [];
  resourceReads = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get(`${assessmentPath}/session-resources`, () => {
      resourceReads += 1;
      return HttpResponse.json({ data: { rooms, interviewers: [] } });
    })
  );
});

afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('refreshes subscribed room choices after Institute Setup room creation, capacity changes and deletion', async () => {
  const updatedRoom = { ...room, roomName: 'A002', capacity: 30 };
  mswServer.use(
    http.post('*/api/app/room', () => {
      rooms = [room];
      return HttpResponse.json(room);
    }),
    http.put('*/api/app/room/room-1', () => {
      rooms = [updatedRoom];
      return HttpResponse.json(updatedRoom);
    }),
    http.delete('*/api/app/room/room-1', () => {
      rooms = [];
      return new HttpResponse(null, { status: 204 });
    })
  );
  await store.dispatch(resources.initiate()).unwrap();
  expect(cachedRooms()).toEqual([]);

  await store.dispatch(roomsApi.endpoints.addRoom.initiate(room)).unwrap();
  await waitFor(() => expect(cachedRooms()).toEqual([room]));

  await store
    .dispatch(roomsApi.endpoints.updateRoom.initiate({ id: room.id, body: updatedRoom }))
    .unwrap();
  await waitFor(() => expect(cachedRooms()).toEqual([updatedRoom]));

  await store.dispatch(roomsApi.endpoints.deleteRoom.initiate(room.id)).unwrap();
  await waitFor(() => expect(cachedRooms()).toEqual([]));
  expect(resourceReads).toBe(4);
});

it.each(['create', 'update', 'delete'] as const)(
  'refreshes subscribed room/building/floor choices after a building %s',
  async (operation) => {
    const updatedRoom = { ...room, buildingName: 'Academic Block', floorName: 'First Floor' };
    rooms = operation === 'create' ? [] : [room];
    const nextRooms = operation === 'delete' ? [] : [updatedRoom];
    const respond = () => {
      rooms = nextRooms;
      return HttpResponse.json({ id: room.buildingId });
    };
    mswServer.use(
      http.post('*/api/institute-setup/buildings', respond),
      http.put('*/api/institute-setup/buildings/building-1', respond),
      http.delete('*/api/institute-setup/buildings/building-1', respond)
    );
    await store.dispatch(resources.initiate()).unwrap();

    if (operation === 'create') {
      await store
        .dispatch(buildingsApi.endpoints.addBuilding.initiate({ name: updatedRoom.buildingName }))
        .unwrap();
    } else if (operation === 'update') {
      await store
        .dispatch(
          buildingsApi.endpoints.updateBuilding.initiate({
            id: room.buildingId,
            body: { name: updatedRoom.buildingName },
          })
        )
        .unwrap();
    } else {
      await store
        .dispatch(buildingsApi.endpoints.deleteBuilding.initiate(room.buildingId))
        .unwrap();
    }

    await waitFor(() => expect(cachedRooms()).toEqual(nextRooms));
    expect(resourceReads).toBe(2);
  }
);

it('reloads an unused empty resource cache on drawer reopen after a room is added', async () => {
  mswServer.use(
    http.post('*/api/app/room', () => {
      rooms = [room];
      return HttpResponse.json(room);
    })
  );
  const subscription = store.dispatch(resources.initiate());
  await subscription.unwrap();
  subscription.unsubscribe();

  await store.dispatch(roomsApi.endpoints.addRoom.initiate(room)).unwrap();
  const reopened = await store.dispatch(resources.initiate()).unwrap();
  expect(reopened.rooms).toEqual([room]);
  expect(resourceReads).toBe(2);
});
