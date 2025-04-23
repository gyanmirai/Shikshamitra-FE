
import type { IHostelData, IHostelRoom } from './type';

export const getHostelInitialValues = (editData?: IHostelData | null) => ({
  hostelName: editData?.hostelName || '',
  totalRoomCapacity: editData?.totalRoomCapacity || 0,
  wardenDetails: editData?.wardenDetails || '',
  hostelType: editData?.hostelType || '',
  location: editData?.location || '',
});

export const getRoomInitialValues = (editData?: IHostelRoom | null) => ({
  roomName: editData?.roomName || '',
  roomType: editData?.roomType || '',
  floorNumber: editData?.floorNumber || 0,
  roomCapacity: editData?.roomCapacity || 0,
  beds: editData?.beds || null, // Ensure beds is initialized as an array
  roomStatus: editData?.roomStatus || '',
});

