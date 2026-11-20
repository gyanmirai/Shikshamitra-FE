import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { LibraryChargeApi } from './charges-get-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'actual-shared-auth-pipeline' }),
  signOut: vi.fn(),
}));
beforeEach(clearCachedAuthSession);

const yearId = '268cd088-b405-4325-8749-365e6778ab33';
const memberId = '5c68d95f-73ba-4207-a337-71e6396ffec7';
const chargeId = '6b3dd3b8-4590-4471-b927-71c874d31bda';
const root = 'http://library.test/api/library/charges';
const opaqueVersion = ' exact opaque source version ';
const page = (items: unknown[]) => ({
  items,
  totalCount: items.length,
  currentPage: 2,
  pageSize: 20,
  totalPages: 2,
});
const member = {
  id: memberId,
  memberName: 'Maya José',
  memberIdentifier: 'STAFF/૨ & 84',
  role: 1,
  hasActiveLibraryMembership: true,
  canAssignDirect: false,
  requiresLoanSource: true,
};
const cases = [
  {
    name: 'categories',
    endpoint: 'getLibraryChargeEditorCategories',
    route: `${root}/editor/categories`,
    input: { academicYearId: yearId, page: 2, pageSize: 20, search: 'damage & repair' },
    query: { academicYearId: yearId, page: '2', pageSize: '20', search: 'damage & repair' },
    response: page([
      { id: 'category-id', academicYearId: yearId, name: 'Damage', amount: 100.75, isFixed: false },
    ]),
  },
  {
    name: 'member search',
    endpoint: 'searchLibraryChargeEditorMembers',
    route: `${root}/editor/members`,
    input: { academicYearId: yearId, page: 2, pageSize: 20, search: member.memberIdentifier },
    query: { academicYearId: yearId, page: '2', pageSize: '20', search: member.memberIdentifier },
    response: page([member]),
  },
  {
    name: 'exact member resolution',
    endpoint: 'resolveLibraryChargeEditorMember',
    route: `${root}/editor/member`,
    input: { academicYearId: yearId, identifier: member.memberIdentifier },
    query: { academicYearId: yearId, identifier: member.memberIdentifier },
    response: member,
  },
  {
    name: 'specific loan sources',
    endpoint: 'getLibraryChargeEditorLoanSources',
    route: `${root}/editor/loans`,
    input: { academicYearId: yearId, memberId, page: 2, pageSize: 20, search: 'પુસ્તક-૧' },
    query: { academicYearId: yearId, memberId, page: '2', pageSize: '20', search: 'પુસ્તક-૧' },
    response: page([
      {
        loanId: 'actual-loan-id',
        canonicalMemberId: memberId,
        role: 1,
        copyId: 'actual-copy-id',
        bookId: 'actual-catalogue-id',
        accessionNumber: 'પુસ્તક-૧',
        title: 'Recorded loan source',
        loanAcademicYearId: 'different-original-loan-year',
        status: 1,
        schoolIssueDate: '2026-11-17',
        schoolDueDate: '2026-11-24',
        issueDateProvenance: 1,
        dueDateProvenance: 1,
      },
    ]),
  },
  {
    name: 'existing assessment context',
    endpoint: 'getLibraryChargeEditorContext',
    route: `${root}/${chargeId}/editor`,
    input: { chargeId },
    query: {},
    response: {
      assessment: {
        id: chargeId,
        memberId,
        amount: 100.75,
        academicYearId: yearId,
        sourceVersion: opaqueVersion,
      },
      canAmend: true,
      requiresContextReview: false,
      amendmentBlockedReason: null,
    },
  },
];

it.each(cases)('uses the authenticated owning route and exact query for $name', async (spec) => {
  const endpoint = (
    LibraryChargeApi.endpoints as unknown as Record<
      string,
      {
        initiate(input: unknown): any;
      }
    >
  )[spec.endpoint];
  expect(
    endpoint,
    `The charge editor must expose ${spec.endpoint} under its own action.`
  ).toBeDefined();
  let actualQuery: Record<string, string> | undefined;
  let authorization: string | null | undefined;
  mswServer.use(
    http.get(spec.route, ({ request }) => {
      actualQuery = Object.fromEntries(new URL(request.url).searchParams);
      authorization = request.headers.get('authorization');
      return HttpResponse.json(spec.response);
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });

  const result = await store.dispatch(endpoint.initiate(spec.input));

  expect(actualQuery).toEqual(spec.query);
  expect(authorization).toBe('Bearer actual-shared-auth-pipeline');
  expect(result).toMatchObject({ data: spec.response });
});
