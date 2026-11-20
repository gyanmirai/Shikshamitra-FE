import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

import { loanAsOfDate } from './loan-read-query';

export type LoanFilterValues = { academicYearId: string; asOfDate: Dayjs | null };
export const loanFilterSchema = Yup.object({
  academicYearId: Yup.string(),
  asOfDate: Yup.mixed<Dayjs>()
    .nullable()
    .test('valid', 'Choose a valid school as-of date', (value) => !value || value.isValid()),
});
export function initialLoanFilters(academicYearId: string, asOfDate: string): LoanFilterValues {
  return {
    academicYearId,
    asOfDate: !asOfDate ? null : loanAsOfDate(asOfDate) ? dayjs(asOfDate) : dayjs('invalid'),
  };
}
