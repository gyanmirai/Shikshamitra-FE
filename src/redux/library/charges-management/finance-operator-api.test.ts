import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { libraryFinanceApi } from './finance-external-api';
import { receivable, financeTestStore } from './finance-external.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'actual-shared-operator-auth' }),
  signOut: vi.fn(),
}));
beforeEach(clearCachedAuthSession);

const root = 'http://library.test/api/finance/external-receivables/operator';
const source = {
  kind: 1 as const,
  sourceId: '6b3dd3b8-4590-4471-b927-71c874d31bda',
  sourceVersion: ' exact opaque +/=?%& source version ',
};
const sourceQuery = {
  kind: '1',
  sourceId: source.sourceId,
  sourceVersion: source.sourceVersion,
};
const collectionVersionId = 'b2469347-174e-4d65-af7e-c08d3bc39021';
const refundVersionId = 'a5431f16-8f43-45f2-a93b-fb74b9edb176';
const refundPolicyId = '37f3cf8c-a39d-4cdf-b6b7-4f4fbcbba493';
const bindingId = '268cd088-b405-4325-8749-365e6778ab33';
const receiptId = 'c1e173b3-d22f-49d6-8ee2-72e3d50f78a1';
const bindingRevision = 'a'.repeat(64);
const approvalRevision = 'b'.repeat(64);
const sourceReceivable = { ...receivable, source };
const bindingContext = {
  source,
  receivable: sourceReceivable,
  revision: bindingRevision,
  settlementPolicyBindingId: null,
  collectionPolicyVersionId: collectionVersionId,
  refundPolicyVersionId: null,
  canExecute: true,
  issues: [],
};
const approvalContext = {
  ...bindingContext,
  revision: approvalRevision,
  settlementPolicyBindingId: bindingId,
  refundPolicyVersionId: refundVersionId,
};

const cases = [
  {
    name: 'posting choices under the Charges.Add route',
    endpoint: 'getFinanceExternalPostingOptions',
    route: '/posting-options',
    input: { source, optionKind: 0, page: 3, pageSize: 7, search: 'Damage & repair / પુસ્તકો' },
    query: {
      ...sourceQuery,
      optionKind: '0',
      page: '3',
      pageSize: '7',
      search: 'Damage & repair / પુસ્તકો',
    },
    response: {
      totalCount: 29,
      items: [
        {
          id: '5c68d95f-73ba-4207-a337-71e6396ffec7',
          name: 'Damage assessment',
          policyId: null,
          versionNumber: null,
          isSelectable: false,
          blockedReason: 'Configure the source-year income mapping before posting this category.',
        },
      ],
    },
  },
  {
    name: 'immutable refund version choices under the Charges.Update route',
    endpoint: 'getFinanceExternalBindingOptions',
    route: '/binding-options',
    input: { source, optionKind: 2, page: 2, pageSize: 5, search: 'Refund 50% & exceptions' },
    query: {
      ...sourceQuery,
      optionKind: '2',
      page: '2',
      pageSize: '5',
      search: 'Refund 50% & exceptions',
    },
    response: {
      totalCount: 12,
      items: [
        {
          id: refundVersionId,
          name: 'Recorded refund rules',
          policyId: refundPolicyId,
          versionNumber: 4,
          isSelectable: true,
          blockedReason: null,
        },
      ],
    },
  },
  {
    name: 'binding context and its Finance revision under Charges.Update',
    endpoint: 'getFinanceExternalBindingContext',
    route: '/binding-context',
    input: source,
    query: sourceQuery,
    response: bindingContext,
  },
  {
    name: 'independent approval context under Charges.Approve without a collect-form request',
    endpoint: 'getFinanceExternalApprovalContext',
    route: '/approval-context',
    input: source,
    query: sourceQuery,
    response: approvalContext,
  },
  {
    name: 'paged immutable history and the actual result receipt ID under Charges.View',
    endpoint: 'getFinanceExternalHistory',
    route: '/history',
    input: { source, page: 4, pageSize: 3 },
    query: { ...sourceQuery, page: '4', pageSize: '3' },
    response: {
      totalCount: 14,
      items: [
        {
          id: '417ce88c-d93d-4438-88d9-a1dff030aee1',
          operation: 'Collect',
          recordedAt: '2026-11-18T08:30:00+00:00',
          actorName: 'school.cashier',
          resultKind: 'Receipt',
          resultId: receiptId,
          canOpenResult: false,
        },
      ],
    },
  },
];

it.each(cases)('uses authenticated exact-source operator reads for $name', async (spec) => {
  // The owning API currently lacks these definitions. As in the charge-editor
  // client tests, check runtime presence before dispatch so the first RED is an
  // explicit missing-client assertion, not a missing-property TypeScript error.
  const endpoint = (
    libraryFinanceApi.endpoints as unknown as Record<
      string,
      {
        initiate(input: unknown): any;
      }
    >
  )[spec.endpoint];
  expect(endpoint, `The owning Finance client must expose ${spec.endpoint}.`).toBeDefined();
  const requests: {
    query: Record<string, string>;
    authorization: string | null;
    method: string;
  }[] = [];
  mswServer.use(
    http.get(root + spec.route, ({ request }) => {
      requests.push({
        query: Object.fromEntries(new URL(request.url).searchParams),
        authorization: request.headers.get('authorization'),
        method: request.method,
      });
      return HttpResponse.json(spec.response);
    })
  );
  const store = financeTestStore();
  const request = store.dispatch(endpoint.initiate(spec.input));

  try {
    const response = await request.unwrap();
    expect(requests).toEqual([
      {
        query: spec.query,
        authorization: 'Bearer actual-shared-operator-auth',
        method: 'GET',
      },
    ]);
    expect(response).toEqual(spec.response);
    expect(requests[0].query.sourceVersion).toBe(source.sourceVersion);
    expect(requests[0].query).not.toHaveProperty('source');
    expect(requests[0].query).not.toHaveProperty('memberId');
    expect(requests[0].query).not.toHaveProperty('studentId');
    expect(requests[0].query).not.toHaveProperty('academicYearId');
  } finally {
    request.unsubscribe();
  }
});
