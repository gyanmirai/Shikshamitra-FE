import dayjs from 'dayjs';

export const getInitialValues = (editData?: any) => ({
  role: editData?.role || '',
  bookCategory: editData?.bookCategory || '',
  bookTitle: editData?.bookTitle || '',
  edition: editData?.edition || '',
  class: editData?.class || '',
  division: editData?.division || '',
  member: editData?.student || '',
  issueDate: editData?.issueDate || dayjs(),
  dueDate: editData?.dueDate || dayjs().add(7, 'day'),
});
