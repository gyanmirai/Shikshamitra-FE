import { it, expect, describe } from 'vitest';

import {
  amountError,
  defaultPolicy,
  structureError,
  paymentTermError,
  defaultPaymentTerm,
  structureCandidate,
  buildStructureChanges,
  selectablePaymentTerms,
  withDefaultPaymentTerm,
} from './feeStructureModel';

describe('Fee Structure editor contract', () => {
  it('patches fixed to variable pricing together without changing the payment term or optional flag', () => {
    const before = structureCandidate({
      feeHeads: [
        {
          id: 'line',
          feeHeadId: 'head',
          amount: 1200,
          isVariable: false,
          isOneTime: false,
          isOptional: true,
          payableMonth: 0,
          payableYear: 0,
          paymentTermId: 'term',
          paymentTermVersionId: 'term-v1',
          scheduleMode: 'Inherited',
          installmentOverrides: [],
        },
      ],
    });
    const after = structureCandidate(before);
    after.feeHeads[0].isVariable = true;
    after.feeHeads[0].amount = null;
    expect(buildStructureChanges(before, after)).toEqual({
      feeHeads: {
        add: [],
        update: [{ lineId: 'line', isVariable: true, amount: null }],
        removeLineIds: [],
      },
    });
    expect(after.feeHeads[0].paymentTermVersionId).toBe('term-v1');
    expect(after.feeHeads[0].isOptional).toBe(true);
    expect(amountError(null)).toBeTruthy();
  });

  it('starts an incomplete draft with explicit empty policy and term choices', () => {
    const draft = structureCandidate();
    expect(draft.saveAsDraft).toBe(true);
    expect(draft.feeHeads).toEqual([]);
    expect(draft.collectionPolicyId).toBeNull();
    expect(draft.refundPolicyVersionId).toBeNull();
  });

  it('retains every version and override across reload, edit and save', () => {
    const source = {
      ...structureCandidate(),
      concurrencyStamp: 'stamp-1',
      collectionPolicyId: 'collection',
      collectionPolicyVersionId: 'cv1',
      concessionPolicyId: 'concession',
      concessionPolicyVersionId: 'cnv1',
      refundPolicyId: 'refund',
      refundPolicyVersionId: 'rv1',
      prorationPolicyId: 'proration',
      prorationPolicyVersionId: 'pv1',
      concessionApplicableFeeHeadIds: ['head'],
      feeHeads: [
        {
          id: 'line',
          feeHeadId: 'head',
          isVariable: false,
          amount: 1000.01,
          isOneTime: false,
          isOptional: false,
          payableMonth: 0,
          payableYear: 0,
          paymentTermId: 'term',
          paymentTermVersionId: 'tv1',
          scheduleMode: 'Customized' as const,
          installmentOverrides: [
            {
              sourcePaymentTermInstallmentId: 'installment',
              sequence: 1,
              name: 'April',
              coverageStartDate: null,
              coverageEndDate: null,
              dueDate: '2026-04-15',
              demandDate: null,
              allocationPercentage: null,
            },
          ],
        },
      ],
    };
    const draft = structureCandidate(source);
    expect(draft).toEqual(source);
    draft.feeHeads[0].installmentOverrides[0].dueDate = '2026-04-20';
    draft.concessionApplicableFeeHeadIds.push('another');
    expect(source.feeHeads[0].installmentOverrides[0].dueDate).toBe('2026-04-15');
    expect(source.concessionApplicableFeeHeadIds).toEqual(['head']);
  });

  it('does not reintroduce a removed optional policy', () => {
    const saved = { ...structureCandidate(), refundPolicyId: null, refundPolicyVersionId: null };
    expect(structureCandidate(saved).refundPolicyId).toBeNull();
    expect(structureCandidate(saved).refundPolicyVersionId).toBeNull();
  });

  it('shows all server validation problems and explains stale writes', () => {
    expect(
      structureError({
        data: {
          errorCode: 'Finance:FeeStructure:InvalidConfiguration',
          detail: 'One or more business rules were violated.',
          data: { Errors: ['Select an active collection policy.'] },
        },
      })
    ).toBe('Select an active collection policy.');
    expect(
      structureError({
        data: { error: { data: { Errors: ['Wrong academic year', 'Missing term'] } } },
      })
    ).toBe('Wrong academic year\nMissing term');
    expect(
      structureError({ data: { error: { code: 'Finance:FeeStructure:ConcurrencyConflict' } } })
    ).toContain('another session');
    expect(
      structureError({ data: { errors: { amount: ['Amount must have at most two decimals'] } } })
    ).toBe('Amount must have at most two decimals');
    expect(
      structureError({ data: { errorCode: 'Finance:FeeStructure:ConcurrencyConflict' } })
    ).toContain('another session');
  });
});

it.each([false, true])(
  'patches only amounts and preserves the legacy charge flag (%s)',
  (isOneTime) => {
    const before = structureCandidate({
      feeHeads: [
        {
          id: 'line',
          feeHeadId: 'head',
          amount: 100,
          isOneTime,
          isOptional: false,
          payableMonth: 0,
          payableYear: 0,
          paymentTermId: 'term',
          paymentTermVersionId: 'v1',
          scheduleMode: 'Inherited',
          installmentOverrides: [],
        },
      ],
    });
    const after = structureCandidate(before);
    expect(after.feeHeads[0].isOneTime).toBe(isOneTime);
    after.feeHeads[0].amount = 125;
    expect(buildStructureChanges(before, after)).toEqual({
      feeHeads: { add: [], update: [{ lineId: 'line', amount: 125 }], removeLineIds: [] },
    });
    expect(buildStructureChanges(before, before)).toEqual({});
    after.feeHeads = [];
    expect(buildStructureChanges(before, after)).toEqual({
      feeHeads: { add: [], update: [], removeLineIds: ['line'] },
    });
  }
);
it('distinguishes explicit policy clear from omission', () => {
  const before = structureCandidate({ refundPolicyId: 'refund', refundPolicyVersionId: 'v1' });
  const after = structureCandidate({
    ...before,
    refundPolicyId: null,
    refundPolicyVersionId: null,
  });
  expect(buildStructureChanges(before, after)).toEqual({ policies: { refund: null } });
});

it('does not send legacy concession attachment changes from fee structure settings', () => {
  const before = structureCandidate({
    concessionPolicyId: 'legacy',
    concessionPolicyVersionId: 'v1',
  });
  const after = structureCandidate({
    ...before,
    name: 'Renamed',
    concessionPolicyId: null,
    concessionPolicyVersionId: null,
    concessionApplicableFeeHeadIds: ['different'],
  });
  expect(buildStructureChanges(before, after)).toEqual({ name: 'Renamed' });
});
it('uses only a unique current default and rejects ambiguous defaults', () => {
  const policy = {
    family: 'collection',
    isDefault: true,
    isCurrent: true,
    id: 'p',
    versionId: 'v2',
  };
  expect(defaultPolicy({ policies: [policy] } as any, 'collection')).toEqual(policy);
  expect(
    defaultPolicy({ policies: [policy, { ...policy, id: 'q' }] } as any, 'collection')
  ).toBeUndefined();
  expect(
    defaultPolicy({ policies: [{ ...policy, isCurrent: false }] } as any, 'collection')
  ).toBeUndefined();
});
it('removes retired receipt fields and validates monetary bounds', () => {
  expect(structureCandidate({ receiptBookId: 'legacy' } as any)).not.toHaveProperty(
    'receiptBookId'
  );
  [NaN, Infinity, -1, 1.234, 10000000000].forEach((amount) =>
    expect(amountError(amount)).not.toBe('')
  );
  [0, 1.23, 9999999999.99].forEach((amount) => expect(amountError(amount)).toBe(''));
});

it('explains duplicate names without exposing an internal error code', () => {
  expect(structureError({ data: { errorCode: 'Finance:FeeStructure:DuplicateName' } })).toContain(
    'Choose a different name'
  );
});

it('requires an entered amount without converting a blank into a free fee', () => {
  expect(amountError('')).toContain('Enter the total fee');
  expect(amountError('  ')).toContain('Enter the total fee');
  expect(amountError('0')).toBe('');
  expect(amountError('90.25')).toBe('');
  expect(amountError('invalid')).not.toBe('');
});

it('offers the published monthly default from the reported mixed Draft/Active response', () => {
  const base = {
    academicYearId: 'year',
    boardId: 'board',
    status: 'Draft',
    publishedVersionId: null,
    publishedVersionNumber: null,
    isDefault: false,
  };
  const active = {
    ...base,
    id: 'monthly',
    name: 'monthly payment term',
    status: 'Active',
    publishedVersionId: 'monthly-v1',
    publishedVersionNumber: 1,
    isDefault: true,
  };
  const terms = selectablePaymentTerms(
    [
      { ...base, id: 'cbse' },
      { ...base, id: 'quarterly' },
      active,
      { ...active, id: 'archived', status: 'Archived' },
      { ...active, id: 'wrong-board', boardId: 'another' },
      { ...active, id: 'wrong-year', academicYearId: 'another' },
    ] as any,
    'year',
    'board'
  );
  expect(terms).toHaveLength(1);
  expect(defaultPaymentTerm(terms)).toMatchObject({
    id: 'monthly',
    versionId: 'monthly-v1',
    isDefault: true,
  });
  expect(defaultPaymentTerm([...terms, { ...terms[0], id: 'duplicate' }])).toBeUndefined();
  expect(defaultPaymentTerm([])).toBeUndefined();
});

it('requires both term IDs and preserves pinned versions and customized schedules when defaulting', () => {
  const line = {
    feeHeadId: 'head',
    amount: 100,
    paymentTermId: null,
    paymentTermVersionId: null,
    scheduleMode: 'Inherited',
    installmentOverrides: [],
  } as any;
  const term = { id: 'monthly', versionId: 'v2', name: 'Monthly', versionNumber: 2 } as any;
  expect(paymentTermError(line)).not.toBe('');
  expect(paymentTermError({ ...line, paymentTermId: 'monthly' })).not.toBe('');
  const selected = withDefaultPaymentTerm(line, term);
  expect(paymentTermError(selected)).toBe('');
  expect(selected).toMatchObject({
    paymentTermId: 'monthly',
    paymentTermVersionId: 'v2',
    paymentTermName: 'Monthly',
  });
  const pinned = { ...selected, paymentTermVersionId: 'v1' };
  expect(withDefaultPaymentTerm(pinned, term)).toBe(pinned);
  const customized = { ...line, scheduleMode: 'Customized' as const };
  expect(withDefaultPaymentTerm(customized, term)).toBe(customized);
  expect(withDefaultPaymentTerm(line, undefined)).toBe(line);
});
