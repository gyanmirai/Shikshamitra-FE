'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  useGetRoomByIdQuery,
  useLazyGetRoomsQuery,
} from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import { PaginatedSearchSelect } from '../paginated-search-select';

type RoomOption = { id: string; roomName: string; buildingName?: string; floorName?: string };

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
  // The search hook depends on this callback; a stable reference preserves its debounced loader.
  const fetchOptions = useCallback(
    async (query: string, page: number) => {
      const pageSize = 25;
      const response = await fetchRooms({
        filter: query || undefined,
        skipCount: (page - 1) * pageSize,
        maxResultCount: pageSize,
        sorting: 'RoomName asc',
      }).unwrap();
      const items: RoomOption[] = response?.items ?? [];
      return {
        data: items,
        hasMore: (page - 1) * pageSize + items.length < (response?.totalCount ?? 0),
      };
    },
    [fetchRooms]
  );
  // A stable selected-value reference keeps option refreshes from resetting the typed search.
  const savedValue = useMemo<RoomOption | null>(
    () => (savedId ? (savedRoom ?? { id: savedId, roomName: roomNumber || savedId }) : null),
    [savedId, savedRoom, roomNumber]
  );

  return (
    <PaginatedSearchSelect<RoomOption>
      label="Room (optional)"
      placeholder="Search or scroll to select a room"
      fetchOptions={fetchOptions}
      minChars={0}
      size="small"
      disabled={disabled}
      isLoading={isFetching || isFetchingSaved}
      value={selected === undefined ? savedValue : selected}
      getOptionLabel={(option) =>
        [option.buildingName, option.floorName, option.roomName].filter(Boolean).join(' > ')
      }
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
