import { configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from 'src/redux/service';

import { cashManagementApi } from '../cashManagementApi';
import { feeRefundApi } from './feeRefundManage';

const transport = vi.hoisted(() => ({
  spent: 0,
  fail: false,
  status: 7,
  method: 'Cash',
  cashReads: 0,
  eligibilityReads: 0,
}));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      endpoints: () => ({}),
      baseQuery: async (args: any): Promise<any> => {
        if (args.url === '/finance/cash-management') {
          transport.cashReads += 1;
          return {
            data: { activitySummary: { collected: 1000, spent: transport.spent, deposited: 0 } },
          };
        }
        if (args.url === '/fee-refunds/eligibility') {
          transport.eligibilityReads += 1;
          return { data: { totalRefundable: 1000 - transport.spent } };
        }
        if (transport.fail)
          return { error: { status: 400, data: { detail: 'Routing is unavailable.' } } };
        if (transport.status === 7 && transport.method === 'Cash') transport.spent += 200;
        return { data: { id: 'refund', status: transport.status, refundMethod: transport.method } };
      },
    }),
  };
});

type Command = 'create' | 'approve' | 'record';
const cashArgs = { academicYearId: 'year', month: 11, year: 2026, page: 1, pageSize: 20 };
const eligibilityArgs = { studentId: 'student', academicYearId: 'year' };

function fixture() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const cash = store.dispatch(cashManagementApi.endpoints.getCashManagement.initiate(cashArgs));
  const eligibility = store.dispatch(
    feeRefundApi.endpoints.getRefundEligibility.initiate(eligibilityArgs)
  );
  const command = (kind: Command) => {
    if (kind === 'create')
      return store
        .dispatch(
          feeRefundApi.endpoints.createFeeRefund.initiate({
            idempotencyKey: 'create-key',
            studentId: 'student',
            academicYearId: 'year',
            originalReceiptId: 'receipt',
            lines: [{ dueFeeId: 'due', sourceAllocationId: 'allocation', amount: 200 }],
            refundMethod: 'Cash',
            paymentDetails: { receivedBy: 'Parent' },
            reason: 'Excess payment',
          })
        )
        .unwrap();
    if (kind === 'approve')
      return store
        .dispatch(feeRefundApi.endpoints.approveFeeRefund.initiate({ id: 'refund' }))
        .unwrap();
    return store
      .dispatch(
        feeRefundApi.endpoints.recordRefundPayout.initiate({
          id: 'refund',
          body: {
            idempotencyKey: 'pay-key',
            method: 'Cash',
            amount: 200,
            paymentDate: '2026-11-02T10:00:00Z',
            bankAccountId: 'bank',
            expenseCategoryId: 'category',
          },
        })
      )
      .unwrap();
  };
  return {
    store,
    cash,
    eligibility,
    command,
    close: () => {
      cash.unsubscribe();
      eligibility.unsubscribe();
      store.dispatch(api.util.resetApiState());
    },
  };
}

describe('refund cash completion refreshes subscribed financial views', () => {
  beforeEach(() => {
    Object.assign(transport, {
      spent: 0,
      fail: false,
      status: 7,
      method: 'Cash',
      cashReads: 0,
      eligibilityReads: 0,
    });
  });

  it.each<Command>(['create', 'approve', 'record'])(
    '%s refreshes the loaded monthly cash spent and remaining refund eligibility',
    async (kind) => {
      const test = fixture();
      try {
        await Promise.all([test.cash.unwrap(), test.eligibility.unwrap()]);
        await test.command(kind);
        await waitFor(() =>
          expect(
            cashManagementApi.endpoints.getCashManagement.select(cashArgs)(test.store.getState())
              .data?.activitySummary.spent
          ).toBe(200)
        );
        await waitFor(() =>
          expect(
            feeRefundApi.endpoints.getRefundEligibility.select(eligibilityArgs)(
              test.store.getState()
            ).data?.totalRefundable
          ).toBe(800)
        );
        expect(transport.cashReads).toBe(2);
        expect(transport.eligibilityReads).toBe(2);
      } finally {
        test.close();
      }
    }
  );

  it.each<Command>(['create', 'approve', 'record'])(
    '%s failure keeps the loaded cash view and eligibility without a false refresh',
    async (kind) => {
      const test = fixture();
      try {
        await Promise.all([test.cash.unwrap(), test.eligibility.unwrap()]);
        transport.fail = true;
        await expect(test.command(kind)).rejects.toMatchObject({ status: 400 });
        await Promise.resolve();
        expect(transport.cashReads).toBe(1);
        expect(transport.eligibilityReads).toBe(1);
      } finally {
        test.close();
      }
    }
  );

  it.each([
    { status: 0, method: 'Cash' },
    { status: 2, method: 'Bank Transfer (NEFT/RTGS/IMPS)' },
    { status: 7, method: 'Bank Transfer (NEFT/RTGS/IMPS)' },
  ])(
    'does not refresh cash activity for a request that did not complete cash ($status, $method)',
    async (result) => {
      const test = fixture();
      try {
        await Promise.all([test.cash.unwrap(), test.eligibility.unwrap()]);
        Object.assign(transport, result);
        await test.command('create');
        await test.command('approve');
        await Promise.resolve();
        expect(transport.cashReads).toBe(1);
      } finally {
        test.close();
      }
    }
  );
});
