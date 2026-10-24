import { describe, expect, it } from 'vitest';

import { context, policy } from '../../../../../e2e/fixtures/concession-request-ui/data';
import {
  concessionErrorMessage,
  validateConcessionInstallments,
} from './concessionValueValidation';

describe('concession installment validation', () => {
  const fixedPolicy: typeof policy = {
    ...policy,
    calculationMethod: 'FixedAmount',
    maximumFixedAmount: 11111,
  };
  it('rejects fractional money without changing the typed value', () => {
    const entries = { 'due-1': '0.1' };
    expect(
      validateConcessionInstallments(['tuition'], entries, context, fixedPolicy)['due-1']
    ).toContain('whole rupee');
    expect(entries['due-1']).toBe('0.1');
  });
  it('accepts a whole-rupee request below the shared limit and excludes unselected heads', () => {
    expect(
      validateConcessionInstallments(
        ['tuition'],
        { 'due-1': '1', 'due-2': '500', excluded: '.1' },
        context,
        fixedPolicy
      )
    ).toEqual({});
  });
  it('keeps decimal percentages valid and rejects more than two decimal places', () => {
    expect(
      validateConcessionInstallments(['tuition'], { 'due-1': '0.1' }, context, policy)
    ).toEqual({});
    expect(
      validateConcessionInstallments(['tuition'], { 'due-1': '0.123' }, context, policy)['due-1']
    ).toContain('two decimal');
  });
  it('rejects an amount above installment capacity, zero and invalid numbers', () => {
    for (const value of ['999999', '0', 'invalid']) {
      expect(
        validateConcessionInstallments(['tuition'], { 'due-1': value }, context, fixedPolicy)[
          'due-1'
        ]
      ).toBeTruthy();
    }
  });
  it('leaves blank installments optional and rejects a total over the cap', () => {
    expect(
      validateConcessionInstallments(['tuition'], { 'due-1': '' }, context, fixedPolicy)
    ).toEqual({});
    expect(
      validateConcessionInstallments(['tuition'], { 'due-1': '600', 'due-2': '500' }, context, {
        ...fixedPolicy,
        maximumFixedAmount: 1000,
      })['due-1']
    ).toContain('total concession');
  });
  it('explains preview drift and uses detail before the generic title', () => {
    expect(
      concessionErrorMessage(
        { data: { errorCode: 'Finance:Concession:010020', title: 'Business rule violated' } },
        'fallback'
      )
    ).toContain('installments or balances changed');
    expect(
      concessionErrorMessage(
        { data: { title: 'Business rule violated', detail: 'Refresh the policy' } },
        'fallback'
      )
    ).toBe('Refresh the policy');
  });
});
