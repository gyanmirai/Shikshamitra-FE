import dayjs from 'dayjs';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useReturnDraft } from './useReturnDraft';
import { makeCirculationTestWrapper } from './circulation-test-fixtures';
import { canonicalCopy, canonicalLookupHandlers } from './canonical-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(...canonicalLookupHandlers);
});
it('returns the exact stored loan using its frozen revision and an explicit unknown-date reason', async () => {
  let sent: { path: string; body: unknown } | undefined;
  const reject = async ({ request }: { request: Request }) => {
    sent = { path: new URL(request.url).pathname, body: await request.json() };
    return HttpResponse.json({ detail: 'The loan changed. Reload and review.' }, { status: 409 });
  };
  mswServer.use(
    http.post('http://library.test/api/library/returns', reject),
    http.post('http://library.test/api/library/circulation/loans/exact-loan-id/return', reject)
  );
  const onClose = vi.fn();
  const { result } = renderHook(
    () => useReturnDraft('SMSC:scan-token', true, onClose),
    makeCirculationTestWrapper()
  );
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.setFieldValue('returnDate', dayjs('2026-11-16'));
    await result.current.formik.setFieldValue(
      'unknownOriginalDatesReason',
      'Original dates were not confirmed; physical return verified.'
    );
  });
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(sent).toMatchObject({
    path: '/api/library/circulation/loans/exact-loan-id/return',
    body: {
      copyId: canonicalCopy.copyId,
      revision: 'saved-loan-revision',
      schoolReturnDate: '2026-11-16',
      unknownOriginalDatesReason: 'Original dates were not confirmed; physical return verified.',
      assessments: [],
    },
  });
  expect(result.current.formik.values.returnDate?.format('YYYY-MM-DD')).toBe('2026-11-16');
  expect(result.current.formik.dirty).toBe(true);
  expect(result.current.error).toContain('Reload and review');
  expect(onClose).not.toHaveBeenCalled();
});
