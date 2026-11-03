import { configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from 'src/redux/service';

import { feeRefundApi } from '../RefundManagement/feeRefundManage';
import { concessionManagementApi } from './concessionManagementApi';

const transport = vi.hoisted(() => ({ refundCreated: false, refundReads: 0, fail: false }));

vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      endpoints: () => ({}),
      baseQuery: async (args: any): Promise<any> => {
        if (args.url === '/fee-refunds') {
          transport.refundReads += 1;
          const items = transport.refundCreated
            ? [{ id: 'refund', concessionRequestId: 'concession', totalAmount: 1538 }]
            : [];
          return { data: { totalCount: items.length, items } };
        }
        if (transport.fail) return { error: { status: 400, data: { detail: 'Preview changed.' } } };
        transport.refundCreated = true;
        return {
          data: {
            success: true,
            data: { concessionRequestId: 'concession', status: 1, paidConcessionAmount: 1538 },
          },
        };
      },
    }),
  };
});

const refundArgs = { academicYearId: 'year', studentId: 'student' };
type Command = 'create' | 'submit';

function fixture() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const command = (kind: Command) => {
    if (kind === 'create')
      return store
        .dispatch(
          concessionManagementApi.endpoints.createConcessionRequest.initiate({
            academicYearId: 'year',
            studentId: 'student',
            concessionPolicyId: 'policy',
            concessionPolicyVersionId: 'version',
            concessionTypeId: 'type',
            feeHeadConcessions: [],
            documents: [],
          })
        )
        .unwrap();
    return store
      .dispatch(
        concessionManagementApi.endpoints.submitConcessionRequest.initiate({
          concessionRequestId: 'concession',
          concurrencyStamp: 'stamp',
          previewFingerprint: 'preview',
          idempotencyKey: 'submit',
        })
      )
      .unwrap();
  };
  return { store, command };
}

describe('administrator concession approval refreshes linked refunds', () => {
  beforeEach(() => Object.assign(transport, { refundCreated: false, refundReads: 0, fail: false }));

  it.each<Command>(['create', 'submit'])(
    '%s refreshes an already subscribed empty Refunds list and its count',
    async (kind) => {
      const { store, command } = fixture();
      const query = store.dispatch(feeRefundApi.endpoints.getFeeRefunds.initiate(refundArgs));
      try {
        expect((await query.unwrap()).totalCount).toBe(0);
        await command(kind);
        await waitFor(() =>
          expect(
            feeRefundApi.endpoints.getFeeRefunds.select(refundArgs)(store.getState()).data
          ).toMatchObject({
            totalCount: 1,
            items: [{ id: 'refund', concessionRequestId: 'concession', totalAmount: 1538 }],
          })
        );
        expect(transport.refundReads).toBe(2);
      } finally {
        query.unsubscribe();
        store.dispatch(api.util.resetApiState());
      }
    }
  );

  it.each<Command>(['create', 'submit'])(
    '%s expires an inactive empty Refunds cache before the next visit',
    async (kind) => {
      const { store, command } = fixture();
      const query = store.dispatch(feeRefundApi.endpoints.getFeeRefunds.initiate(refundArgs));
      try {
        await query.unwrap();
        query.unsubscribe();
        await command(kind);
        const reopened = store.dispatch(feeRefundApi.endpoints.getFeeRefunds.initiate(refundArgs));
        try {
          expect((await reopened.unwrap()).totalCount).toBe(1);
          expect(transport.refundReads).toBe(2);
        } finally {
          reopened.unsubscribe();
        }
      } finally {
        store.dispatch(api.util.resetApiState());
      }
    }
  );

  it.each<Command>(['create', 'submit'])(
    '%s failure preserves the loaded Refunds query',
    async (kind) => {
      const { store, command } = fixture();
      const query = store.dispatch(feeRefundApi.endpoints.getFeeRefunds.initiate(refundArgs));
      try {
        await query.unwrap();
        transport.fail = true;
        await expect(command(kind)).rejects.toMatchObject({ status: 400 });
        expect(transport.refundReads).toBe(1);
        expect(transport.refundCreated).toBe(false);
      } finally {
        query.unsubscribe();
        store.dispatch(api.util.resetApiState());
      }
    }
  );
});
