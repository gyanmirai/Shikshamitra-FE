export interface IRoom {
  id: string;
  roomName: string;
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
  features: string[];
  lastModificationTime: string | null;
  lastModifierId: string | null;
  creationTime: string;
  creatorId: string;
}
