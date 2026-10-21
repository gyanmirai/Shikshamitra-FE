import { useState } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import { ALL_ROOMS_FILTER } from '../types/room-table';

import type { IRoom } from '../types';
import type { RoomBuildingOption } from '../types/room-table';

export function useRoomTable() {
  const [buildingId, setBuildingId] = useState(ALL_ROOMS_FILTER);
  const [floorId, setFloorId] = useState(ALL_ROOMS_FILTER);
  const roomsQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
    params: {
      ...(buildingId !== ALL_ROOMS_FILTER ? { buildingId } : {}),
      ...(floorId !== ALL_ROOMS_FILTER ? { floorId } : {}),
      maxResultCount: 1000,
    },
    popupConfig: { error: false },
  });
  const buildingsQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBuildingsQuery,
    popupConfig: { error: false },
  });
  const rooms: IRoom[] = roomsQuery.currentData?.items ?? [];
  const buildings: RoomBuildingOption[] = buildingsQuery.data ?? [];

  const changeBuilding = (id: string) => {
    setBuildingId(id);
    setFloorId(ALL_ROOMS_FILTER);
  };
  const clearFilters = () => changeBuilding(ALL_ROOMS_FILTER);

  return {
    roomsQuery,
    buildingsQuery,
    rooms,
    buildings,
    buildingId,
    floorId,
    changeBuilding,
    setFloorId,
    clearFilters,
  };
}
