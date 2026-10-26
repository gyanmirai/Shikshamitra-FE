import type { IRoom } from '../types';
import type { RoomFormValues, BuildingOption } from '../types/room-form';

export const roomFloorLimitCode = 'ShikshaMitra.TenantSettings:RoomFloorLimitReached';

export function getRoomFloorCapacity(
  buildings: BuildingOption[],
  values: Pick<RoomFormValues, 'building' | 'floor'>,
  room?: IRoom | null
) {
  const building = buildings.find((item) => item.id === values.building);
  const floor = building?.floors.find((item) => item.id === values.floor);
  if (!building || !floor) return undefined;
  const needsSpace = room?.buildingId !== building.id || room?.floorId !== floor.id;
  const hasCounts = Number.isInteger(floor.totalRoom) && Number.isInteger(floor.roomCount);
  return {
    building,
    floor,
    hasCounts,
    isFull: needsSpace && hasCounts && floor.roomCount! >= floor.totalRoom!,
  };
}
