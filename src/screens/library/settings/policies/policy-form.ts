import type {
  LibraryPolicyVersion,
  LibraryPolicyDraftRequest,
} from 'src/redux/library/policy-types';

import * as Yup from 'yup';

import { isDateOnly } from './date-only';

export type PolicyValues = {
  name: string;
  role: 0 | 1;
  effectiveFrom: string;
  effectiveTo: string;
  bookCategoryId: string;
  sectionId: string;
  educationMediumStageId: string;
  standardId: string;
  priority: string;
  maxBooksAtTime: string;
  reservationLimit: string;
  dueDateMode: 0 | 1;
  loanDays: string;
  dayCountingMode: 0 | 1;
  maxRenewals: string;
  renewalDays: string;
  pickupWindowDays: string;
  moveDueDateToNextOpenDay: boolean;
};
const count = (label: string, min: number, max: number) =>
  Yup.string()
    .required(`${label} is required`)
    .matches(/^\d+$/, { message: `${label} must be a whole number`, excludeEmptyString: true })
    .test(
      'range',
      `${label} must be between ${min} and ${max}`,
      (value) => !value || (Number(value) >= min && Number(value) <= max)
    );
const duration = (label: string, automaticMin: number, max: number) =>
  Yup.string().when('dueDateMode', {
    is: 0,
    then: () => count(label, 0, max).notRequired(),
    otherwise: () => count(label, automaticMin, max),
  });
const date = Yup.string()
  .required('Effective start date is required')
  .test('date', 'Use a valid date', (value) => !value || isDateOnly(value));
export const policySchema = Yup.object({
  name: Yup.string().trim().required('Name is required').max(160),
  role: Yup.number().oneOf([0, 1]).required(),
  effectiveFrom: date,
  effectiveTo: Yup.string().test(
    'order',
    'Effective end must be on or after the start',
    function valid(value) {
      return !value || (isDateOnly(value) && value >= this.parent.effectiveFrom);
    }
  ),
  priority: count('Priority', 0, 1000),
  maxBooksAtTime: count('Concurrent loan limit', 0, 1000),
  reservationLimit: count('Reservation limit', 0, 1000),
  dueDateMode: Yup.number().oneOf([0, 1]).required('Due date mode is required'),
  loanDays: duration('Loan duration', 1, 3660),
  maxRenewals: count('Renewal limit', 0, 100),
  renewalDays: Yup.string().when(['dueDateMode', 'maxRenewals'], ([mode, renewals]) =>
    mode === 0
      ? count('Renewal duration', 0, 3660).notRequired()
      : count('Renewal duration', Number(renewals) > 0 ? 1 : 0, 3660)
  ),
  pickupWindowDays: duration('Pickup window', 1, 365),
  dayCountingMode: Yup.number().oneOf([0, 1]).required(),
  standardId: Yup.string().test(
    'staff',
    'Staff policies cannot target a student class',
    function valid(value) {
      return this.parent.role !== 1 || !value;
    }
  ),
  educationMediumStageId: Yup.string().test(
    'staff',
    'Staff policies cannot target a student stage',
    function valid(value) {
      return this.parent.role !== 1 || !value;
    }
  ),
});
export function policyInitialValues(item?: LibraryPolicyVersion): PolicyValues {
  return {
    name: item?.name || '',
    role: item?.role ?? 0,
    effectiveFrom: item?.effectiveFrom || '',
    effectiveTo: item?.effectiveTo || '',
    bookCategoryId: item?.bookCategoryId || '',
    sectionId: item?.sectionId || '',
    educationMediumStageId: item?.educationMediumStageId || '',
    standardId: item?.standardId || '',
    priority: item ? String(item.priority) : '',
    maxBooksAtTime: item ? String(item.terms.maxBooksAtTime) : '',
    reservationLimit: item ? String(item.terms.reservationLimit) : '',
    dueDateMode: item?.terms.dueDateMode ?? 1,
    loanDays: item ? String(item.terms.loanDays) : '',
    dayCountingMode: item?.terms.dayCountingMode ?? 0,
    maxRenewals: item ? String(item.terms.maxRenewals) : '',
    renewalDays: item ? String(item.terms.renewalDays) : '',
    pickupWindowDays: item ? String(item.terms.pickupWindowDays) : '',
    moveDueDateToNextOpenDay: item?.terms.moveDueDateToNextOpenDay ?? true,
  };
}
export function policyPayload(
  values: PolicyValues,
  item?: LibraryPolicyVersion
): LibraryPolicyDraftRequest {
  return {
    name: values.name.trim(),
    role: values.role,
    effectiveFrom: values.effectiveFrom,
    effectiveTo: values.effectiveTo || null,
    policyId: item?.policyId,
    concurrencyStamp: item?.status === 0 ? item.concurrencyStamp : undefined,
    bookCategoryId: values.bookCategoryId || null,
    sectionId: values.sectionId || null,
    educationMediumStageId: values.role === 0 ? values.educationMediumStageId || null : null,
    standardId: values.role === 0 ? values.standardId || null : null,
    priority: Number(values.priority),
    terms: {
      dueDateMode: values.dueDateMode,
      maxBooksAtTime: Number(values.maxBooksAtTime),
      reservationLimit: Number(values.reservationLimit),
      loanDays: Number(values.loanDays),
      dayCountingMode: values.dayCountingMode,
      maxRenewals: Number(values.maxRenewals),
      renewalDays: Number(values.renewalDays),
      pickupWindowDays: Number(values.pickupWindowDays),
      moveDueDateToNextOpenDay: values.moveDueDateToNextOpenDay,
    },
  };
}
