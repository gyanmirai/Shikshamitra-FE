import { it, expect, describe } from 'vitest';

import {
  roomFormSchema,
  totalRoomBenches,
  getRoomFormValues,
  getInitialColumnRows,
} from './room-layout';

import type { IRoom } from '../types';

describe('room layouts', () => {
  it('restores unequal column rows and calculates the total from them', () => {
    const room = { columnRows: [3, 2, 4], benchCapacity: 2 } as IRoom;
    expect(getInitialColumnRows(room)).toEqual([3, 2, 4]);
    expect(totalRoomBenches(getRoomFormValues(room).columnRows)).toBe(9);
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
