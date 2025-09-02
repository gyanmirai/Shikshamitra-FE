import dayjs from 'dayjs';

export const getInitialValues = (editData?: any) => ({
  bookCategory: editData?.bookCategory || '',
  bookTitle: editData?.bookTitle || '',
  edition: editData?.edition || '',
  class: editData?.class || '',
  division: editData?.division || '',
  student: editData?.student || '',
  issueDate: editData?.issueDate || dayjs(),
  dueDate: editData?.dueDate || dayjs().add(7, 'day'),
  quantity: editData?.quantity || 1,
});
