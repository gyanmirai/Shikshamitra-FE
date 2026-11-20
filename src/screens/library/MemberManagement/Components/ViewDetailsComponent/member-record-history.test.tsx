import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { fDate } from 'src/utils/format-time';
import { it, vi, expect } from 'vitest';
import { within, render, screen } from '@testing-library/react';

import IssuedBooks from './IssuedBooks';
import BorrowHistory from './BorrowHistory';
import ReservedBooks from './ReservedBooks';
import { memberRecord, recordMember, memberRecordWrapper } from './member-record-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function respond(path: string, record: object) {
  mswServer.use(
    http.get(`http://library.test/api/library/members/canonical-member/${path}`, () =>
      HttpResponse.json({
        items: [{ ...memberRecord, ...record }],
        totalCount: 1,
        currentPage: 1,
        pageSize: 20,
      })
    )
  );
}

it('shows the saved physical return date and loan state in borrowing history', async () => {
  respond('borrow-history', {
    storedStatus: 1,
    schoolReturnDate: '2026-11-25',
    returnDateProvenance: 1,
    returnedOn: '2001-01-20T18:30:00Z',
  });
  render(<BorrowHistory member={recordMember} />, memberRecordWrapper());
  const row = await screen.findByRole('row', { name: new RegExp(memberRecord.bookTitle) });
  expect(within(row).getByText(fDate('2026-11-25')!)).toBeInTheDocument();
  expect(within(row).getByText('Returned')).toBeInTheDocument();
});

it('uses the actual cancelled request state instead of inferring active or expired from a date', async () => {
  respond('reserved-books', { state: 3 });
  render(<ReservedBooks member={recordMember} />, memberRecordWrapper());
  const row = await screen.findByRole('row', { name: new RegExp(memberRecord.bookTitle) });
  expect(within(row).getByText('Cancelled')).toBeInTheDocument();
});

it('keeps a read-only accession candidate explicitly unconfirmed as a saved copy link', async () => {
  respond('borrowed-books', {
    copyId: null,
    copyLinkSource: 'LegacyAccessionCandidate',
    requiresCopyReconciliation: true,
  });
  render(<IssuedBooks member={recordMember} />, memberRecordWrapper());
  const row = await screen.findByRole('row', { name: new RegExp(memberRecord.bookTitle) });
  expect(within(row).getByText('Copy link needs review')).toBeInTheDocument();
  expect(within(row).getByText(memberRecord.accessionNo)).toBeInTheDocument();
});
