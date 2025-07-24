export interface IRoom {
  id: number;
  roomName: string;
  capacity: number;
  building: string;
  floor: string;
  roomType: string;
  totalBenches: number;
  benchCapacity: number;
  rows: number;
  columns: number;
  features: string[];
}
