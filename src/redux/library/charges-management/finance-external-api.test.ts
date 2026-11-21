import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';

import { libraryFinanceApi } from './finance-external-api';
import { financeCommandCases } from './finance-external-cases.fixture';
import {
  form,
  source,
  collection,
  receivable,
  collectBody,
  financeTestStore,
} from './finance-external.fixture';

import type { FinanceTestStore } from './finance-external.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
const root = 'http://library.test/api/finance/external-receivables';
it.each(financeCommandCases)(
  'sends the exact source-bound Finance command to $route',
  async ({ route, body, response, invoke }) => {
    let captured: unknown;
    mswServer.use(
      http.post(root + route, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json(response);
      })
    );

    await expect(invoke(financeTestStore())).resolves.toEqual(response);

    expect(captured).toEqual(body);
    expect(captured).not.toHaveProperty('memberId');
    expect(captured).not.toHaveProperty('paymentStatus');
    expect(captured).not.toHaveProperty('paidDate');
  }
);

it.each([
  {
    route: '',
    response: receivable,
    invoke: (store: FinanceTestStore) =>
      store
        .dispatch(libraryFinanceApi.endpoints.getFinanceExternalReceivable.initiate(source))
        .unwrap(),
  },
  {
    route: '/collect-form',
    response: form,
    invoke: (store: FinanceTestStore) =>
      store
        .dispatch(libraryFinanceApi.endpoints.getFinanceExternalCollectForm.initiate(source))
        .unwrap(),
  },
])(
  'preserves the opaque source reference in the $route read query',
  async ({ route, response, invoke }) => {
    let captured: URLSearchParams | undefined;
    mswServer.use(
      http.get(root + route, ({ request }) => {
        captured = new URL(request.url).searchParams;
        return HttpResponse.json(response);
      })
    );

    await expect(invoke(financeTestStore())).resolves.toEqual(response);

    expect(captured?.get('kind')).toBe('1');
    expect(captured?.get('sourceId')).toBe(source.sourceId);
    expect(captured?.get('sourceVersion')).toBe(source.sourceVersion);
    expect(captured?.has('memberId')).toBe(false);
    expect(captured?.has('academicYearId')).toBe(false);
  }
);

it('retries the same partial payment command without replacing principal, school date or idempotency key', async () => {
  const captured: unknown[] = [];
  mswServer.use(
    http.post(`${root}/collections`, async ({ request }) => {
      captured.push(await request.json());
      return HttpResponse.json(collection);
    })
  );
  const store = financeTestStore();

  const first = await store
    .dispatch(libraryFinanceApi.endpoints.collectFinanceExternalReceivable.initiate(collectBody))
    .unwrap();
  const retry = await store
    .dispatch(libraryFinanceApi.endpoints.collectFinanceExternalReceivable.initiate(collectBody))
    .unwrap();

  expect(captured).toEqual([collectBody, collectBody]);
  expect(first.receivable.originalAmount).toBe(100.75);
  expect(first.acceptedAmount).toBe(40.25);
  expect(first.schoolReceiptDate).toBe('2026-11-18');
  expect(retry.receiptId).toBe(first.receiptId);
  expect(retry.collectionId).toBe(first.collectionId);
});
