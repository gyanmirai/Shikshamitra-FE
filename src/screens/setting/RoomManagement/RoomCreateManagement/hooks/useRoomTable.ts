import type { IParams } from 'src/components/customizabaleTable/types';
import type { RoomListParams } from 'src/redux/InstituteSetup/RoomApi/room-contracts';

import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import { ALL_ROOMS_FILTER } from '../types/room-table';
import { roomServerFilters } from '../services/room-table-filters';

import type { IRoom } from '../types';
import type { RoomBuildingOption } from '../types/room-table';

export function useRoomTable() {
  const [buildingId, setBuildingId] = useState(ALL_ROOMS_FILTER);
  const [floorId, setFloorId] = useState(ALL_ROOMS_FILTER);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [search, setSearch] = useState('');
  const [sorts, setSorts] = useState<IParams['sorts']>([]);
  const [filters, setFilters] = useState<IParams['filters']>([]);
  const lastServerPage = useRef<string | undefined>(undefined);
  const params: RoomListParams = {
    ...(buildingId !== ALL_ROOMS_FILTER ? { buildingId } : {}),
    ...(floorId !== ALL_ROOMS_FILTER ? { floorId } : {}),
    skipCount: page * size,
    maxResultCount: size,
    filter: search || undefined,
    sorting: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
    columnFilters: filters.length ? JSON.stringify(roomServerFilters(filters)) : undefined,
  };
  const roomsQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
    params,
    options: { refetchOnMountOrArgChange: false },
    popupConfig: { error: false },
  });
  const buildingsQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBuildingsQuery,
    options: { refetchOnMountOrArgChange: false },
    popupConfig: { error: false },
  });
  const rooms: IRoom[] = roomsQuery.currentData?.items ?? [];
  const buildings: RoomBuildingOption[] = buildingsQuery.data ?? [];
  const { currentData, isFetching, isSuccess, requestId } = roomsQuery;

  useEffect(() => {
    if (!currentData || !isSuccess || isFetching || requestId === lastServerPage.current) return;
    lastServerPage.current = requestId;
    // Keep the Undo page stable until a server response confirms its new total.
    const lastPage = Math.max(0, Math.ceil(currentData.totalCount / size) - 1);
    if (page > lastPage) setPage(lastPage);
  }, [currentData, isFetching, isSuccess, requestId, page, size]);

  const changeBuilding = (id: string) => {
    setBuildingId(id);
    setFloorId(ALL_ROOMS_FILTER);
    setPage(0);
  };
  const clearFilters = () => {
    changeBuilding(ALL_ROOMS_FILTER);
    setFilters([]);
    setSearch('');
  };

  return {
    roomsQuery,
    buildingsQuery,
    rooms,
    buildings,
    params,
    page,
    size,
    search,
    sorts,
    filters,
    totalCount: roomsQuery.currentData?.totalCount ?? 0,
    changePage: (nextPage: number, nextSize: number) => {
      setPage(nextPage);
      setSize(nextSize);
    },
    changeSearch: (value: string) => {
      setSearch(value);
      setPage(0);
    },
    changeSort: (value: IParams['sorts']) => {
      setSorts(value);
      setPage(0);
    },
    changeFilters: (value: IParams['filters']) => {
      try {
        roomServerFilters(value);
        setFilters(value);
        setPage(0);
      } catch (error) {
        shikshaMitraToast.error({
          message: error instanceof Error ? error.message : 'Room filters could not be applied.',
        });
      }
    },
    buildingId,
    floorId,
    changeBuilding,
    setFloorId: (id: string) => {
      setFloorId(id);
      setPage(0);
    },
    clearFilters,
  };
}
