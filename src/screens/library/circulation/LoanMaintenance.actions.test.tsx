import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { LoanTable } from 'src/screens/library/circulation/LoanTable';
import { loanReadRow } from 'src/screens/library/circulation/loan-read-fixture';
import { reservationWrapper } from 'src/screens/library/BookList/Components/BookView/reservation-test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function setup(grants: string[]) {
  const onRenew = vi.fn();
  const onReviewDates = vi.fn();
  render(
    <LoanTable
      id="loan-maintenance-actions"
      rows={[loanReadRow]}
      page={1}
      pageSize={20}
      totalCount={1}
      loading={false}
      refreshing={false}
      onRetry={vi.fn()}
      onPage={vi.fn()}
      onRenew={onRenew}
      onReviewDates={onReviewDates}
      emptyMessage="No loans"
    />,
    reservationWrapper(['Library.IssueReturn.View', ...grants])
  );
  expect(screen.getByText(loanReadRow.accessionNo)).toBeVisible();
  return { onRenew, onReviewDates };
}

it('opens renewal with the exact selected saved loan and copy under Renew only', async () => {
  const actions = setup(['Library.IssueReturn.Renew']);
  await userEvent.click(screen.getByRole('button', { name: /^Renew / }));
  expect(actions.onRenew).toHaveBeenCalledOnce();
  expect(actions.onRenew).toHaveBeenCalledWith(
    expect.objectContaining({
      id: loanReadRow.id,
      transactionId: loanReadRow.transactionId,
      copyId: loanReadRow.copyId,
    })
  );
  expect(screen.queryByRole('button', { name: /^Review school dates/ })).toBeNull();
  expect(screen.queryByRole('button', { name: /^Return / })).toBeNull();
});

it('keeps date review independent of Renew and Return rather than inheriting View access', async () => {
  const actions = setup(['Library.IssueReturn.ReviewDates']);
  await userEvent.click(screen.getByRole('button', { name: /^Review school dates/ }));
  expect(actions.onReviewDates).toHaveBeenCalledWith(
    expect.objectContaining({
      id: loanReadRow.id,
      copyId: loanReadRow.copyId,
    })
  );
  expect(screen.queryByRole('button', { name: /^Renew / })).toBeNull();
  expect(screen.queryByRole('button', { name: /^Return / })).toBeNull();
});
