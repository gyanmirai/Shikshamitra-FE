import { it, expect, describe } from 'vitest';

import { getPayrollMutationErrorMessage } from './run-payroll-error-utils';

describe('payroll mutation failures', () => {
  it('requires refresh and re-review for stale payroll', () => {
    expect(getPayrollMutationErrorMessage({
      status: 409,
      data: { errorCode: 'PAYROLL_PREVIEW_STALE', detail: 'Business exception' },
    })).toBe('Payroll inputs changed. Refresh the preview and review the updated amounts before continuing.');
  });

  it('does not classify unrelated conflicts as stale payroll', () => {
    expect(getPayrollMutationErrorMessage({
      status: 409,
      data: { errorCode: 'ANOTHER_CONFLICT', detail: 'This month is being updated. Try again shortly.' },
    })).toBe('This month is being updated. Try again shortly.');
  });

  it('never falls back to a success message for an unknown failure', () => {
    expect(getPayrollMutationErrorMessage({ status: 500 }))
      .toBe('The payroll action could not be completed. Refresh the page and try again.');
  });
});
