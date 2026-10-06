import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';

import { financeRoutingApi } from './financeRoutingApi';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('./financeModuleApi', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { financeModuleType } = await import('src/redux/tagTypes');
  return {
    financeModuleApi: createApi({
      reducerPath: 'bankLookupRegressionApi',
      baseQuery: mocks.request,
      tagTypes: Object.values(financeModuleType),
      endpoints: () => ({}),
    }),
  };
});

describe('Finance bank routing lookup contract', () => {
  it('normalizes labels once for dropdowns, selected values and payment review without changing IDs', async () => {
    mocks.request.mockResolvedValue({
      data: {
        incomeCategories: [{ id: 'income', label: 'Fees' }],
        expenseCategories: [],
        bankAccounts: [
          { id: 'sbi-1234', label: 'SBI • 1234' },
          { id: 'sbi-5678', label: 'SBI - null', maskedAccountNumber: 'XXXX5678' },
          { id: 'legacy', label: 'SBI - undefined' },
          { id: 'missing', label: null },
          {
            id: 'redacted-master',
            bankName: 'SBI',
            accountNumber: null,
            maskedAccountNumber: '********4321',
            accountHolderName: 'School Account',
          },
          { id: 'bank-only', label: 'SBI', bankName: 'SBI', maskedAccountNumber: 'XXXX8765' },
          { id: 'holder', bankName: 'SBI', accountHolderName: 'School Operating Account' },
          { id: 'name-only', bankName: 'SBI', maskedAccountNumber: null, accountHolderName: null },
        ],
      },
    });
    const store = configureStore({
      reducer: { [financeRoutingApi.reducerPath]: financeRoutingApi.reducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(financeRoutingApi.middleware),
    });
    try {
      const data = await store
        .dispatch(
          financeRoutingApi.endpoints.getFinanceRoutingOptions.initiate({
            academicYearId: 'year',
            operation: 'collection',
          })
        )
        .unwrap();
      expect(mocks.request.mock.calls[0][0]).toEqual({
        url: '/finance-routing-options',
        params: { academicYearId: 'year', operation: 'collection' },
      });
      expect(data.bankAccounts).toEqual([
        { id: 'sbi-1234', label: 'SBI • 1234' },
        { id: 'sbi-5678', label: 'SBI - XXXX5678' },
        { id: 'legacy', label: 'SBI' },
        { id: 'missing', label: 'Bank account (details unavailable)' },
        { id: 'redacted-master', label: 'SBI - ********4321' },
        { id: 'bank-only', label: 'SBI - XXXX8765' },
        { id: 'holder', label: 'SBI - School Operating Account' },
        { id: 'name-only', label: 'SBI' },
      ]);
      expect(data.items).toEqual([{ id: 'income', name: 'Fees' }]);
    } finally {
      store.dispatch(financeRoutingApi.util.resetApiState());
    }
  });
});
