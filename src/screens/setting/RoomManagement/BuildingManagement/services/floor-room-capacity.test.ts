import { it, expect } from 'vitest';

import { floorRoomLimitCode, getFloorRoomLimitFailure } from './floor-room-capacity';

const floors = [
  { id: 'floor-b', floorNo: 2, floorName: 'First Floor', totalRoom: 5 },
  { id: 'floor-a', floorNo: 1, floorName: 'Renamed Floor', totalRoom: 1 },
];
const data = { FloorId: 'floor-a', FloorName: 'First Floor', RoomLimit: 1, RoomCount: 2 };

it.each([
  { status: 400, data: { errorCode: floorRoomLimitCode, detail: 'Capacity changed.', data } },
  {
    status: 403,
    data: { error: { code: floorRoomLimitCode, message: 'Capacity changed.', data } },
  },
])('locates the affected floor by ID for the supported error envelopes', (error) => {
  expect(getFloorRoomLimitFailure(error, floors)).toEqual({
    index: 1,
    floorId: 'floor-a',
    roomCount: 2,
    message:
      'Cannot set total rooms to 1. First Floor already has 2 rooms. Delete or reassign existing rooms before reducing the total room capacity.',
  });
});

it('leaves unrelated and incomplete errors to form-level handling', () => {
  expect(getFloorRoomLimitFailure({ data: { errorCode: 'Other', data } }, floors)).toBeUndefined();
  expect(
    getFloorRoomLimitFailure(
      { data: { errorCode: floorRoomLimitCode, data: { RoomCount: 2 } } },
      floors
    )
  ).toBeUndefined();
});
