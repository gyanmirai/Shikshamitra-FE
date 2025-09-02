import dayjs from 'dayjs';

export const getIssueBookInitialValues = (editData?: any) => ({
  bookCategory: editData?.bookCategory || '',
  bookTitle: editData?.bookTitle || '',
  edition: editData?.edition || '',
  issueDate: editData?.issueDate ? dayjs(editData.issueDate) : dayjs(),
  dueDate: editData?.dueDate ? dayjs(editData.dueDate) : dayjs().add(7, 'day'),
});
