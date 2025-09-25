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
  requestedDate: dayjs(editData?.reservedOn) || null,
  dueDate: dayjs(editData?.dueDate) || null,
});
