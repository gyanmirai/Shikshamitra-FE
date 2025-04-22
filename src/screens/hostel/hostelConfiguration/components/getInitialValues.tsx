import type { IHostelData } from './type';

export const getHostelInitialValues = (editData?: IHostelData | null) => ({
  hostelName: editData?.hostelName || '',
  totalRoomCapacity: editData?.totalRoomCapacity || 0,
  wardenDetails: editData?.wardenDetails || '',
  hostelType: editData?.hostelType || '',
  location: editData?.location || '',
});
