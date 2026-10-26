export interface FixtureWrite {
  method: string;
  path: string;
  body: Record<string, unknown>;
}

export function createRoomFixture() {
  let building = {
    id: 'synthetic-building',
    buildingName: 'Test Building',
    description: 'Synthetic building for local browser validation.',
    totalFloors: 1,
    floors: [
      {
        id: 'synthetic-floor',
        floorNo: 1,
        floorName: 'Test Floor',
        totalRoom: 1,
        roomCount: 1,
      },
    ],
  };
  const writes: FixtureWrite[] = [];
  return {
    writes,
    respond(method: string, path: string, body: Record<string, unknown> = {}) {
      if (path === '/fixture/writes') return { status: 200, json: writes };
      if (method === 'GET' && path === '/api/institute-setup/buildings') {
        return { status: 200, json: [building] };
      }
      if (method === 'GET' && path === `/api/institute-setup/buildings/${building.id}`) {
        return { status: 200, json: building };
      }
      if (method === 'GET' && path === '/api/app/room-type') {
        return {
          status: 200,
          json: { items: [{ id: 'synthetic-type', roomTypeName: 'Classroom' }] },
        };
      }
      if (method === 'GET' && path === '/api/institute-setup/rooms/features') {
        return { status: 200, json: { items: [{ id: 'synthetic-feature', name: 'Projector' }] } };
      }
      if (method === 'PUT' && path === `/api/institute-setup/buildings/${building.id}`) {
        writes.push({ method, path, body });
        const floors = body.floorsToUpdate as typeof building.floors;
        building = { ...building, floors: floors.map((floor) => ({ ...floor, roomCount: 1 })) };
        return { status: 200, json: building };
      }
      if (method === 'POST' && path === '/api/app/room') {
        writes.push({ method, path, body });
        return { status: 200, json: { ...body, id: 'synthetic-created-room' } };
      }
      return { status: 404, json: { error: `Unknown synthetic route: ${method} ${path}` } };
    },
  };
}
