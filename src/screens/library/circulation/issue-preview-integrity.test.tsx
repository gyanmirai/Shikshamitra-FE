import dayjs from 'dayjs';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useIssueDraft } from './useIssueDraft';
import { makeCirculationTestWrapper } from './circulation-test-fixtures';
import { canonicalIssuePlan, canonicalLookupHandlers } from './canonical-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
it('does not submit a preview whose exact borrower differs from the current resolved selection', async () => {
  clearCachedAuthSession();
  mswServer.use(...canonicalLookupHandlers);
  mswServer.use(
    http.post('http://library.test/api/library/circulation/issues/preview', () =>
      HttpResponse.json({ ...canonicalIssuePlan, memberId: 'another-person' })
    )
  );
  const { result } = renderHook(
    () => useIssueDraft(null, true, vi.fn()),
    makeCirculationTestWrapper()
  );
  await act(async () => {
    await result.current.formik.setValues({
      accessionNumber: 'scan',
      memberId: 'selected-member-id',
      issueDate: dayjs('2026-11-16'),
      dueDate: dayjs('2026-11-30'),
    });
  });
  await waitFor(() => expect(result.current.plan.isSuccess).toBe(true));
  expect(result.current.plan.data?.memberId).toBe('another-person');
  expect(result.current.canSubmit).toBe(false);
});
