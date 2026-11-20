import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { libraryFinanceApi } from './finance-external-api';
import { financeTestStore } from './finance-external.fixture';
import {
  nextIds,
  nextRoot,
  nextSource,
  nextRevision,
  nextReceivable,
  nextRefundForm,
  nextSourceQuery,
  nextRefundCommand,
  nextRefundPreview,
  nextRefundRequest,
  nextWaiverContext,
  nextRefundSelection,
  requireNextEndpoint,
} from './finance-next-actions.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'actual-next-finance-auth' }),
  signOut: vi.fn(),
}));
beforeEach(clearCachedAuthSession);

const waiverReads = [
  { action: 0, route: 'waiver-apply-context', label: 'ApplyWaiver' },
  { action: 1, route: 'waiver-approval-context', label: 'ApproveWaiver' },
  { action: 2, route: 'waiver-rejection-context', label: 'RejectWaiver' },
  { action: 3, route: 'waiver-reversal-context', label: 'ReverseWaiver' },
];
it.each(waiverReads)(
  'uses the fixed own-$label GET route through one typed waiver-context endpoint',
  async (spec) => {
    const endpoint = requireNextEndpoint('getFinanceExternalWaiverContext');
    const seen: { query: Record<string, string>; authorization: string | null }[] = [];
    const response = nextWaiverContext(spec.action);
    mswServer.use(
      http.get(`${nextRoot}/operator/${spec.route}`, ({ request }) => {
        seen.push({
          query: Object.fromEntries(new URL(request.url).searchParams),
          authorization: request.headers.get('authorization'),
        });
        return HttpResponse.json(response);
      })
    );
    const store = financeTestStore();
    const request = store.dispatch(endpoint.initiate({ source: nextSource, action: spec.action }));
    try {
      expect(await request.unwrap()).toEqual(response);
      expect(seen).toEqual([
        { query: nextSourceQuery, authorization: 'Bearer actual-next-finance-auth' },
      ]);
      expect(seen[0].query.kind).toBe('1');
      expect(seen[0].query.sourceVersion).toBe(nextSource.sourceVersion);
      ['action', 'source', 'memberId', 'studentId', 'academicYearId'].forEach((field) =>
        expect(seen[0].query).not.toHaveProperty(field)
      );
      expect(response.collectionPolicyVersionId).toBe(nextIds.collectionVersion);
      expect(response.revision).not.toBe(nextSource.sourceVersion);
    } finally {
      request.unsubscribe();
      store.dispatch(api.util.resetApiState());
    }
  }
);

const refundRoutes = [
  {
    endpoint: 'getFinanceExternalRefundForm',
    method: 'GET',
    route: '/refund-form',
    input: nextSource,
    response: nextRefundForm,
  },
  {
    endpoint: 'previewFinanceExternalRefund',
    method: 'POST',
    route: '/refunds/preview',
    input: nextRefundSelection,
    response: nextRefundPreview,
  },
  {
    endpoint: 'createFinanceExternalRefund',
    method: 'POST',
    route: '/refunds',
    input: nextRefundCommand,
    response: nextRefundRequest,
  },
];
it.each(refundRoutes)(
  'preserves the exact typed source and server money result on $method $route',
  async (spec) => {
    const endpoint = requireNextEndpoint(spec.endpoint);
    const seen: { query: Record<string, string>; body: unknown; authorization: string | null }[] =
      [];
    const intents = new Set<string>();
    const handle = async ({ request }: { request: Request }) => {
      const body = request.method === 'POST' ? await request.json() : undefined;
      seen.push({
        query: Object.fromEntries(new URL(request.url).searchParams),
        body,
        authorization: request.headers.get('authorization'),
      });
      if (spec.endpoint === 'createFinanceExternalRefund')
        intents.add((body as { idempotencyKey: string }).idempotencyKey);
      return HttpResponse.json(spec.response);
    };
    mswServer.use(
      spec.method === 'GET'
        ? http.get(nextRoot + spec.route, handle)
        : http.post(nextRoot + spec.route, handle)
    );
    const store = financeTestStore();
    const request = store.dispatch(endpoint.initiate(spec.input));
    try {
      const response = await request.unwrap();
      expect(response).toEqual(spec.response);
      expect(seen[0].authorization).toBe('Bearer actual-next-finance-auth');
      if (spec.method === 'GET') {
        expect(seen[0]).toMatchObject({ query: nextSourceQuery, body: undefined });
        expect(response).toMatchObject({
          refundPolicyVersionId: nextIds.refundVersion,
          allowedPayoutMethods: ['Cash', 'UPI'],
        });
      } else {
        expect(seen[0]).toMatchObject({ query: {}, body: spec.input });
        expect(seen[0].body).toMatchObject({
          source: nextSource,
          revision: nextRevision,
          originalReceiptId: nextIds.receipt,
          lines: [
            {
              sourceAllocationId: nextIds.allocation,
              sourceReceiptId: nextIds.receipt,
              amount: '15.25',
            },
          ],
        });
        ['studentId', 'memberId', 'paymentStatus', 'paidDate', 'academicYearId'].forEach((field) =>
          expect(seen[0].body).not.toHaveProperty(field)
        );
        if (spec.endpoint === 'previewFinanceExternalRefund') {
          expect(response).toMatchObject({
            requestedAmount: 15.25,
            maximumAllowedAmount: 15,
            isAllowed: true,
          });
          expect(seen[0].body).not.toHaveProperty('idempotencyKey');
        } else {
          const retry = await store.dispatch(endpoint.initiate(spec.input)).unwrap();
          expect(retry.id).toBe(nextIds.refundRequest);
          expect(retry.processedAmount).toBe(0);
          expect(seen.map((item) => item.body)).toEqual([nextRefundCommand, nextRefundCommand]);
          expect(intents.size).toBe(1);
          expect(retry).toMatchObject({
            employeeId: nextIds.employee,
            studentId: null,
            studentFeeStructureId: null,
            financeFeeAccountId: null,
            totalAmount: 15.25,
            calculatedAmount: 15,
            approvedAmount: 0,
            processedAmount: 0,
          });
        }
      }
    } finally {
      if ('unsubscribe' in request) request.unsubscribe();
      store.dispatch(api.util.resetApiState());
    }
  }
);

it.each([true, false])(
  'refreshes owning source/refund form only after accepted submission and preserves cached form on failure (accepted=%s)',
  async (accepted) => {
    const formEndpoint = requireNextEndpoint('getFinanceExternalRefundForm');
    const createEndpoint = requireNextEndpoint('createFinanceExternalRefund');
    let submitted = false;
    const counts = { source: 0, form: 0 };
    const formAfter = {
      ...nextRefundForm,
      revision: 'c'.repeat(64),
      sources: [{ ...nextRefundForm.sources[0], committedAmount: 15, availableAmount: 25.25 }],
    };
    mswServer.use(
      http.get(nextRoot, () => {
        counts.source += 1;
        return HttpResponse.json(nextReceivable);
      }),
      http.get(`${nextRoot}/refund-form`, () => {
        counts.form += 1;
        return HttpResponse.json(submitted ? formAfter : nextRefundForm);
      }),
      http.post(`${nextRoot}/refunds`, () => {
        if (!accepted)
          return HttpResponse.json(
            { errorCode: 'Library:Finance:010113', detail: 'The source ledger changed.' },
            { status: 409 }
          );
        submitted = true;
        return HttpResponse.json(nextRefundRequest);
      })
    );
    const store = financeTestStore();
    const subscriptions = [
      store.dispatch(libraryFinanceApi.endpoints.getFinanceExternalReceivable.initiate(nextSource)),
      store.dispatch(formEndpoint.initiate(nextSource)),
    ];
    try {
      await Promise.all(subscriptions.map((request) => request.unwrap()));
      expect(formEndpoint.select(nextSource)(store.getState()).data).toEqual(nextRefundForm);
      const command = store.dispatch(createEndpoint.initiate(nextRefundCommand));
      if (accepted) {
        await command.unwrap();
        await waitFor(() => expect(counts).toEqual({ source: 2, form: 2 }));
        await waitFor(() =>
          expect(formEndpoint.select(nextSource)(store.getState()).data).toEqual(formAfter)
        );
        // Submitted 15 is committed against refundable receipt money, not already refunded.
        expect(
          libraryFinanceApi.endpoints.getFinanceExternalReceivable.select(nextSource)(
            store.getState()
          ).data
        ).toMatchObject({
          refundedAmount: 0,
          outstandingAmount: 60.5,
          settledPaymentAmount: 40.25,
        });
      } else {
        await expect(command.unwrap()).rejects.toMatchObject({ status: 409 });
        await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
        expect(counts).toEqual({ source: 1, form: 1 });
        expect(formEndpoint.select(nextSource)(store.getState()).data).toEqual(nextRefundForm);
      }
    } finally {
      subscriptions.forEach((request) => request.unsubscribe());
      store.dispatch(api.util.resetApiState());
    }
  }
);
