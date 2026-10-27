import { it, expect, describe } from 'vitest';

import {
  roomFormSchema,
  totalRoomBenches,
  getRoomFormValues,
  getInitialColumnRows,
} from './room-layout';

import type { IRoom } from '../types';

describe('room layouts', () => {
  const validRoom = {
    roomName: 'Activity Hall',
    building: 'b',
    floor: 'f',
    roomType: 't',
    columns: 2,
    columnRows: [3, 2],
    benchCapacity: 2,
    features: [],
  };
  it.each([
    { columns: 0, columnRows: [], benchCapacity: 0 },
    { columns: 0, columnRows: [], benchCapacity: 2 },
    { columns: 2, columnRows: [3, 2], benchCapacity: 0 },
  ])('accepts a zero seating configuration %j', async (layout) => {
    await expect(roomFormSchema.validate({ ...validRoom, ...layout })).resolves.toMatchObject(
      layout
    );
  });
  it.each([
    { columns: -1, columnRows: [] },
    { columns: 0.5, columnRows: [] },
    { columns: 51, columnRows: [] },
    { columns: '', columnRows: [] },
    { columns: 0, columnRows: [3] },
    { benchCapacity: -1 },
    { benchCapacity: 0.5 },
    { benchCapacity: 21 },
    { benchCapacity: '' },
    { columnRows: [3, 0] },
  ])('retains invalid-layout validation %j', async (layout) => {
    await expect(roomFormSchema.validate({ ...validRoom, ...layout })).rejects.toThrow();
  });
  it('restores saved zero values and respects an explicitly empty layout', () => {
    const room = { columnRows: [], benchesPerColumn: 0, benchCapacity: 0 } as unknown as IRoom;
    expect(getRoomFormValues(room)).toMatchObject({ columns: 0, columnRows: [], benchCapacity: 0 });
    expect(getInitialColumnRows({ ...room, benchesPerColumn: 3, benchesPerRow: 4 })).toEqual([]);
    expect(getRoomFormValues()).toMatchObject({ columns: '', benchCapacity: '' });
  });
  it('restores unequal column rows and calculates the total from them', () => {
    const room = { columnRows: [3, 2, 4], benchCapacity: 2 } as IRoom;
    expect(getInitialColumnRows(room)).toEqual([3, 2, 4]);
    expect(totalRoomBenches(getRoomFormValues(room).columnRows, room.benchCapacity)).toBe(9);
  });
  it('preserves legacy partially filled grids in row order', () => {
    expect(
      getInitialColumnRows({ benchesPerColumn: 3, benchesPerRow: 4, totalBenches: 10 } as IRoom)
    ).toEqual([4, 3, 3]);
  });
  it.each([[3, 2.5], [3, -1], [3, 101], [3, ''], [3], []])(
    'rejects invalid or missing column row counts %j',
    async (...rows) => {
      await expect(
        roomFormSchema.validate({
          roomName: 'A101',
          building: 'b',
          floor: 'f',
          roomType: 't',
          columns: 2,
          columnRows: rows,
          benchCapacity: 2,
          features: [],
        })
      ).rejects.toThrow();
    }
  );
});
