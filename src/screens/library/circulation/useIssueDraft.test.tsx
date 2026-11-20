import dayjs from 'dayjs';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useIssueDraft } from './useIssueDraft';
import { canonicalCopy, canonicalLookupHandlers } from './canonical-test-fixtures';
import { lookupMember, makeCirculationTestWrapper } from './circulation-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(...canonicalLookupHandlers);
});
const draft = {
  accessionNumber: 'SMSC:scan-token',
  memberId: 'selected-member-id',
  issueDate: dayjs('2026-11-16'),
  dueDate: dayjs('2026-11-30'),
};
function setup() {
  const onClose = vi.fn();
  return {
    onClose,
    ...renderHook(() => useIssueDraft(null, true, onClose), makeCirculationTestWrapper()),
  };
}
it('uses resolved canonical identifiers and retains the entered issue draft after rejection', async () => {
  let body: unknown;
  mswServer.use(
    http.post('http://library.test/api/library/circulation/loans', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ detail: 'Borrowing limit reached.' }, { status: 409 });
    })
  );
  const { result, onClose } = setup();
  await act(async () => {
    await result.current.formik.setValues(draft);
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(body).toMatchObject({ copyId: canonicalCopy.copyId, memberId: lookupMember.id });
  expect(result.current.formik.values.accessionNumber).toBe(draft.accessionNumber);
  expect(result.current.formik.dirty).toBe(true);
  expect(result.current.error).toContain('Borrowing limit reached');
  expect(onClose).not.toHaveBeenCalled();
});
it('disables the previous resolved copy immediately when a different scan is entered', async () => {
  const { result } = setup();
  await act(async () => {
    await result.current.formik.setValues(draft);
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.setFieldValue('accessionNumber', 'another-copy');
  });
  expect(result.current.book.currentData).toBeUndefined();
  expect(result.current.canSubmit).toBe(false);
  expect(result.current.formik.values.memberId).toBe(draft.memberId);
});
it('prevents two concurrent submissions from issuing twice', async () => {
  let writes = 0;
  mswServer.use(
    http.post('http://library.test/api/library/circulation/loans', async () => {
      writes += 1;
      await delay(30);
      return HttpResponse.json({ id: 'loan-id' });
    })
  );
  const { result, onClose } = setup();
  await act(async () => {
    await result.current.formik.setValues(draft);
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await Promise.all([result.current.formik.submitForm(), result.current.formik.submitForm()]);
  });
  expect(writes).toBe(1);
  expect(onClose).toHaveBeenCalledOnce();
});
