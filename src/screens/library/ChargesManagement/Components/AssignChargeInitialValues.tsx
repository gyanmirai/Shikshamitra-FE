export const assignLibraryChargeInitialValues = (editData?: any) => ({
  role: editData?.role || '',

  // Student-specific
  class: editData?.class || '',
  division: editData?.division || '',
  member: editData?.member || '',

  // Book details
  bookTitle: editData?.bookTitle || '',

  // Charge details
  chargeCategory: editData?.chargeCategory || '',
  amount: editData?.amount || '',
  dueDate: editData?.dueDate || '',
  reason: editData?.reason || '',
});
