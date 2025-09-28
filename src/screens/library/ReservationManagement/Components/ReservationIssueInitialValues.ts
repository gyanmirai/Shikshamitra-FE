import dayjs from 'dayjs';

export const getIssueBookInitialValues = (editData?: any) => ({
  bookCategory: editData?.bookCategory || '',
  bookTitle: editData?.bookTitle || '',
  edition: editData?.edition || '',
  issueDate: editData?.issueDate ? dayjs(editData.issueDate) : null,
  dueDate: editData?.dueDate ? dayjs(editData.dueDate) : null,
});
