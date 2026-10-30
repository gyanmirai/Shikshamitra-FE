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
  it('shares the percentage maximum across all entered installments in the request', () => {
    const cappedPolicy = { ...policy, maximumPercentage: 50 };
    expect(
      validateConcessionInstallments(
        ['tuition'],
        { 'due-1': '30', 'due-2': '30' },
        context,
        cappedPolicy
      )
    ).toEqual({
      'due-1': expect.stringContaining('total concession percentage'),
      'due-2': expect.stringContaining('total concession percentage'),
    });
    expect(
      validateConcessionInstallments(
        ['tuition'],
        { 'due-1': '30', 'due-2': '20' },
        context,
        cappedPolicy
      )
    ).toEqual({});
    expect(
      validateConcessionInstallments(
        ['tuition'],
        { 'due-1': '16.67', 'due-2': '33.33' },
        context,
        cappedPolicy
      )
    ).toEqual({});
  });
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

describe('concession request error feedback', () => {
  const generic = 'One or more business rules were violated.';
  const fallback = 'Could not update the concession request.';

  it.each(['problem', 'abp'])(
    'explains concurrency in a %s response without suggesting approval',
    (shape) => {
      const payload =
        shape === 'problem'
          ? { errorCode: 'Finance:Concession:030003', detail: generic, traceId: 'trace-update-1' }
          : {
              error: { code: 'Finance:Concession:030003', message: generic },
              traceId: 'trace-update-1',
            };
      const message = concessionErrorMessage({ data: payload }, fallback);
      expect(message).toContain('changed');
      expect(message).toContain('review');
      expect(message).toContain('Reference: trace-update-1');
      expect(message).not.toContain(generic);
      expect(message).not.toContain('approve again');
    }
  );

  it('shows the server reason instead of a generic wrapper or a less specific mapped message', () => {
    expect(
      concessionErrorMessage(
        {
          data: {
            errorCode: 'Finance:Concession:010018',
            detail: generic,
            data: { Reason: 'This concession request cannot be edited after approval.' },
          },
        },
        fallback
      )
    ).toBe('This concession request cannot be edited after approval.');
    expect(
      concessionErrorMessage(
        {
          data: {
            error: {
              code: 'Finance:Concession:030003',
              message: generic,
              details: 'The request was updated by another user. Reload before editing.',
            },
          },
        },
        fallback
      )
    ).toBe('The request was updated by another user. Reload before editing.');
  });

  it('explains the current request status without inventing a policy failure', () => {
    expect(
      concessionErrorMessage(
        {
          data: {
            errorCode: 'Finance:Concession:010018',
            detail: generic,
            data: { Status: 'Approved' },
          },
        },
        fallback
      )
    ).toContain('Approved');
    expect(
      concessionErrorMessage(
        {
          data: {
            errorCode: 'Finance:Concession:010033',
            detail: generic,
            data: { Status: 'Approved' },
          },
        },
        fallback
      )
    ).toBe(
      'This concession request cannot be edited because its status is Approved. Only draft requests can be edited.'
    );
  });

  it.each([
    ['Finance:Concession:020006', 'selected fee'],
    ['Finance:ConcessionPolicy:010012', 'policy version'],
    ['Finance:Concession:010025', 'snapshot'],
    ['Finance:ConcessionPolicy:010015', 'policy limit'],
    ['Finance:Concession:010017', 'supporting document'],
    ['Finance:Concession:010022', 'fee assignment'],
    ['Finance:Concession:010023', 'repair'],
    ['Finance:Concession:010024', 'document'],
    ['Finance:Concession:010028', 'expired'],
    ['Finance:Concession:020002', 'student'],
    ['Finance:Concession:020003', 'concession type'],
  ])('explains %s when only a generic business error is returned', (errorCode, reason) => {
    const message = concessionErrorMessage({ data: { errorCode, detail: generic } }, fallback);
    expect(message.toLowerCase()).toContain(reason);
    expect(message).not.toContain(generic);
  });

  it('preserves an unknown reported code and trace instead of guessing its meaning', () => {
    const message = concessionErrorMessage(
      {
        data: {
          errorCode: 'Finance:Concession:0030003',
          detail: generic,
          title: 'Bad Request',
          traceId: 'support-trace-717',
        },
      },
      fallback
    );
    expect(message).toContain(fallback);
    expect(message).toContain('Finance:Concession:0030003');
    expect(message).toContain('Reference: support-trace-717');
    expect(message).not.toContain(generic);
    expect(message).not.toContain('changed');
  });

  it('handles direct and Axios problem bodies and uses the fallback for transport failures', () => {
    const problem = {
      errorCode: 'Finance:Concession:030003',
      detail: generic,
      traceId: 'trace-direct',
    };
    expect(concessionErrorMessage(problem, fallback)).toContain('trace-direct');
    expect(concessionErrorMessage({ response: { data: problem } }, fallback)).toContain(
      'trace-direct'
    );
    expect(concessionErrorMessage(undefined, fallback)).toBe(fallback);
    expect(
      concessionErrorMessage({ status: 'FETCH_ERROR', error: 'Failed to fetch' }, fallback)
    ).toBe('Failed to fetch');
  });
});
