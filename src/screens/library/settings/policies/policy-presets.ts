import type { PolicyValues } from './policy-form';

type PresetTerms = Pick<
  PolicyValues,
  | 'dueDateMode'
  | 'maxBooksAtTime'
  | 'reservationLimit'
  | 'loanDays'
  | 'maxRenewals'
  | 'renewalDays'
  | 'pickupWindowDays'
  | 'dayCountingMode'
  | 'moveDueDateToNextOpenDay'
>;
type PolicyPreset = { id: string; name: string; description: string; terms: PresetTerms };

export const policyPresets: PolicyPreset[] = [
  {
    id: 'manual',
    name: 'Manual lending desk',
    description:
      'Start with one loan and one reservation per borrower. Staff enter due dates and expiry dates.',
    terms: {
      dueDateMode: 0,
      maxBooksAtTime: '1',
      reservationLimit: '1',
      loanDays: '',
      maxRenewals: '0',
      renewalDays: '',
      pickupWindowDays: '',
      dayCountingMode: 0,
      moveDueDateToNextOpenDay: true,
    },
  },
  {
    id: 'weekly',
    name: 'Weekly classroom reading',
    description: 'Start with two loans, a seven-day loan period, and one seven-day renewal.',
    terms: {
      dueDateMode: 1,
      maxBooksAtTime: '2',
      reservationLimit: '1',
      loanDays: '7',
      maxRenewals: '1',
      renewalDays: '7',
      pickupWindowDays: '3',
      dayCountingMode: 0,
      moveDueDateToNextOpenDay: true,
    },
  },
  {
    id: 'secondary',
    name: 'Secondary school lending',
    description: 'Start with three loans, a 14-day loan period, and one seven-day renewal.',
    terms: {
      dueDateMode: 1,
      maxBooksAtTime: '3',
      reservationLimit: '2',
      loanDays: '14',
      maxRenewals: '1',
      renewalDays: '7',
      pickupWindowDays: '3',
      dayCountingMode: 0,
      moveDueDateToNextOpenDay: true,
    },
  },
  {
    id: 'extended',
    name: 'Extended lending',
    description: 'Start with five loans, a 28-day loan period, and two 14-day renewals.',
    terms: {
      dueDateMode: 1,
      maxBooksAtTime: '5',
      reservationLimit: '3',
      loanDays: '28',
      maxRenewals: '2',
      renewalDays: '14',
      pickupWindowDays: '5',
      dayCountingMode: 0,
      moveDueDateToNextOpenDay: true,
    },
  },
];

export function applyPolicyPreset(values: PolicyValues, preset: PolicyPreset): PolicyValues {
  return { ...values, ...preset.terms };
}
