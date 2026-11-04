import type { ReactNode } from 'react';
import type { AssignmentHead } from 'src/redux/finance/studentFeeAssignment';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { screen, cleanup, waitFor, fireEvent, render as renderUi } from '@testing-library/react';

import { AdmissionFeePreparationDialog } from './admission-fee-preparation-dialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

const createStore = () =>
  configureStore({
    reducer: { confirmPopup, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
const stores: ReturnType<typeof createStore>[] = [];
function render(children: ReactNode) {
  const store = createStore();
  stores.push(store);
  return renderUi(<Provider store={store}>{children}</Provider>);
}
afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
});

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
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Collection' }));
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
  fireEvent.change(screen.getByRole('textbox', { name: /Transport Total for Term Coverage/ }), {
    target: { value: '0' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Collection' }));
  await screen.findByText('Explain why this fee amount is zero.');
  expect(onSubmit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('textbox', { name: /Reason for Zero Transport Amount/ }), {
    target: { value: 'Not using transport this term' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Collection' }));
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
  fireEvent.change(screen.getByRole('textbox', { name: /Transport Total for Term Coverage/ }), {
    target: { value: '2500.15' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue to Collection' }));
  await screen.findByText('Finance configuration changed. Refresh before preparing.');
  expect(onSubmit).toHaveBeenCalledWith([
    { feeHeadId: 'transport', amount: 2500.15, zeroAmountReason: undefined },
  ]);
  expect(screen.getByRole('textbox', { name: /Transport Total for Term Coverage/ })).toHaveValue(
    '₹ 2,500.15'
  );
});
