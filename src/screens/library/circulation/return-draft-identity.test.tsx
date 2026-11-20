import dayjs from 'dayjs';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useReturnDraft } from './useReturnDraft';
import { canonicalReturn } from './canonical-test-fixtures';
import { makeCirculationTestWrapper } from './circulation-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
it('does not rebind an existing assessment draft to a later loan when the unchanged scan is reloaded', async () => {
  let loanId = canonicalReturn.loan.id;
  mswServer.use(
    http.get('http://library.test/api/library/circulation/lookups/return', () =>
      HttpResponse.json({
        ...canonicalReturn,
        loan: { ...canonicalReturn.loan, id: loanId },
      })
    )
  );
  const { result } = renderHook(
    () => useReturnDraft('scan', true, vi.fn()),
    makeCirculationTestWrapper()
  );
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.setValues({
      ...result.current.formik.values,
      returnDate: dayjs('2026-11-17'),
      chargeCategory: 'category-id',
      amount: '12.25',
      chargeDate: dayjs('2026-11-17'),
      fineDueDate: dayjs('2026-11-30'),
      assessmentAcademicYearId: 'year-id',
      assessmentReason: 'Verified cover damage',
      unknownOriginalDatesReason: 'Physical copy verified; original dates remain unconfirmed.',
    });
  });
  loanId = 'later-loan-for-same-copy';
  act(() => result.current.review());
  await waitFor(() => expect(result.current.lookup.currentData?.loan.id).toBe(loanId));
  expect(result.current.formik.values.amount).toBe('12.25');
  expect(result.current.formik.dirty).toBe(true);
  expect(result.current.canSubmit).toBe(false);
});
