export const getInitialValues = (editData?: any) => ({
  role: editData?.role || '',
  bookCategory: editData?.bookCategory || '',
  bookTitle: editData?.bookTitle || '',
  edition: editData?.edition || '',
  class: editData?.class || '',
  division: editData?.division || '',
  member: editData?.student || '',
  issueDate: editData?.issueDate || null,
  accessionNumber: editData?.accessionNumber || '',
  dueDate: editData?.dueDate || null,
});
