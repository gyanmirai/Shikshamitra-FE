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

it.each([
  { path: 'borrowed-books', Panel: IssuedBooks },
  { path: 'borrow-history', Panel: BorrowHistory },
  { path: 'reserved-books', Panel: ReservedBooks },
])(
  'renders the paginated $path response and its confirmed school date',
  async ({ path, Panel }) => {
    mswServer.use(
      http.get(`http://library.test/api/library/members/canonical-member/${path}`, () =>
        HttpResponse.json({
          items: [memberRecord],
          totalCount: 21,
          totalPages: 2,
          currentPage: 1,
          pageSize: 20,
        })
      )
    );
    render(<Panel member={recordMember} />, memberRecordWrapper());
    const row = await screen.findByRole('row', { name: new RegExp(memberRecord.bookTitle) });
    expect(within(row).getByText(memberRecord.bookTitle)).toBeInTheDocument();
    expect(
      within(row).getByRole('cell', { name: fDate(memberRecord.schoolIssueDate)! })
    ).toBeInTheDocument();
    expect(
      within(row).queryByRole('cell', { name: fDate(memberRecord.issuedOn)! })
    ).not.toBeInTheDocument();
  }
);
