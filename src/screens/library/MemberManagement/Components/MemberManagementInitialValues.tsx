import type { IMemberPayload, IChangeStatusPayload, IMakeReservationPayload } from './type';

export const getInitialMemberData = (
  editData?: Partial<IMemberPayload> | null
): IMemberPayload => ({
  role: editData?.role || '',
  class: editData?.class || '',
  division: editData?.division || '',
  student: editData?.student || '',
});

export const getInitialChangeStatusData = (
  editData?: Partial<IChangeStatusPayload> | null
): IChangeStatusPayload => ({
  status: editData?.status || 'Active',
  remarks: editData?.remarks || '',
});

export const getInitialReservationData = (
  editData?: Partial<IMakeReservationPayload> | null
): IMakeReservationPayload => ({
  bookCategory: editData?.bookCategory || 'Text Book',
  bookTitle: editData?.bookTitle || 'Introduction to Physics',
  requestedDate: editData?.requestedDate || new Date(),
});
