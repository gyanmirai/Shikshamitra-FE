import dayjs from 'dayjs';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useReservationReviewDraft } from './useReservationReviewDraft';
import {
  reservationItem,
  reservationMember,
  reservationWrapper,
} from '../BookList/Components/BookView/reservation-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));

it('reviews its own request with separate readiness and a frozen revision while preserving original timestamps', async () => {
  const snapshot = {
    ...reservationItem,
    state: 5,
    canReview: true,
    requestedDate: null,
    requestExpiryDate: null,
    requestedDateProvenance: 0,
    requestExpiryDateProvenance: 0,
    legacyRequestedDate: '2026-11-16T18:30:00Z',
  };
  let sent: unknown;
  const previewBodies: unknown[] = [];
  mswServer.use(
    http.post(
      'http://library.test/api/library/reservations/reservation-id/review-preview',
      async ({ request }) => {
        previewBodies.push(await request.json());
        return HttpResponse.json({
          reservationId: snapshot.id,
          canonicalMemberId: reservationMember.id,
          academicYearId: 'year-id',
          requiresExplicitExpiry: false,
          canReview: true,
          canCreate: false,
          blockedReasons: [],
        });
      }
    ),
    http.post(
      'http://library.test/api/library/reservations/reservation-id/review',
      async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json({ detail: 'The stored request has changed.' }, { status: 409 });
      }
    )
  );
  const close = vi.fn();
  const harness = reservationWrapper();
  const { result } = renderHook(
    () => useReservationReviewDraft(snapshot, 'year-id', true, close),
    harness
  );
  expect(result.current.formik.values.requestedDate).toBeNull();
  await act(async () => {
    result.current.setSelected(reservationMember);
    await result.current.formik.setValues({
      memberId: reservationMember.id,
      memberScan: '',
      requestedDate: dayjs('2026-11-17'),
      requestExpiryDate: null,
      reason: 'Confirmed the member and school register',
    });
  });
  await waitFor(() => expect(result.current.canSubmit).toBe(true));
  expect(previewBodies).toContainEqual({
    academicYearId: 'year-id',
    memberId: reservationMember.id,
    requestedDate: '2026-11-17',
    revision: 'opened-revision',
  });
  await act(() => result.current.formik.submitForm());
  expect(sent).toEqual({
    academicYearId: 'year-id',
    memberId: reservationMember.id,
    requestedDate: '2026-11-17',
    reason: 'Confirmed the member and school register',
    revision: 'opened-revision',
  });
  expect(result.current.error).toContain('The stored request has changed');
  expect(result.current.formik.values.reason).toBe('Confirmed the member and school register');
  expect(snapshot.legacyRequestedDate).toBe('2026-11-16T18:30:00Z');
  expect(close).not.toHaveBeenCalled();
});
