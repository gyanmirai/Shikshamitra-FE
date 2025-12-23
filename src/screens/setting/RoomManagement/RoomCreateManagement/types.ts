export interface IRoom {
  id: string;
  roomName: string;
  capacity: number;
  buildingId: string;
  buildingName: string;
  floor: number;
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
