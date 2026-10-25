import type { StructureRecord } from 'src/redux/finance/feeStructureWorkspace';

import { it, expect, describe } from 'vitest';

import { availableCopyName, copyStructureCandidate } from './copyFeeStructure';

describe('copy fee structure payload', () => {
  it('selects current linked policies and preserves amounts, variable nulls and custom schedules without reusing identities', () => {
    const source = {
      id: 'source',
      name: 'Source fees',
      status: 0,
      concurrencyStamp: 'source-stamp',
      collectionPolicyId: 'collection',
      collectionPolicyVersionId: 'collection-v1',
      concessionPolicyId: 'concession',
      concessionPolicyVersionId: 'concession-v2',
      refundPolicyId: null,
      refundPolicyVersionId: null,
      concessionFeeHeadScope: 'SelectedFeeHeads',
      concessionApplicableFeeHeadIds: ['head'],
      feeHeads: [
        {
          id: 'source-line',
          feeHeadId: 'head',
          amount: 1234.56,
          isOptional: true,
          isOneTime: true,
          payableMonth: 4,
          payableYear: 2026,
          paymentTermId: 'term',
          paymentTermVersionId: 'term-v2',
          scheduleMode: 'Customized',
          installmentOverrides: [
            {
              sourcePaymentTermInstallmentId: 'installment',
              allocationPercentage: 100,
              dueDate: '2026-05-01',
            },
          ],
        },
        { id: 'variable-line', feeHeadId: 'variable', amount: null, isVariable: true },
      ],
    } as StructureRecord;
    const before = structuredClone(source);
    const result = copyStructureCandidate(source, '  New fees  ', [
      {
        family: 'collection',
        policyId: 'collection',
        policyName: 'Collection',
        sourceVersionId: 'collection-v1',
        sourceVersionNumber: 1,
        currentVersionId: 'collection-v3',
        currentVersionNumber: 3,
        error: null,
      },
      {
        family: 'concession',
        policyId: 'concession',
        policyName: 'Concession',
        sourceVersionId: 'concession-v2',
        sourceVersionNumber: 2,
        currentVersionId: 'concession-v4',
        currentVersionNumber: 4,
        error: null,
      },
    ]);
    expect(result).toMatchObject({
      name: 'New fees',
      saveAsDraft: true,
      collectionPolicyVersionId: 'collection-v3',
      concessionPolicyId: null,
      concessionPolicyVersionId: null,
      refundPolicyId: null,
      refundPolicyVersionId: null,
      concessionFeeHeadScope: 'EntireFeeStructure',
      concessionApplicableFeeHeadIds: [],
    });
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('concurrencyStamp');
    expect(result.feeHeads[0]).not.toHaveProperty('id');
    expect(result.feeHeads[0]).toMatchObject({
      amount: 1234.56,
      paymentTermVersionId: 'term-v2',
      isOptional: true,
      isOneTime: true,
      scheduleMode: 'Customized',
      installmentOverrides: source.feeHeads[0].installmentOverrides,
    });
    expect(result.feeHeads[1]).toMatchObject({ isVariable: true, amount: null });
    result.feeHeads[0].installmentOverrides[0].dueDate = '2026-06-01';
    result.concessionApplicableFeeHeadIds.push('other');
    expect(source).toEqual(before);
  });

  it('explicitly removes retired concession attachments without requiring a current concession version', () => {
    const source = {
      concessionPolicyId: 'legacy',
      concessionPolicyVersionId: 'legacy-v1',
      concessionFeeHeadScope: 'SelectedFeeHeads',
      concessionApplicableFeeHeadIds: ['head'],
      feeHeads: [],
    } as unknown as StructureRecord;
    expect(copyStructureCandidate(source, 'Copy', [])).toMatchObject({
      concessionPolicyId: null,
      concessionPolicyVersionId: null,
      concessionFeeHeadScope: 'EntireFeeStructure',
      concessionApplicableFeeHeadIds: [],
    });
    expect(source.concessionPolicyVersionId).toBe('legacy-v1');
  });

  it('refuses a missing, inactive or mismatched current policy instead of copying a stale snapshot', () => {
    const source = {
      collectionPolicyId: 'collection',
      collectionPolicyVersionId: 'old',
      feeHeads: [],
    } as unknown as StructureRecord;
    expect(() => copyStructureCandidate(source, 'Copy', [])).toThrow(/Collection Policy/);
    expect(() =>
      copyStructureCandidate(source, 'Copy', [
        {
          family: 'collection',
          policyId: 'other',
          policyName: 'Other',
          sourceVersionId: null,
          sourceVersionNumber: null,
          currentVersionId: 'v1',
          currentVersionNumber: 1,
          error: null,
        },
      ])
    ).toThrow(/Collection Policy/);
    expect(() =>
      copyStructureCandidate(source, 'Copy', [
        {
          family: 'collection',
          policyId: 'collection',
          policyName: 'Collection',
          sourceVersionId: 'old',
          sourceVersionNumber: 1,
          currentVersionId: null,
          currentVersionNumber: 2,
          error: 'Inactive',
        },
      ])
    ).toThrow(/Collection Policy/);
  });

  it('retains the source name when available and suggests a unique bounded name on collisions', () => {
    expect(availableCopyName('Annual fees', [])).toBe('Annual fees');
    expect(availableCopyName('Annual fees', [' ANNUAL FEES ', 'Annual fees (copy)'])).toBe(
      'Annual fees (copy 2)'
    );
    expect(availableCopyName('a'.repeat(256), ['a'.repeat(256)])).toHaveLength(256);
  });
});
