import type { IHostelRequestFormType } from '../../new-request/components/type';

export const getRoomAllocateInitialValues = (data?: IHostelRequestFormType | null) => ({
  hostelName: data?.hostelName || '',
  hostelType: data?.hostelType || '',
  roomName: '',
});
