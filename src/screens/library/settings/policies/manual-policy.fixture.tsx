import type { PropsWithChildren } from 'react';
import type { LibraryPolicyVersion } from 'src/redux/library/policy-types';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import {
  catalogueTestStore,
  catalogueTestWrapper,
} from '../catalogue-configuration/catalogue-test-fixture';

export const manualPolicy: LibraryPolicyVersion = {
  id: 'version-id',
  policyId: 'family-id',
  name: 'Manual school lending',
  role: 0,
  status: 0,
  version: 1,
  concurrencyStamp: 'opened-policy-version',
  effectiveFrom: '2026-11-19',
  effectiveTo: null,
  priority: 0,
  terms: {
    dueDateMode: 0,
    maxBooksAtTime: 2,
    reservationLimit: 1,
    loanDays: 0,
    dayCountingMode: 0,
    maxRenewals: 1,
    renewalDays: 0,
    pickupWindowDays: 0,
    moveDueDateToNextOpenDay: false,
  },
};
export const policyOptions = {
  canManageGlobalPolicies: true,
  bookCategories: [],
  sections: [],
  stages: [],
  standards: [],
};
export function manualPolicyWrapper() {
  const Base = catalogueTestWrapper(
    catalogueTestStore([
      'Library.Settings.BorrowingRules.View',
      'Library.Settings.BorrowingRules.Add',
    ])
  );
  return ({ children }: PropsWithChildren) => (
    <Base>
      <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
    </Base>
  );
}
