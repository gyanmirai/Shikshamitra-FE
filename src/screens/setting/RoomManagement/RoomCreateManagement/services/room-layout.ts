import * as Yup from 'yup';

import type { IRoom } from '../types';
import type { RoomFormValues } from '../types/room-form';

export function getInitialColumnRows(room?: IRoom | null): number[] {
  if (room?.columnRows?.length) return [...room.columnRows];
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
    columns: columnRows.length || '',
    columnRows,
    benchCapacity: room?.benchCapacity || '',
    features: room?.features ?? [],
    imageFile: null,
    removeImage: false,
  };
}

const positiveInteger = (label: string, max: number) =>
  Yup.number()
    .typeError(`${label} is required`)
    .integer(`${label} must be a whole number`)
    .min(1, `${label} must be at least 1`)
    .max(max, `${label} cannot exceed ${max}`)
    .required(`${label} is required`);

export const roomFormSchema = Yup.object({
  roomName: Yup.string().trim().max(50).required('Room name is required'),
  building: Yup.string().required('Building is required'),
  floor: Yup.string().required('Floor is required'),
  roomType: Yup.string().required('Room type is required'),
  columns: positiveInteger('Columns', 50),
  columnRows: Yup.array()
    .of(positiveInteger('Rows', 100))
    .min(1, 'Add at least one column')
    .test('column-count', 'Enter rows for every column', function validateCount(value) {
      return value?.length === Number(this.parent.columns);
    }),
  benchCapacity: positiveInteger('Students per bench', 20),
  features: Yup.array().of(Yup.string().required()),
});

export const totalRoomBenches = (rows: (number | '')[]) =>
  rows.reduce<number>((sum, count) => sum + Number(count), 0);
