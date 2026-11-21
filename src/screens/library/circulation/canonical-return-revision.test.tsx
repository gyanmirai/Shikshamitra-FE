import dayjs from 'dayjs';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { libraryModuleType } from 'src/redux/tagTypes';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useReturnDraft } from './useReturnDraft';
import { canonicalReturn } from './canonical-test-fixtures';
import { makeCirculationTestWrapper } from './circulation-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
it('freezes a dirty return revision through background refresh and only replaces it after explicit review', async () => {
  clearCachedAuthSession();
  let revision = 'opened-revision';
  const sent: Record<string, unknown>[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/circulation/lookups/return', () =>
      HttpResponse.json({ ...canonicalReturn, loan: { ...canonicalReturn.loan, revision } })
    ),
    http.post(
      'http://library.test/api/library/circulation/loans/exact-loan-id/return',
      async ({ request }) => {
        sent.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ detail: 'Review changed loan.' }, { status: 409 });
      }
    )
  );
  const fixture = makeCirculationTestWrapper();
  const { result } = renderHook(() => useReturnDraft('scan', true, vi.fn()), fixture);
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  expect(result.current.formik.values.returnDate).toBeNull();
  await act(async () => {
    await result.current.formik.setValues({
      ...result.current.formik.values,
      returnDate: dayjs('2026-11-17'),
      remarks: 'Return desk note',
      unknownOriginalDatesReason: 'Physical copy verified; original dates retained as unconfirmed.',
    });
  });
  revision = 'refreshed-revision';
  act(() => {
    fixture.store.dispatch(api.util.invalidateTags([libraryModuleType.bookIssue]));
  });
  await waitFor(() => expect(result.current.lookup.changed).toBe(true));
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(sent[0]).toMatchObject({ revision: 'opened-revision', remarks: 'Return desk note' });
  expect(result.current.formik.dirty).toBe(true);
  act(() => result.current.review());
  await waitFor(() =>
    expect(result.current.lookup.currentData?.loan.revision).toBe('refreshed-revision')
  );
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(sent[1]).toMatchObject({ revision: 'refreshed-revision', remarks: 'Return desk note' });
  expect(sent[1].idempotencyKey).not.toBe(sent[0].idempotencyKey);
});
