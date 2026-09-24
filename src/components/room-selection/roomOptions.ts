export interface RoomOption {
  id: string;
  roomName: string;
  buildingName: string;
  floorName: string;
  capacity?: number;
  status?: string;
  label: string;
  group: string;
}

interface RoomRecord {
  id?: string;
  roomId?: string;
  roomName?: string;
  buildingName?: string;
  floorName?: string;
  capacity?: number;
  status?: string;
}

const fallbackLabel = (value: string | undefined, fallback: string) => value?.trim() || fallback;

export function createRoomOption(room: RoomRecord): RoomOption {
  const buildingName = fallbackLabel(room.buildingName, 'Other building');
  const floorName = fallbackLabel(room.floorName, 'Other floor');
  const roomName = fallbackLabel(room.roomName, 'Unnamed room');

  return {
    id: room.roomId ?? room.id ?? '',
    roomName,
    buildingName,
    floorName,
    capacity: room.capacity,
    status: room.status,
    label: `${buildingName} › ${floorName} › ${roomName}`,
    group: `${buildingName} › ${floorName}`,
  };
}

export function sortRoomOptions(options: RoomOption[]): RoomOption[] {
  return [...options].sort(
    (first, second) =>
      first.group.localeCompare(second.group, undefined, { numeric: true }) ||
      first.roomName.localeCompare(second.roomName, undefined, { numeric: true })
  );
}
