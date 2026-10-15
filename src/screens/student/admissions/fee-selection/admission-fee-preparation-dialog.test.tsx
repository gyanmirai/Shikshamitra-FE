import type { AssignmentHead } from 'src/redux/finance/studentFeeAssignment';

import { it, vi, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AdmissionFeePreparationDialog } from './admission-fee-preparation-dialog';

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ confirmPopup: { isChanges: false } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

const head: AssignmentHead = {
  feeHeadId: 'transport',
  feeHeadName: 'Transport',
  included: true,
  isOptional: true,
  isOneTime: false,
  configuredAmount: null,
  isVariable: true,
  effectiveAmount: null,
  amountBasis: 'Term coverage',
  obligation: 0,
  verification: 'Amount required',
};

it('does not prepare unpriced variable fees or silently substitute zero', async () => {
  const onSubmit = vi.fn();
  render(
    <AdmissionFeePreparationDialog
      applicantName="Kabir Shah"
      heads={[head]}
      busy={false}
      onClose={vi.fn()}
      onSubmit={onSubmit}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Continue to collection' }));
  await screen.findByText('Enter the total fee for this Fee Head.');
  expect(onSubmit).not.toHaveBeenCalled();
});

it('uses Finance decimal input and requires a reason for a zero amount', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(
    <AdmissionFeePreparationDialog
      applicantName="Kabir Shah"
      heads={[head]}
      busy={false}
      onClose={vi.fn()}
      onSubmit={onSubmit}
    />
  );
  fireEvent.change(screen.getByRole('textbox', { name: /Transport total for term coverage/ }), {
    target: { value: '0' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue to collection' }));
  await screen.findByText('Explain why this fee amount is zero.');
  expect(onSubmit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('textbox', { name: /Reason for zero Transport amount/ }), {
    target: { value: 'Not using transport this term' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue to collection' }));
  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith([
      { feeHeadId: 'transport', amount: 0, zeroAmountReason: 'Not using transport this term' },
    ])
  );
});

it('preserves entered amounts when Finance rejects preparation', async () => {
  const onSubmit = vi.fn().mockRejectedValue({
    data: { detail: 'Finance configuration changed. Refresh before preparing.' },
  });
  render(
    <AdmissionFeePreparationDialog
      applicantName="Kabir Shah"
      heads={[head]}
      busy={false}
      onClose={vi.fn()}
      onSubmit={onSubmit}
    />
  );
  fireEvent.change(screen.getByRole('textbox', { name: /Transport total for term coverage/ }), {
    target: { value: '2500.15' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue to collection' }));
  await screen.findByText('Finance configuration changed. Refresh before preparing.');
  expect(onSubmit).toHaveBeenCalledWith([
    { feeHeadId: 'transport', amount: 2500.15, zeroAmountReason: undefined },
  ]);
  expect(screen.getByRole('textbox', { name: /Transport total for term coverage/ })).toHaveValue(
    '₹ 2,500.15'
  );
});
