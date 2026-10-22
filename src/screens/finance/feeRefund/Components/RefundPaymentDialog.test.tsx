import { Provider } from 'react-redux';
import { it, vi, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import RefundPaymentDialog from './RefundPaymentDialog';

import type { IStudentFeeData } from '../type';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const refund = {
  name: 'Test Student',
  _refundRequestId: 'refund-1',
  _approvedAmount: 200,
  _refundMethod: 'Cash',
  _allowedPayoutMethods: ['Cash', 'BankTransfer'],
} as IStudentFeeData;

function setup(overrides: Partial<IStudentFeeData> = {}, onSubmit = vi.fn(async () => {})) {
  const onClose = vi.fn();
  render(
    <Provider store={configureStore({ reducer: { confirmPopup } })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <RefundPaymentDialog
          refund={{ ...refund, ...overrides }}
          bankAccounts={[{ id: 'bank-1', label: 'School Bank' }]}
          bankAccountsLoading={false}
          loading={false}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </ThemeProvider>
    </Provider>
  );
  return { onClose, onSubmit };
}

it('groups payment details, formats the approved amount, and validates cash evidence', async () => {
  const { onSubmit } = setup();
  expect(screen.getByRole('dialog', { name: 'Record Refund Payment' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Payment Details information' })).toBeTruthy();
  expect(screen.getByText('Test Student')).toBeTruthy();
  expect(screen.getByText('₹ 200')).toBeTruthy();
  expect(screen.getByRole('textbox', { name: 'Payout method' })).toBeDisabled();
  expect(screen.queryByLabelText(/Source school bank account/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Record Payment' }));
  const evidence = screen.getByRole('textbox', { name: /Signed handover receipt/ });
  await waitFor(() => expect(evidence).toHaveFocus());
  expect(screen.getByText('Payment evidence reference is required')).toBeTruthy();
  expect(onSubmit).not.toHaveBeenCalled();
  fireEvent.change(evidence, { target: { value: ' receipt-123 ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Record Payment' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  expect(onSubmit).toHaveBeenCalledWith({
    method: 'Cash',
    bankAccountId: '',
    externalReference: '',
    evidenceReference: ' receipt-123 ',
  });
});

it('requires transaction evidence for non-cash payments and keeps the approved bank fixed', async () => {
  const { onSubmit } = setup({ _refundMethod: 'BankTransfer', _payingBankAccountId: 'bank-1' });
  expect(screen.getByRole('textbox', { name: 'Payout method' })).toHaveValue(
    'Bank Transfer (NEFT/RTGS/IMPS)'
  );
  expect(screen.getByRole('combobox', { name: 'Source school bank account' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Record Payment' }));
  await screen.findByText('Payment reference is required');
  expect(onSubmit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Bank UTR / transaction reference' }), {
    target: { value: 'UTR-123' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Payment evidence reference' }), {
    target: { value: 'bank-proof' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Record Payment' }));
  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith({
      method: 'Bank Transfer (NEFT/RTGS/IMPS)',
      bankAccountId: 'bank-1',
      externalReference: 'UTR-123',
      evidenceReference: 'bank-proof',
    })
  );
});

it('locks fields, submission, and dismissal while a payment is being recorded', async () => {
  let resolve!: () => void;
  const onSubmit = vi.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      })
  );
  const { onClose } = setup({}, onSubmit);
  const evidence = screen.getByRole('textbox', { name: /Signed handover receipt/ });
  fireEvent.change(evidence, { target: { value: 'receipt-123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Record Payment' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  expect(evidence).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('status', { name: 'Recording payment…' })).toBeTruthy();
  fireEvent.submit(evidence.closest('form')!);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  expect(evidence).toBeDisabled();
  expect(onClose).not.toHaveBeenCalled();
  resolve();
  await waitFor(() => expect(evidence).not.toBeDisabled());
});

it('retains entered evidence after a failed request', async () => {
  setup(
    {},
    vi.fn(async () => {
      throw new Error('Payment could not be recorded.');
    })
  );
  const evidence = screen.getByRole('textbox', { name: /Signed handover receipt/ });
  fireEvent.change(evidence, { target: { value: 'receipt-123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Record Payment' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Payment could not be recorded.');
  expect(evidence).toHaveValue('receipt-123');
  expect(evidence).not.toBeDisabled();
});

it('requires explicit discard before closing edited payment evidence', async () => {
  const { onClose, onSubmit } = setup();
  const evidence = screen.getByRole('textbox', { name: /Signed handover receipt/ });
  fireEvent.change(evidence, { target: { value: 'receipt-123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep Editing' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard Changes' }));
  expect(onClose).toHaveBeenCalledOnce();
  expect(onSubmit).not.toHaveBeenCalled();
});
