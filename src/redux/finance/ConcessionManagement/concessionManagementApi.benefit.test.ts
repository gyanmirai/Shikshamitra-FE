import { beforeEach, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { api } from 'src/redux/service';

import { concessionManagementApi } from './concessionManagementApi';

const transport = vi.hoisted(() => ({
  blocked: true,
  contextCalls: 0,
  lastContextParams: {} as any,
  detailCalls: {} as Record<string, number>,
  listCalls: 0,
}));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      endpoints: () => ({}),
      baseQuery: async (args: any) => {
        if (args.url === '/concession-request/concession-applications') {
          transport.listCalls += 1;
          return { data: { items: [], totalCount: 0 } };
        }
        if (
          args.url.startsWith('/concession-request/') &&
          args.url !== '/concession-request/context' &&
          args.method === 'GET' &&
          !args.url.endsWith('/approval-context')
        ) {
          const id = args.url.split('/').at(-1) as string;
          transport.detailCalls[id] = (transport.detailCalls[id] || 0) + 1;
          return { data: { data: { id } } };
        }
        if (args.url === '/concession-request/context') {
          transport.contextCalls += 1;
          transport.lastContextParams = args.params;
          return {
            data: {
              concessionTypes: [
                {
                  concessionTypeId: 'type',
                  benefitBlocker: transport.blocked
                    ? {
                        code: 'Finance:Concession:010010',
                        message: 'Another request is pending.',
                        blockingRequestId: 'other-request',
                        blockingStatus: 'Pending',
                      }
                    : null,
                },
              ],
            },
          };
        }
        if (args.url.endsWith('/approve')) transport.blocked = true;
        if (args.url.endsWith('/cancel') || args.url.endsWith('/reject')) transport.blocked = false;
        return { data: { success: true, data: {} } };
      },
    }),
  };
});
beforeEach(() => {
  transport.blocked = true;
  transport.contextCalls = 0;
  transport.detailCalls = {};
  transport.listCalls = 0;
});

it('refreshes only the changed request detail after rejection', async () => {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const changed = store.dispatch(
    concessionManagementApi.endpoints.getConcessionRequestById.initiate({
      concessionRequestId: 'changed',
    })
  );
  const unrelated = store.dispatch(
    concessionManagementApi.endpoints.getConcessionRequestById.initiate({
      concessionRequestId: 'unrelated',
    })
  );
  const list = store.dispatch(
    concessionManagementApi.endpoints.getConcessionApplications.initiate({ academicYearId: 'year' })
  );
  try {
    await Promise.all([changed.unwrap(), unrelated.unwrap(), list.unwrap()]);
    await store
      .dispatch(
        concessionManagementApi.endpoints.rejectConcessionRequest.initiate({
          studentConcessionTypeRequestId: 'changed',
          body: {} as any,
        })
      )
      .unwrap();
    await waitFor(() => expect(transport.detailCalls.changed).toBe(2));
    await waitFor(() => expect(transport.listCalls).toBe(2));
    expect(transport.detailCalls.unrelated).toBe(1);
  } finally {
    changed.unsubscribe();
    unrelated.unsubscribe();
    list.unsubscribe();
  }
});

it.each(['cancel', 'reject', 'approve'] as const)(
  'refreshes subscribed type eligibility after %s without reopening the form',
  async (action) => {
    transport.blocked = action !== 'approve';
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (getDefault) => getDefault().concat(api.middleware),
    });
    const args = {
      academicYearId: 'year',
      studentId: 'student',
      concessionTypeId: 'type',
      requestId: 'own-draft',
    };
    const query = store.dispatch(
      concessionManagementApi.endpoints.getConcessionRequestContext.initiate(args)
    );
    try {
      await query.unwrap();
      expect(transport.lastContextParams.requestId).toBe('own-draft');
      if (action === 'cancel')
        await store
          .dispatch(
            concessionManagementApi.endpoints.cancelConcessionRequest.initiate({
              studentConcessionTypeRequestId: 'other-request',
              reason: 'Withdraw duplicate request',
              requestConcurrencyStamp: 'stamp',
            })
          )
          .unwrap();
      if (action === 'reject')
        await store
          .dispatch(
            concessionManagementApi.endpoints.rejectConcessionRequest.initiate({
              studentConcessionTypeRequestId: 'other-request',
              body: {
                message: 'Reject duplicate request',
                requestConcurrencyStamp: 'stamp',
                idempotencyKey: 'reject',
              },
            })
          )
          .unwrap();
      if (action === 'approve')
        await store
          .dispatch(
            concessionManagementApi.endpoints.approveConcessionRequest.initiate({
              studentConcessionTypeRequestId: 'other-request',
              body: {
                requestConcurrencyStamp: 'stamp',
                previewFingerprint: 'preview',
                idempotencyKey: 'approve',
              },
            })
          )
          .unwrap();
      await waitFor(() =>
        expect(
          Boolean(
            concessionManagementApi.endpoints.getConcessionRequestContext.select(args)(
              store.getState()
            ).data?.concessionTypes[0].benefitBlocker
          )
        ).toBe(action === 'approve')
      );
      expect(transport.contextCalls).toBe(2);
    } finally {
      query.unsubscribe();
      store.dispatch(api.util.resetApiState());
    }
  }
);
