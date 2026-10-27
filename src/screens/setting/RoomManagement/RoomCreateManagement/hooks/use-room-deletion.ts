import type { RootState, AppDispatch } from 'src/redux/store';
import type { RoomListParams } from 'src/redux/InstituteSetup/RoomApi/room-contracts';

import { useRef, useState } from 'react';
import { useStore, useDispatch } from 'react-redux';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { getAuthSessionCacheRevision } from 'src/redux/session-cache';
import { roomsApi, useDeleteRoomMutation } from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import { restoreRoomToPage, removeRoomFromPage } from '../services/room-cache';

import type { IRoom } from '../types';

export function useRoomDeletion() {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();
  const pending = useRef(new Map<string, { order: string[]; count: number }>());
  const [selection, setSelection] = useState<{ room: IRoom; params: RoomListParams }>();
  const [deleteRoom, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteRoomMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();
  const remove = () => {
    if (!selection) return;
    const { room, params } = selection;
    const revision = getAuthSessionCacheRevision();
    const query = roomsApi.endpoints.getRooms.select(params)(store.getState());
    if (!query.data?.items.some((item) => item.id === room.id)) return;
    const key = JSON.stringify([revision, query.requestId, params]);
    const sequence = pending.current.get(key) ?? {
      order: query.data.items.map((item) => item.id),
      count: 0,
    };
    sequence.count += 1;
    pending.current.set(key, sequence);
    let settled = false;
    const release = () => {
      if (settled) return;
      settled = true;
      sequence.count -= 1;
      if (!sequence.count) pending.current.delete(key);
    };
    confirmWithUndo({
      item: room,
      message: `Room "${room.roomName}" deleted successfully`,
      onOptimisticRemove: () => {
        dispatch(removeRoomFromPage(params, room.id));
      },
      onUndoRestore: () => {
        if (
          revision === getAuthSessionCacheRevision() &&
          roomsApi.endpoints.getRooms.select(params)(store.getState()).requestId === query.requestId
        ) {
          dispatch(restoreRoomToPage(params, room, sequence.order));
        }
        release();
      },
      onCommit: async () => {
        try {
          if (revision !== getAuthSessionCacheRevision()) return { error: 'The session changed.' };
          const result = await deleteRoom(room.id);
          return result;
        } finally {
          release();
        }
      },
    });
    setSelection(undefined);
  };
  return {
    selection,
    isLoading,
    requestDelete: (room: IRoom, params: RoomListParams) => setSelection({ room, params }),
    close: () => setSelection(undefined),
    remove,
  };
}
