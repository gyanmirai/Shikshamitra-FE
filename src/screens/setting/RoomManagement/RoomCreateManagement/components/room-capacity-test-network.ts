import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';

import { prepareRoomFormNetwork } from './room-form-test-network';

export function capacityNetwork() {
  const state = {
    totalRoom: 1,
    roomCount: 1,
    otherFloor: false,
    failBuildingSave: false,
    failBuildings: false,
    buildingReads: 0,
    buildingWrites: [] as Record<string, unknown>[],
    roomWrites: [] as Record<string, unknown>[],
    roomWritePaths: [] as string[],
  };
  const building = () => ({
    id: 'building-a',
    buildingName: 'Main',
    description: 'Teaching block',
    totalFloors: 1,
    floors: [
      {
        id: 'floor-a',
        floorNo: 1,
        floorName: 'First',
        totalRoom: state.totalRoom,
        roomCount: state.roomCount,
      },
      ...(state.otherFloor
        ? [{ id: 'floor-b', floorNo: 2, floorName: 'Second', totalRoom: 2, roomCount: 0 }]
        : []),
    ],
  });
  prepareRoomFormNetwork();
  mswServer.use(
    http.get('*/api/institute-setup/buildings', () => {
      state.buildingReads += 1;
      return state.failBuildings
        ? HttpResponse.json({ detail: 'Building refresh failed.' }, { status: 500 })
        : HttpResponse.json([building()]);
    }),
    http.get('*/api/institute-setup/buildings/building-a', () => HttpResponse.json(building())),
    http.put('*/api/institute-setup/buildings/building-a', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      state.buildingWrites.push(body);
      if (state.failBuildingSave) {
        return HttpResponse.json({ detail: 'Building save failed.' }, { status: 500 });
      }
      const floors = body.floorsToUpdate as { totalRoom: number }[];
      state.totalRoom = floors[0].totalRoom;
      return HttpResponse.json(building());
    }),
    http.post('*/api/institute-setup/rooms', async ({ request }) => {
      const body = JSON.parse(String((await request.formData()).get('input')));
      state.roomWrites.push(body);
      state.roomWritePaths.push(new URL(request.url).pathname);
      return HttpResponse.json({ ...body, id: 'new-room' });
    }),
    http.put('*/api/institute-setup/rooms/room-a', async ({ request }) => {
      const body = JSON.parse(String((await request.formData()).get('input')));
      state.roomWrites.push(body);
      state.roomWritePaths.push(new URL(request.url).pathname);
      return HttpResponse.json({ ...body, id: 'room-a' });
    })
  );
  return state;
}
