import * as Yup from 'yup';

import type { IRoom } from '../types';
import type { RoomFormValues } from '../types/room-form';

export function getInitialColumnRows(room?: IRoom | null): number[] {
  if (room?.columnRows) return [...room.columnRows];
  if (!room?.benchesPerColumn) return [];
  // Legacy partial grids fill benches from the front, row by row.
  const columns = Math.min(50, room.benchesPerColumn);
  const total = room.totalBenches || room.benchesPerRow * columns;
  return Array.from({ length: columns }, (_, column) =>
    Math.max(0, Math.floor(total / columns) + (column < total % columns ? 1 : 0))
  );
}

export function getRoomFormValues(room?: IRoom | null): RoomFormValues {
  const columnRows = getInitialColumnRows(room);
  return {
    roomName: room?.roomName ?? '',
    building: room?.buildingId ?? '',
    floor: room?.floorId ?? '',
    roomType: room?.roomTypeId ?? '',
    columns: room ? columnRows.length : '',
    columnRows,
    benchCapacity: room?.benchCapacity ?? '',
    features: room?.features ?? [],
    imageFile: null,
    removeImage: false,
  };
}

const boundedInteger = (label: string, min: number, max: number) =>
  Yup.number()
    .typeError(`${label} is required`)
    .integer(`${label} must be a whole number`)
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} cannot exceed ${max}`)
    .required(`${label} is required`);

export const roomFormSchema = Yup.object({
  roomName: Yup.string().trim().max(50).required('Room name is required'),
  building: Yup.string().required('Building is required'),
  floor: Yup.string().required('Floor is required'),
  roomType: Yup.string().required('Room type is required'),
  columns: boundedInteger('Columns', 0, 50),
  columnRows: Yup.array()
    .of(boundedInteger('Rows', 1, 100))
    .test('column-count', 'Enter rows for every column', function validateCount(value) {
      return value?.length === Number(this.parent.columns);
    }),
  benchCapacity: boundedInteger('Students per bench', 0, 20),
  features: Yup.array().of(Yup.string().required()),
});

export const totalRoomBenches = (rows: (number | '')[], benchCapacity: number | '') =>
  Number(benchCapacity) === 0 ? 0 : rows.reduce<number>((sum, count) => sum + Number(count), 0);
