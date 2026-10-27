import type { IRoom } from 'src/screens/setting/RoomManagement/RoomCreateManagement/types';

export type RoomListParams = {
  filter?: string;
  buildingId?: string;
  floorId?: string;
  roomTypeId?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
  columnFilters?: string;
};

export type RoomPage = { items: IRoom[]; totalCount: number };
export type RoomSaveInput = Partial<IRoom> & {
  roomName: string;
  image?: File | null;
  removeImage?: boolean;
};

export function roomFormData({ image, ...input }: RoomSaveInput) {
  const body = new FormData();
  body.append('input', JSON.stringify(input));
  if (image) body.append('image', image);
  return body;
}
