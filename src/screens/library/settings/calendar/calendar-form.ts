import * as Yup from 'yup';

import { isDateOnly } from '../policies/date-only';

const date = Yup.string()
  .required('Date is required')
  .test('date', 'Use a valid date', (value) => !value || isDateOnly(value));
export const closureSchema = Yup.object({
  fromDate: date,
  toDate: date.test('range', 'Closure end must be on or after its start', function valid(value) {
    return !value || value >= this.parent.fromDate;
  }),
  reason: Yup.string().trim().required('Reason is required').max(500),
});
export const calculationSchema = Yup.object({
  startDate: date,
  dayCountingMode: Yup.number().oneOf([0, 1]).required(),
  days: Yup.string()
    .required('Duration is required')
    .matches(/^\d+$/, 'Use a whole number of days')
    .test(
      'range',
      'Duration must be between 0 and 3660',
      (value) => !value || Number(value) <= 3660
    ),
});
