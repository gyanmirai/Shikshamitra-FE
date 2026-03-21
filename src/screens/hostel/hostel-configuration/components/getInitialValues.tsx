import type { IHostelData } from './type';

export const getHostelInitialValues = (editData?: IHostelData | null) => ({
  hostelName: editData?.hostelName || '',
  totalFloors: editData?.totalFloors || 0,
  assignedWarden: editData?.assignedWarden || '',
  hostelType: editData?.hostelType || '',
  location: editData?.location || '',
});
