import type { FormikProps } from 'formik';

export interface RoomFormValues {
  roomName: string;
  building: string;
  floor: string;
  roomType: string;
  columns: number | '';
  columnRows: (number | '')[];
  benchCapacity: number | '';
  features: string[];
  imageFile?: File | null;
  removeImage?: boolean;
}

export type RoomFormik = FormikProps<RoomFormValues>;
export interface FloorOption {
  id: string;
  floorName: string;
  floorNo?: number;
  totalRoom?: number;
  roomCount?: number;
}
export interface BuildingOption {
  id: string;
  buildingName: string;
  description?: string;
  totalFloors?: number;
  floors: FloorOption[];
}
export interface RoomTypeOption {
  id: string;
  roomTypeName: string;
}
