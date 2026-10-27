import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import type { IFloor } from '../types';

export const floorRoomLimitCode = 'ShikshaMitra.TenantSettings:FloorRoomLimitBelowUsage';

export const floorRoomLimitMessage = (floorName: string, totalRoom: number, roomCount: number) =>
  `Cannot set total rooms to ${totalRoom}. ${floorName} already has ${roomCount} rooms. Delete or reassign existing rooms before reducing the total room capacity.`;

export function getFloorRoomLimitFailure(error: unknown, floors: IFloor[]) {
  if (parseApiProblemDetail(error).errorCode !== floorRoomLimitCode) return undefined;
  const response = error as {
    data?: { data?: Record<string, unknown>; error?: { data?: Record<string, unknown> } };
  };
  const data = response.data?.data ?? response.data?.error?.data;
  if (!data || typeof data.FloorId !== 'string' || typeof data.RoomCount !== 'number')
    return undefined;
  const index = floors.findIndex((floor) => floor.id === data.FloorId);
  if (index < 0) return undefined;
  return {
    index,
    floorId: data.FloorId,
    roomCount: data.RoomCount,
    message: floorRoomLimitMessage(
      typeof data.FloorName === 'string' ? data.FloorName : floors[index].floorName,
      typeof data.RoomLimit === 'number' ? data.RoomLimit : Number(floors[index].totalRoom),
      data.RoomCount
    ),
  };
}
