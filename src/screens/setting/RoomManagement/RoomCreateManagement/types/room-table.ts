import type { RoomListParams } from 'src/redux/InstituteSetup/RoomApi/room-contracts';

import type { IRoom } from '../types';

export const ALL_ROOMS_FILTER = 'all';

export interface RoomTableActions {
  onEdit: (room: IRoom) => void;
  onDelete: (room: IRoom, params: RoomListParams) => void;
}

export interface RoomBuildingOption {
  id: string;
  buildingName: string;
  floors?: Array<{
    id: string;
    floorName?: string;
    floorNo?: string | number;
  }>;
}
