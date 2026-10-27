import { useState } from 'react';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import { getRoomFloorCapacity } from '../services/room-capacity';

import type { IRoom } from '../types';
import type { BuildingOption, RoomFormValues } from '../types/room-form';

export function useRoomCapacity(room?: IRoom | null) {
  const query = useGetBuildingsQuery(undefined);
  const buildings: BuildingOption[] = query.data ?? [];
  const [rejected, setRejected] = useState<{ building: string; floor: string }>();
  const isBlocked = (values: RoomFormValues) =>
    Boolean(
      getRoomFloorCapacity(buildings, values, room)?.isFull ||
      (rejected?.building === values.building && rejected.floor === values.floor)
    );
  const refresh = async () => {
    const result = await query.refetch();
    if (!result.error) setRejected(undefined);
    return result;
  };
  const handleConflict = async (values: RoomFormValues) => {
    setRejected({ building: values.building, floor: values.floor });
    const result = await query.refetch();
    const capacity = getRoomFloorCapacity(result.data ?? [], values, room);
    if (!result.error && capacity?.hasCounts && !capacity.isFull) setRejected(undefined);
  };
  return { query, buildings, isBlocked, refresh, handleConflict };
}
