import { it, vi, expect } from 'vitest';
import { fDate } from 'src/utils/format-time';
import { render, screen } from '@testing-library/react';

import { LoanTable } from './LoanTable';
import { loanReadRow } from './loan-read-fixture';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
function setup(row = loanReadRow) {
  render(
    <LoanTable
      id="civil-loan-read"
      rows={[row]}
      page={1}
      pageSize={20}
      totalCount={1}
      loading={false}
      refreshing={false}
      onRetry={vi.fn()}
      onPage={vi.fn()}
      emptyMessage="No loans"
    />,
    reservationWrapper(['Library.IssueReturn.View'])
  );
}
it('displays confirmed civil dates instead of different preserved raw timestamps', () => {
  setup();
  expect(
    screen.getByRole('cell', { name: fDate(loanReadRow.schoolIssueDate)! })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('cell', { name: fDate(loanReadRow.rawIssueDate)! })
  ).not.toBeInTheDocument();
});
it('labels an original raw date as unconfirmed rather than presenting it as a confirmed school date', () => {
  setup({
    ...loanReadRow,
    schoolIssueDate: null,
    schoolDueDate: null,
    issueDateProvenance: 0,
    dueDateProvenance: 0,
  });
  expect(screen.getAllByText('Unconfirmed').length).toBeGreaterThan(0);
});
it('shows unavailable overdue classification distinctly from the saved Issued state', () => {
  setup();
  expect(screen.getByText('Overdue not classified')).toBeInTheDocument();
});
it('retains column controls without offering a loaded-page export as the full record set', () => {
  setup();
  expect(screen.getByRole('button', { name: /Columns/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Export/ })).not.toBeInTheDocument();
});
