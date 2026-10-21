export interface IRoom {
  id: string;
  roomName: string;
  hasImage?: boolean;
  capacity: number;
  buildingId: string;
  buildingName: string;
  floorId?: string;
  floor: number;
  floorName?: string;
  roomTypeId: string;
  roomTypeName: string;
  totalBenches: number;
  benchCapacity: number;
  benchesPerRow: number;
  benchesPerColumn: number;
  columnRows?: number[] | null;
  features: string[];
  lastModificationTime: string | null;
  lastModifierId: string | null;
  creationTime: string;
  creatorId: string;
}
