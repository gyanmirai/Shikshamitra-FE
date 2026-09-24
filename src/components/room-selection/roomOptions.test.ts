import { it, expect, describe } from 'vitest';

import { sortRoomOptions, createRoomOption } from './roomOptions';

describe('room options', () => {
  it('groups a room by building and floor', () => {
    expect(
      createRoomOption({
        id: 'room-1',
        roomName: 'B106',
        buildingName: 'Science Block',
        floorName: 'First Floor',
      })
    ).toMatchObject({
      id: 'room-1',
      label: 'Science Block › First Floor › B106',
      group: 'Science Block › First Floor',
    });
  });

  it('keeps groups and room numbers in natural display order', () => {
    const rooms = ['B106', 'B104'].map((roomName) =>
      createRoomOption({ id: roomName, roomName, buildingName: 'Science Block', floorName: '1' })
    );

    expect(sortRoomOptions(rooms).map((room) => room.roomName)).toEqual(['B104', 'B106']);
  });

  it('provides understandable fallback groups for incomplete room data', () => {
    expect(createRoomOption({ roomId: 'room-2' })).toMatchObject({
      id: 'room-2',
      roomName: 'Unnamed room',
      group: 'Other building › Other floor',
    });
  });
});
