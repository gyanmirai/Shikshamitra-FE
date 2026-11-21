import dayjs from 'dayjs';

const savedSchoolDate = (value: unknown, provenance: unknown) => {
  if (
    (provenance !== 1 && provenance !== 2) ||
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  )
    return null;
  const date = dayjs(value);
  return date.isValid() && date.format('YYYY-MM-DD') === value ? date : null;
};

export const assignLibraryChargeInitialValues = (editData?: any, selectedYearId = '') => ({
  memberId: editData?.memberId || '',
  academicYearId: editData ? editData.academicYearId || '' : selectedYearId,
  role: editData?.role || '',
  // Student-specific
  class: editData?.class || editData?.classId || '',
  division: editData?.division || editData?.divisionId || '',
  member: editData?.member || editData?.memberId || '',
  // Book details
  bookNumber: editData?.bookNumber || '',
  bookIssueId: editData?.bookIssueId || '',
  requiresLoanSource: false,
  bookTitle: editData?.bookTitle || editData?.bookTitleId || '',
  // Charge details
  chargeCategory: editData?.chargeCategory || editData?.chargeCategoryId || '',
  amount: editData?.amount == null ? '' : String(editData.amount),
  chargeDate: savedSchoolDate(editData?.schoolChargeDate, editData?.chargeDateProvenance),
  dueDate: savedSchoolDate(editData?.schoolDueDate, editData?.dueDateProvenance),
  rawChargeDate: editData?.rawChargeDate ?? editData?.chargeDate ?? null,
  rawDueDate: editData?.rawDueDate ?? editData?.dueDate ?? null,
  sourceVersion: editData?.sourceVersion ?? null,
  reason: editData?.reason || '',
});
