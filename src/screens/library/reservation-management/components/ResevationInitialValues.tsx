import dayjs from 'dayjs';

export const reservationInitialValues = (editData?: any) => ({
  role: editData?.role || '',

  // For student role
  class: editData?.class || '',
  division: editData?.division || '',

  // For other roles
  member: editData?.member || '',

  bookCategory: editData?.bookCategory || '',
  bookTitle: editData?.bookTitle || '',
  requestedDate: editData?.reservedOn ? dayjs(editData.reservedOn, 'DD-MM-YYYY') : null,
  dueDate: editData?.dueDate ? dayjs(editData.dueDate, 'DD-MM-YYYY') : null,
});
