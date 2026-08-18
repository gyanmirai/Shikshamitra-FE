import { describe, expect, it } from 'vitest';

import { upsertSeatingRoomLayout } from './mappers';

import type { SeatingRoomLayout } from '../types';

const createRoom = (roomId: string, capacity = 36): SeatingRoomLayout => ({
  roomId,
  roomName: roomId,
  capacity,
  rows: 6,
  columns: 3,
  benchCapacity: 2,
  seats: [],
});

describe('upsertSeatingRoomLayout', () => {
  it('replaces a refreshed room without changing its position', () => {
    const rooms = [createRoom('B103'), createRoom('B105'), createRoom('B104')];

    const result = upsertSeatingRoomLayout(rooms, createRoom('B103', 40));

    expect(result.map((room) => room.roomId)).toEqual(['B103', 'B105', 'B104']);
    expect(result[0].capacity).toBe(40);
  });

  it('preserves room order across repeated active-room changes', () => {
    const rooms = [createRoom('B103'), createRoom('B105'), createRoom('B104')];
    const afterB105 = upsertSeatingRoomLayout(rooms, createRoom('B105', 42));
    const afterB104 = upsertSeatingRoomLayout(afterB105, createRoom('B104', 44));

    expect(afterB104.map((room) => room.roomId)).toEqual(['B103', 'B105', 'B104']);
  });

  it('appends a room that has not been loaded before', () => {
    const rooms = [createRoom('B103'), createRoom('B105')];

    const result = upsertSeatingRoomLayout(rooms, createRoom('B104'));

    expect(result.map((room) => room.roomId)).toEqual(['B103', 'B105', 'B104']);
  });
});
