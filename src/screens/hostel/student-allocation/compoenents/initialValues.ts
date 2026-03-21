import type { IHostelAllocationRoom } from '../type';

export const getRoomInitialValues = (editData?: Partial<IHostelAllocationRoom | null>) => ({
  roomName: editData?.roomName || '',
  roomType: editData?.roomType || '',
  floorNumber: editData?.floorNumber || '',
  roomCapacity: editData?.roomCapacity || '',
  currentOccupation: editData?.currentOccupation || '',
  roomStatus: editData?.roomStatus || '',
  bed: editData?.bed || '',
});
