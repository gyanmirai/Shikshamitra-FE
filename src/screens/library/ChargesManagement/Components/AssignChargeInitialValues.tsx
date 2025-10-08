import dayjs from 'dayjs';

export const assignLibraryChargeInitialValues = (editData?: any) => ({
  memberId: editData?.memberId || '',
  role: editData?.role || '',
  // Student-specific
  class: editData?.class || editData?.classId || '',
  division: editData?.division || editData?.divisionId || '',
  member: editData?.member || editData?.memberId || '',
  // Book details
  bookNumber: editData?.bookNumber || '',
  bookTitle: editData?.bookTitle || editData?.bookTitleId || '',
  // Charge details
  chargeCategory: editData?.chargeCategory || editData?.chargeCategoryId || '',
  amount: editData?.amount || '',
  dueDate: editData?.dueDate ? dayjs(editData?.dueDate, 'DD-MM-YYYY') : null,
  reason: editData?.reason || '',
});
