import dayjs from 'dayjs';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useReservationDraft } from './useReservationDraft';
import {
  reservationMember,
  reservationWrapper,
} from '../BookList/Components/BookView/reservation-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
const values = {
  memberId: reservationMember.id,
  memberScan: '',
  requestedDate: dayjs('2026-11-17'),
  requestExpiryDate: null,
};

it('submits exact school dates and retains the selected borrower and draft after a server rejection', async () => {
  const submitted: unknown[] = [];
  mswServer.use(
    http.post('http://library.test/api/library/reservations/preview', () =>
      HttpResponse.json({
        canonicalMemberId: reservationMember.id,
        academicYearId: 'year-id',
        requiresExplicitExpiry: false,
        canCreate: true,
        blockedReasons: [],
      })
    ),
    http.post('http://library.test/api/library/reservations', async ({ request }) => {
      submitted.push(await request.json());
      return HttpResponse.json({ detail: 'The request changed. Please review.' }, { status: 409 });
    })
  );
  const saved = vi.fn();
  const { result } = renderHook(
    () => useReservationDraft('book-id', 'year-id', true, saved),
    reservationWrapper()
  );
  await act(async () => {
    result.current.setSelected(reservationMember);
    await result.current.formik.setValues(values);
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(() => result.current.formik.submitForm());
  expect(submitted).toEqual([
    {
      bookId: 'book-id',
      academicYearId: 'year-id',
      memberId: reservationMember.id,
      requestedDate: '2026-11-17',
    },
  ]);
  expect(saved).not.toHaveBeenCalled();
  expect(result.current.error).toContain('The request changed');
  expect(result.current.formik.values.requestedDate?.format('YYYY-MM-DD')).toBe('2026-11-17');
  expect(result.current.selected?.id).toBe(reservationMember.id);
});

it('uses owning preview requiredness and invalidates readiness as soon as borrower selection is cleared', async () => {
  mswServer.use(
    http.post('http://library.test/api/library/reservations/preview', async ({ request }) => {
      const body = (await request.json()) as { requestExpiryDate?: string };
      return HttpResponse.json({
        canonicalMemberId: reservationMember.id,
        academicYearId: 'year-id',
        requiresExplicitExpiry: true,
        canCreate: Boolean(body.requestExpiryDate),
        blockedReasons: body.requestExpiryDate ? [] : ['Enter an explicit expiry.'],
      });
    })
  );
  const { result } = renderHook(
    () => useReservationDraft('book-id', 'year-id', true, vi.fn()),
    reservationWrapper()
  );
  await act(async () => {
    result.current.setSelected(reservationMember);
    await result.current.formik.setValues(values);
  });
  await waitFor(() =>
    expect(result.current.preview.currentData?.requiresExplicitExpiry).toBe(true)
  );
  expect(result.current.canSubmit).toBe(false);
  await act(async () => {
    await result.current.formik.setFieldValue('requestExpiryDate', dayjs('2026-11-25'));
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  await act(async () => {
    await result.current.formik.setFieldValue('memberId', '');
  });
  expect(result.current.canSubmit).toBe(false);
});
