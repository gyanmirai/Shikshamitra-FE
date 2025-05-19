import type { IHostelRoom } from './type';

export const roomInitialValues = (editData: IHostelRoom | null) => ({
  roomName: editData?.roomName || '',
  roomType: editData?.roomType || '',
  floorNumber: editData?.floorNumber || 0,
  roomCapacity: editData?.roomCapacity || 0,
  facilityQuantities: editData?.facilityQuantities || [],
  status: editData?.status || '',
});
