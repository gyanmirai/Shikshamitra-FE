'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  useGetRoomByIdQuery,
  useLazyGetRoomsQuery,
} from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import { PaginatedSearchSelect } from '../paginated-search-select';
import { sortRoomOptions, createRoomOption } from '../room-selection/roomOptions';
import { renderRoomGroup, renderRoomOption } from '../room-selection/room-option-renderers';

import type { RoomOption } from '../room-selection/roomOptions';

type RoomRecord = { id: string; roomName: string; buildingName?: string; floorName?: string };

export function DivisionRoomField({
  roomId,
  roomNumber,
  disabled,
  onChange,
}: {
  roomId?: string | null;
  roomNumber?: string | null;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [selected, setSelected] = useState<RoomOption | null>();
  const [fetchRooms, { isFetching }] = useLazyGetRoomsQuery();
  const savedId = roomId || roomNumber || '';
  const isRoomId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(savedId);
  const {
    data: savedRoom,
    isFetching: isFetchingSaved,
    isError,
  } = useGetRoomByIdQuery(savedId, {
    skip: !isRoomId,
  });
  // A stable selected-value reference keeps option refreshes from resetting the typed search.
  const savedValue = useMemo<RoomOption | null>(() => {
    if (!savedId) return null;
    if (savedRoom) return createRoomOption(savedRoom);
    return {
      ...createRoomOption({ id: savedId, roomName: roomNumber || savedId }),
      label: roomNumber || savedId,
    };
  }, [savedId, savedRoom, roomNumber]);

  // The callback uses the current selection to distinguish its display label from typed searches.
  const fetchOptions = useCallback(
    async (query: string, page: number) => {
      const pageSize = 25;
      const response = await fetchRooms({
        filter:
          query && query !== (selected === undefined ? savedValue : selected)?.label
            ? query
            : undefined,
        skipCount: (page - 1) * pageSize,
        maxResultCount: pageSize,
        sorting: 'RoomName asc',
      }).unwrap();
      const items: RoomRecord[] = response?.items ?? [];
      return {
        data: items.map(createRoomOption),
        hasMore: (page - 1) * pageSize + items.length < (response?.totalCount ?? 0),
      };
    },
    [fetchRooms, selected, savedValue]
  );

  return (
    <PaginatedSearchSelect<RoomOption>
      label="Room (optional)"
      placeholder="Search by building, floor, or room"
      fullWidth
      fetchOptions={fetchOptions}
      minChars={0}
      size="small"
      disabled={disabled}
      isLoading={isFetching || isFetchingSaved}
      value={selected === undefined ? savedValue : selected}
      getOptionLabel={(option) => option.label}
      groupBy={(option) => option.group}
      filterOptions={sortRoomOptions}
      renderGroup={renderRoomGroup}
      renderOption={renderRoomOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_, option) => {
        setSelected(option);
        onChange(option?.id ?? '');
      }}
      helperText={
        isError ? 'Saved room details could not be loaded. Its assignment is preserved.' : undefined
      }
    />
  );
}
