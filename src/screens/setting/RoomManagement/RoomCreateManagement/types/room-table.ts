import type { IRoom } from '../types';

export const ALL_ROOMS_FILTER = 'all';

export interface RoomTableActions {
  onEdit: (room: IRoom) => void;
  onDelete: (room: IRoom) => void;
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
