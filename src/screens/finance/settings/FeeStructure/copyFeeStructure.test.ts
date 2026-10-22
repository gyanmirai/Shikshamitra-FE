import type { StructureRecord } from 'src/redux/finance/feeStructureWorkspace';

import { it, expect, describe } from 'vitest';

import { availableCopyName, copyStructureCandidate } from './copyFeeStructure';

describe('copy fee structure payload', () => {
  it('preserves amounts, variable nulls, pinned versions, policy scope and custom schedules without reusing identities', () => {
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
    const result = copyStructureCandidate(source, '  New fees  ');
    expect(result).toMatchObject({
      name: 'New fees',
      saveAsDraft: true,
      collectionPolicyVersionId: 'collection-v1',
      concessionPolicyVersionId: 'concession-v2',
      refundPolicyId: null,
      refundPolicyVersionId: null,
      concessionFeeHeadScope: 'SelectedFeeHeads',
      concessionApplicableFeeHeadIds: ['head'],
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

  it('retains the source name when available and suggests a unique bounded name on collisions', () => {
    expect(availableCopyName('Annual fees', [])).toBe('Annual fees');
    expect(availableCopyName('Annual fees', [' ANNUAL FEES ', 'Annual fees (copy)'])).toBe(
      'Annual fees (copy 2)'
    );
    expect(availableCopyName('a'.repeat(256), ['a'.repeat(256)])).toHaveLength(256);
  });
});
