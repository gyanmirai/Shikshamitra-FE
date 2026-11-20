import type { LibraryReturnLookup } from 'src/redux/library/circulation-types';
import type { LibraryLoanReturnRequest } from 'src/redux/library/circulation-commands';

import { hasReturnCharge } from './return-form';
import { schoolDate, confirmedDate } from './school-date';

import type { ReturnValues } from './return-form';

export const returnNeedsDateReason = (lookup: LibraryReturnLookup) =>
  !confirmedDate(lookup.loan.schoolIssueDate, lookup.loan.issueDateProvenance) ||
  !confirmedDate(lookup.loan.schoolDueDate, lookup.loan.dueDateProvenance);
export const returnFingerprint = (values: ReturnValues) =>
  JSON.stringify({
    scan: values.accessionNo.trim(),
    returned: schoolDate(values.returnDate),
    status: values.copyStatus,
    remarks: values.remarks,
    unknownDates: values.unknownOriginalDatesReason || '',
    category: values.chargeCategory,
    amount: values.amount,
    chargeDate: schoolDate(values.chargeDate),
    dueDate: schoolDate(values.fineDueDate),
    year: values.assessmentAcademicYearId || '',
    yearReason: values.assessmentAcademicYearReason || '',
    reason: values.assessmentReason || '',
  });
export function buildCanonicalReturn(
  values: ReturnValues,
  lookup: LibraryReturnLookup
): Omit<LibraryLoanReturnRequest, 'idempotencyKey'> {
  return {
    copyId: lookup.copy.copyId,
    revision: lookup.loan.revision,
    schoolReturnDate: schoolDate(values.returnDate)!,
    copyStatus: values.copyStatus,
    remarks: values.remarks,
    unknownOriginalDatesReason: values.unknownOriginalDatesReason?.trim() || null,
    assessments: hasReturnCharge(values.chargeCategory)
      ? [
          {
            chargeCategoryId: values.chargeCategory,
            amount: Number(values.amount),
            academicYearId: values.assessmentAcademicYearId,
            academicYearReason: values.assessmentAcademicYearReason?.trim() || null,
            schoolChargeDate: schoolDate(values.chargeDate)!,
            schoolDueDate: schoolDate(values.fineDueDate)!,
            reason: values.assessmentReason?.trim() || '',
          },
        ]
      : [],
  };
}
