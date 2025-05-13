import type { IHostelRequestFormType } from '../../newRequest/components/type';

export const getRoomAllocateInitialValues = (data?: IHostelRequestFormType | null) => ({
  hostelName: data?.hostelName || '',
  hostelType: data?.hostelType || '',
  roomName: '',
});
