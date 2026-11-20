import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ReservationDetails } from './ReservationDetails';
import {
  reservationItem,
  reservationWrapper,
} from '../BookList/Components/BookView/reservation-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('distinguishes the exact allocated copy and pickup date from request expiry', () => {
  render(<ReservationDetails item={reservationItem} />, reservationWrapper());
  expect(screen.getByText('Accession: વાંચન/42#?')).toBeInTheDocument();
  expect(screen.getByText('Pickup deadline: 20-11-2026')).toBeInTheDocument();
  expect(screen.getByText('Request expiry: 30-11-2026')).toBeInTheDocument();
  expect(screen.getByText('School timezone: Asia/Kolkata')).toBeInTheDocument();
});

it('keeps original legacy timestamp evidence unconfirmed instead of inventing school dates or allocation', () => {
  render(
    <ReservationDetails
      item={{
        ...reservationItem,
        state: 5,
        requiresReview: true,
        reviewReason: 'Confirm original borrower and dates.',
        hold: null,
        requestedDate: null,
        requestExpiryDate: null,
        requestedDateProvenance: 0,
        requestExpiryDateProvenance: 0,
        legacyRequestedDate: '2026-11-16T18:30:00Z',
        legacyReserveDueDate: '2026-11-24T18:30:00Z',
      }}
    />,
    reservationWrapper()
  );
  expect(screen.getByText(/needs review before allocation/)).toBeInTheDocument();
  expect(screen.getByText('Requested date: Unconfirmed')).toBeInTheDocument();
  expect(
    screen.getByText('Original requested timestamp: 2026-11-16T18:30:00Z')
  ).toBeInTheDocument();
  expect(screen.getByText('No copy has been allocated to this request.')).toBeInTheDocument();
  expect(screen.queryByText('17-11-2026')).not.toBeInTheDocument();
});
