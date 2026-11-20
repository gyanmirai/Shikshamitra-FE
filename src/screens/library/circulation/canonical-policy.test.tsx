import dayjs from 'dayjs';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useIssueDraft } from './useIssueDraft';
import { lookupMember, makeCirculationTestWrapper } from './circulation-test-fixtures';
import { canonicalIssuePlan, canonicalLookupHandlers } from './canonical-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(...canonicalLookupHandlers);
});
const values = {
  accessionNumber: 'scan',
  memberId: 'selected-member-id',
  issueDate: dayjs('2026-11-16'),
  dueDate: null,
};
it('uses the server automatic due date without requiring or sending a manual override', async () => {
  let sent: unknown;
  mswServer.use(
    http.post('http://library.test/api/library/circulation/issues/preview', () =>
      HttpResponse.json({
        ...canonicalIssuePlan,
        policy: {
          ...canonicalIssuePlan.policy,
          isLegacyManualDate: false,
          terms: { dueDateMode: 1 },
        },
      })
    ),
    http.post('http://library.test/api/library/circulation/loans', async ({ request }) => {
      sent = await request.json();
      return HttpResponse.json({ loan: { id: 'loan-id' }, wasReplay: false, assessmentIds: [] });
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
  expect(result.current.plan.currentData?.dueDate).toBe('2026-11-30');
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(sent).toMatchObject({
    requestedDueDate: null,
    issueDate: '2026-11-16',
    revision: 'saved-plan-revision',
  });
});
it('requires an explicit staff academic year and sends the actual chosen year to preview', async () => {
  const years: unknown[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/circulation/members/resolve', () =>
      HttpResponse.json({
        ...lookupMember,
        role: 1,
        academicYearId: null,
        isEligibleForIssue: true,
      })
    ),
    http.post('http://library.test/api/library/circulation/issues/preview', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      years.push(body.academicYearId);
      return HttpResponse.json({
        ...canonicalIssuePlan,
        ...body,
        role: 1,
        dueDate: body.requestedDueDate,
        canIssue: Boolean(body.requestedDueDate),
      });
    })
  );
  const { result } = renderHook(
    () => useIssueDraft(null, true, vi.fn()),
    makeCirculationTestWrapper()
  );
  await act(async () => {
    await result.current.formik.setValues({ ...values, dueDate: dayjs('2026-11-30') });
  });
  await waitFor(() => expect(result.current.member.currentData?.role).toBe(1));
  expect(result.current.canSubmit).toBe(false);
  expect(years).toEqual([]);
  await act(async () => {
    await result.current.formik.setFieldValue('academicYearId', 'year-id');
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  expect([...new Set(years)]).toEqual(['year-id']);
});
