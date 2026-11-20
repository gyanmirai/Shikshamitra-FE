import dayjs from 'dayjs';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useIssueDraft } from './useIssueDraft';
import { canonicalLookupHandlers } from './canonical-test-fixtures';
import { lookupMember, makeCirculationTestWrapper } from './circulation-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

const borrower = {
  ...lookupMember,
  role: 0,
  academicYearId: 'current-year',
  isEligibleForIssue: true,
  statistics: { currentIssue: 1, reservedBooks: 0, overdueReturnBooks: 0 },
};
const values = {
  accessionNumber: 'saved-copy',
  memberId: 'selected-member-id',
  issueDate: dayjs('2026-11-17'),
  dueDate: dayjs('2026-12-01'),
};
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(
    ...canonicalLookupHandlers,
    http.get('http://library.test/api/library/members/:id', async ({ params }) => {
      if (params.id === 'NEXT') await delay(60);
      return HttpResponse.json(lookupMember);
    })
  );
});

it('resolves a scanned printed identifier with the circulation endpoint and submits the canonical person', async () => {
  const resolved: string[] = [];
  let submitted: unknown;
  mswServer.use(
    http.get('http://library.test/api/library/circulation/members/resolve', ({ request }) => {
      resolved.push(new URL(request.url).searchParams.get('identifier') || '');
      return HttpResponse.json(borrower);
    }),
    http.post('http://library.test/api/library/circulation/loans', async ({ request }) => {
      submitted = await request.json();
      return HttpResponse.json({ id: 'loan-id' });
    })
  );
  const { result } = renderHook(
    () => useIssueDraft(null, true, vi.fn()),
    makeCirculationTestWrapper()
  );
  const scanned = { ...values, memberId: 'M/001#?' };
  await act(async () => {
    await result.current.formik.setValues(scanned);
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect([...new Set(resolved)]).toEqual([scanned.memberId]);
  expect(submitted).toMatchObject({ memberId: borrower.id });
});

it('shows the server eligibility reason and prevents issuing to an inactive borrower', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/circulation/members/resolve', () =>
      HttpResponse.json({
        ...borrower,
        isEligibleForIssue: false,
        ineligibilityReason: 'Library membership is not active.',
      })
    )
  );
  const { result } = renderHook(
    () => useIssueDraft(null, true, vi.fn()),
    makeCirculationTestWrapper()
  );
  await act(async () => {
    await result.current.formik.setValues(values);
  });
  await waitFor(() => expect(result.current.member.currentData).toBeDefined());
  expect(result.current.member.currentData).toMatchObject({
    isEligibleForIssue: false,
    ineligibilityReason: 'Library membership is not active.',
  });
  expect(result.current.canSubmit).toBe(false);
});

it('clears the prior resolved borrower immediately when the next card is scanned', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/circulation/members/resolve', async ({ request }) => {
      if (new URL(request.url).searchParams.get('identifier') === 'NEXT') await delay(60);
      return HttpResponse.json(borrower);
    })
  );
  const { result } = renderHook(
    () => useIssueDraft(null, true, vi.fn()),
    makeCirculationTestWrapper()
  );
  await act(async () => {
    await result.current.formik.setValues(values);
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.setFieldValue('memberId', 'NEXT');
  });
  expect(result.current.member.currentData).toBeUndefined();
  expect(result.current.canSubmit).toBe(false);
});
