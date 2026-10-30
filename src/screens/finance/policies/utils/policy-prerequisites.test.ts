import { it, expect, describe } from 'vitest';

import {
  refundPolicyPrerequisites,
  prorationPolicyPrerequisites,
  collectionPolicyPrerequisites,
} from './policy-prerequisites';

const empty = { currentData: [] };
const routing = { currentData: { expenseCategories: [], incomeCategories: [], bankAccounts: [] } };
const refund = {
  status: 'Draft',
  feeHeadScope: 'AllFeeHeads',
  applicableFeeHeadIds: [],
  allowedPayoutMethods: ['Cash'],
  expenseCategoryId: '',
  defaultPayingBankAccountId: '',
};
const collection = {
  status: 'Draft',
  enableLateFee: false,
  lateFeeApplyOnFeeHeads: [],
  lateFeeIncomeCategoryId: '',
};

describe('policy prerequisites', () => {
  it('requires fee heads immediately for the default all-head refund draft', () => {
    expect(refundPolicyPrerequisites(refund, empty, routing)).toEqual([{ key: 'fee-head' }]);
  });
  it('clears the fee-head prerequisite when active heads become available', () => {
    expect(refundPolicyPrerequisites(refund, { currentData: [{ id: 'active' }] }, routing)).toEqual([]);
  });
  it('requires active heads for selected-head refunds without saved choices', () => {
    expect(
      refundPolicyPrerequisites({ ...refund, feeHeadScope: 'SelectedFeeHeads' }, empty, routing)
    ).toEqual([{ key: 'fee-head' }]);
    expect(
      refundPolicyPrerequisites(
        { ...refund, feeHeadScope: 'SelectedFeeHeads', applicableFeeHeadIds: ['historical'] },
        empty,
        routing
      )
    ).toEqual([]);
  });
  it('requires expense routing for active refund policies and bank routing for noncash methods', () => {
    expect(refundPolicyPrerequisites({ ...refund, status: 'Active' }, empty, routing)).toEqual([
      { key: 'fee-head' },
      { key: 'expense-category' },
    ]);
    expect(
      refundPolicyPrerequisites(
        { ...refund, status: 'Active', allowedPayoutMethods: ['Cash', 'Cheque'] },
        empty,
        routing
      )
    ).toEqual([{ key: 'fee-head' }, { key: 'expense-category' }, { key: 'bank-account' }]);
    expect(
      refundPolicyPrerequisites(
        {
          ...refund,
          status: 'Active',
          applicableFeeHeadIds: ['saved'],
          expenseCategoryId: 'saved',
          allowedPayoutMethods: ['Cheque'],
          defaultPayingBankAccountId: 'saved',
        },
        empty,
        routing
      )
    ).toEqual([]);
  });
  it('requires heads for new proration rules and retains historical rules', () => {
    expect(prorationPolicyPrerequisites([], empty)).toEqual([{ key: 'fee-head' }]);
    expect(prorationPolicyPrerequisites([{ feeHeadId: 'historical' }], empty)).toEqual([]);
  });
  it('requires heads only when collection late fees are enabled', () => {
    expect(collectionPolicyPrerequisites(collection, empty, routing)).toEqual([]);
    expect(
      collectionPolicyPrerequisites({ ...collection, enableLateFee: true }, empty, routing)
    ).toEqual([{ key: 'fee-head' }]);
  });
  it('requires income routing only for active collection late fees and keeps saved selections', () => {
    expect(
      collectionPolicyPrerequisites(
        { ...collection, status: 'Active', enableLateFee: true, lateFeeApplyOnFeeHeads: ['saved'] },
        empty,
        routing
      )
    ).toEqual([{ key: 'income-category' }]);
    expect(
      collectionPolicyPrerequisites(
        {
          ...collection,
          status: 'Active',
          enableLateFee: true,
          lateFeeApplyOnFeeHeads: ['saved'],
          lateFeeIncomeCategoryId: 'saved',
        },
        empty,
        routing
      )
    ).toEqual([]);
  });
  it.each([
    { isFetching: true },
    { isLoading: true },
    { isError: true },
    { isUninitialized: true },
    { currentData: undefined },
  ])('never treats pending, failed or previous-scope data as missing: %o', (state) => {
    expect(refundPolicyPrerequisites(refund, { ...empty, ...state }, {})).toEqual([]);
    expect(
      refundPolicyPrerequisites(
        { ...refund, feeHeadScope: 'SelectedFeeHeads' },
        { ...empty, ...state },
        {}
      )
    ).toEqual([]);
    expect(prorationPolicyPrerequisites([], { ...empty, ...state })).toEqual([]);
    expect(
      collectionPolicyPrerequisites(
        { ...collection, enableLateFee: true },
        { ...empty, ...state },
        {}
      )
    ).toEqual([]);
  });
});
