import dayjs from 'dayjs';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useReturnDraft } from './useReturnDraft';
import { makeCirculationTestWrapper } from './circulation-test-fixtures';
import { canonicalCopy, canonicalReturn } from './canonical-test-fixtures';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(
    http.get('http://library.test/api/library/circulation/lookups/return', () =>
      HttpResponse.json({
        ...canonicalReturn,
        loan: {
          ...canonicalReturn.loan,
          schoolIssueDate: '2026-11-01',
          schoolDueDate: '2026-11-18',
          issueDateProvenance: 1,
          dueDateProvenance: 1,
        },
      })
    )
  );
});
it('keeps a rejected return assessment as exact decimal input and uses the resolved member/copy', async () => {
  let body: unknown;
  mswServer.use(
    http.post(
      'http://library.test/api/library/circulation/loans/exact-loan-id/return',
      async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(
          { detail: 'The loan changed. Refresh and review it.' },
          { status: 409 }
        );
      }
    )
  );
  const onClose = vi.fn();
  const { result } = renderHook(
    () => useReturnDraft('SMSC:scan-token', true, onClose),
    makeCirculationTestWrapper()
  );
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.setValues({
      accessionNo: 'SMSC:scan-token',
      returnDate: dayjs('2026-11-16'),
      chargeCategory: 'category-id',
      amount: '12.25',
      fineDueDate: dayjs('2027-04-03'),
      copyStatus: 4,
      remarks: 'Cover damaged',
      chargeDate: dayjs('2026-11-16'),
      assessmentAcademicYearId: 'year-id',
      assessmentReason: 'Cover damaged',
    });
  });
  await act(async () => {
    await result.current.formik.submitForm();
  });
  expect(body).toMatchObject({
    copyId: canonicalCopy.copyId,
    copyStatus: 4,
    remarks: 'Cover damaged',
    assessments: [
      {
        chargeCategoryId: 'category-id',
        academicYearId: 'year-id',
        amount: 12.25,
        schoolChargeDate: '2026-11-16',
        schoolDueDate: '2027-04-03',
        reason: 'Cover damaged',
      },
    ],
  });
  expect(result.current.formik.values.amount).toBe('12.25');
  expect(result.current.formik.dirty).toBe(true);
  expect(result.current.error).toContain('Refresh and review');
  expect(onClose).not.toHaveBeenCalled();
});
it('hides the previous borrower immediately while another accession is being resolved', async () => {
  const { result } = renderHook(
    () => useReturnDraft('first-copy', true, vi.fn()),
    makeCirculationTestWrapper()
  );
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.setFieldValue('accessionNo', 'second-copy');
  });
  expect(result.current.lookup.currentData).toBeUndefined();
  expect(result.current.canSubmit).toBe(false);
});
