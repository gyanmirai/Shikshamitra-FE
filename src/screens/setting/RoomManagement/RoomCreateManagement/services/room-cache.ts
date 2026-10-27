import type { RoomListParams } from 'src/redux/InstituteSetup/RoomApi/room-contracts';

import { roomsApi } from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import type { IRoom } from '../types';

export function removeRoomFromPage(params: RoomListParams, roomId: string) {
  return roomsApi.util.updateQueryData('getRooms', params, (page) => {
    const index = page.items.findIndex((room) => room.id === roomId);
    if (index < 0) return;
    page.items.splice(index, 1);
    page.totalCount = Math.max(0, page.totalCount - 1);
  });
}

export function restoreRoomToPage(params: RoomListParams, room: IRoom, order: string[]) {
  return roomsApi.util.updateQueryData('getRooms', params, (page) => {
    if (page.items.some((item) => item.id === room.id)) return;
    const originalIndex = order.indexOf(room.id);
    const successor = page.items.findIndex((item) => order.indexOf(item.id) > originalIndex);
    page.items.splice(successor < 0 ? page.items.length : successor, 0, room);
    page.totalCount += 1;
  });
}
