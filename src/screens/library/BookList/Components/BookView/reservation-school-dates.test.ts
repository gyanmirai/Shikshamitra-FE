import dayjs from 'dayjs';
import { it, expect } from 'vitest';

import { reservationSchema, buildReservationPayload } from '../../../reservations/reservation-form';

it('keeps entered school dates as civil dates and uses the canonical optional expiry field', () => {
  expect(
    buildReservationPayload(
      {
        requestedDate: dayjs('2026-11-17T00:00:00'),
        requestExpiryDate: dayjs('2026-11-25T00:00:00'),
      },
      'canonical-member'
    )
  ).toEqual({
    memberId: 'canonical-member',
    requestedDate: '2026-11-17',
    requestExpiryDate: '2026-11-25',
  });
});

it('allows an explicitly selected borrower to request a book without a request expiry', async () => {
  await expect(
    reservationSchema(false).validate({
      memberId: 'canonical-member',
      requestedDate: dayjs('2026-11-17'),
      requestExpiryDate: null,
    })
  ).resolves.toBeDefined();
});

it('rejects an unresolved borrower even when both entered dates are valid', async () => {
  await expect(
    reservationSchema(false).validate({
      memberId: '',
      requestedDate: dayjs('2026-11-17'),
      reserveDueDate: dayjs('2026-11-25'),
    })
  ).rejects.toThrow(/member|borrower/i);
});
