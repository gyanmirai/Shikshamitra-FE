import type { LibraryLoan } from 'src/redux/library/circulation-types';

import { useMemo } from 'react';

import { schoolDate } from './school-date';
import { manualRenewal } from './loan-maintenance-schema';

import type { RenewalValues } from './loan-maintenance-types';

export function useRenewalInput(loan: LibraryLoan, values: RenewalValues) {
  const schoolRenewalDate = schoolDate(values.schoolRenewalDate);
  const due = schoolDate(values.requestedDueDate);
  const manual = manualRenewal(loan);
  const year = loan.role === 1 ? values.academicYearId : undefined;
  /** Memoization Justification: The preview effect must depend on serialized date/year inputs, not reason keystrokes or Formik object identity. */
  return useMemo(() => {
    if (!schoolRenewalDate || (loan.role === 1 && !year) || (manual && !due)) return null;
    return { schoolRenewalDate, academicYearId: year, requestedDueDate: manual ? due : null };
  }, [schoolRenewalDate, due, year, manual, loan.role]);
}
