import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import FeeWaiverToggle from './FeeWaiverToggle';

const mocks = vi.hoisted(() => ({ apply: vi.fn(), success: vi.fn(), error: vi.fn() }));
vi.mock('src/redux/feeCollection/feeCollection', () => ({
  useApplyFeeWaiverMutation: () => [mocks.apply, { isLoading: false }],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: mocks.success, error: mocks.error },
}));

const theme = createTheme(defaultSettings);
function mount(props = {}, permissions = ['Finance.Fees.FeeCollections.ApplyWaiver']) {
  const store = configureStore({
    reducer: {
      confirmPopup,
      auth: () => ({
        permissionsInitialized: true,
        loading: false,
        permissions: permissions.map((name) => ({ name, isGranted: true })),
      }),
    },
  });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <FeeWaiverToggle
          sourceType="Charge"
          sourceId="charge-one"
          remainingAmount={700}
          {...props}
        />
      </ThemeProvider>
    </Provider>
  );
}
const open = () => fireEvent.click(screen.getByRole('switch'));
const reason = () => screen.getByRole('textbox', { name: /Reason/ });
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Apply waiver' }));

describe('Fee Collection full-balance waiver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.apply.mockImplementation(() => ({
      unwrap: () => Promise.resolve({ waivedAmount: 700 }),
    }));
  });

  it('requires a reason inline and identifies the charge before applying', async () => {
    mount({ sourceName: 'Transport damage' });
    open();
    expect(screen.getByRole('dialog', { name: 'Waive Charge' })).toBeVisible();
    expect(screen.getByText('Transport damage')).toBeVisible();
    expect(screen.getByText(/non-cash reduction/i)).toBeVisible();
    fireEvent.change(reason(), { target: { value: '   ' } });
    submit();
    expect(await screen.findByText('Enter a waiver reason.')).toBeVisible();
    expect(mocks.apply).not.toHaveBeenCalled();
  });

  it('submits the trimmed reason and source once without a monetary payload', async () => {
    const onApplied = vi.fn();
    mount({ onApplied });
    open();
    fireEvent.change(reason(), { target: { value: '  Approved by management  ' } });
    submit();
    await waitFor(() => expect(onApplied).toHaveBeenCalledOnce());
    expect(mocks.apply).toHaveBeenCalledOnce();
    expect(mocks.apply.mock.calls[0][0]).toEqual({
      sourceType: 'Charge',
      sourceId: 'charge-one',
      reason: 'Approved by management',
      idempotencyKey: expect.any(String),
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('protects the reason on cancellation and discards only when asked', async () => {
    mount();
    open();
    fireEvent.change(reason(), { target: { value: 'Management decision' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    const discard = await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
    fireEvent.click(within(discard).getByRole('button', { name: 'Keep editing' }));
    expect(reason()).toHaveValue('Management decision');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.apply).not.toHaveBeenCalled();
    open();
    expect(reason()).toHaveValue('');
  });

  it('keeps the reason and idempotency key after a failed request', async () => {
    mocks.apply.mockImplementationOnce(() => ({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Balance changed. Retry.'), {
            status: 400,
            data: { detail: 'Balance changed. Retry.' },
          })
        ),
    }));
    mount();
    open();
    fireEvent.change(reason(), { target: { value: 'Management decision' } });
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Balance changed. Retry.');
    expect(reason()).toHaveValue('Management decision');
    submit();
    await waitFor(() => expect(mocks.apply).toHaveBeenCalledTimes(2));
    expect(mocks.apply.mock.calls[1][0].idempotencyKey).toBe(
      mocks.apply.mock.calls[0][0].idempotencyKey
    );
  });

  it('locks inputs and dismissal while saving and prevents a duplicate submit', async () => {
    let finish!: (result: { waivedAmount: number }) => void;
    mocks.apply.mockImplementation(() => ({
      unwrap: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    }));
    mount();
    open();
    fireEvent.change(reason(), { target: { value: 'Management decision' } });
    submit();
    await waitFor(() => expect(mocks.apply).toHaveBeenCalledOnce());
    expect(reason()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    fireEvent.submit(reason().closest('form')!);
    expect(mocks.apply).toHaveBeenCalledOnce();
    finish({ waivedAmount: 700 });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('retries an unconfirmed result with exactly the same reason and request identity', async () => {
    mocks.apply.mockImplementationOnce(() => ({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Connection interrupted'), {
            status: 'FETCH_ERROR',
            error: 'Connection interrupted',
          })
        ),
    }));
    mount();
    open();
    fireEvent.change(reason(), { target: { value: 'Management decision' } });
    submit();
    const retry = await screen.findByRole('button', { name: 'Retry waiver' });
    expect(reason()).toBeDisabled();
    expect(screen.getByText(/The result could not be confirmed/)).toBeVisible();
    fireEvent.click(retry);
    await waitFor(() => expect(mocks.apply).toHaveBeenCalledTimes(2));
    expect(mocks.apply.mock.calls[1][0]).toEqual(mocks.apply.mock.calls[0][0]);
  });

  it('rejects a reason longer than the server limit', async () => {
    mount();
    open();
    fireEvent.change(reason(), { target: { value: 'a'.repeat(501) } });
    submit();
    expect(await screen.findByText('Use 500 characters or fewer.')).toBeVisible();
    expect(mocks.apply).not.toHaveBeenCalled();
  });

  it('explains an unconfirmed result on close and keeps the retry identity when reopened', async () => {
    mocks.apply.mockImplementationOnce(() => ({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Connection interrupted'), {
            status: 'FETCH_ERROR',
            error: 'Connection interrupted',
          })
        ),
    }));
    mount();
    open();
    fireEvent.change(reason(), { target: { value: 'Management decision' } });
    submit();
    await screen.findByRole('button', { name: 'Retry waiver' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    const confirmation = await screen.findByRole('dialog', { name: 'Leave Unconfirmed Waiver?' });
    expect(confirmation).toHaveTextContent('may already have been applied');
    expect(confirmation).toHaveTextContent('does not undo');
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Close and check later' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    open();
    expect(reason()).toHaveValue('Management decision');
    expect(reason()).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry waiver' }));
    await waitFor(() => expect(mocks.apply).toHaveBeenCalledTimes(2));
    expect(mocks.apply.mock.calls[1][0]).toEqual(mocks.apply.mock.calls[0][0]);
  });

  it.each([0, -10, Number.NaN])(
    'hides the action for a non-payable balance %s',
    (remainingAmount) => {
      mount({ remainingAmount });
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    }
  );

  it('hides explicitly ineligible sources', () => {
    mount({ canWaive: false });
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('requires the exact ApplyWaiver grant rather than general collection access', () => {
    mount({}, ['Finance.Fees.FeeCollections.Add', 'Finance.Fees.FeeCollections.View']);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('uses the late-fee source without changing principal', async () => {
    mount({ sourceType: 'LateFee', sourceId: 'due-one' });
    open();
    expect(screen.getByRole('dialog', { name: 'Waive Late Fee' })).toBeVisible();
    fireEvent.change(reason(), { target: { value: 'Late fee excused' } });
    submit();
    await waitFor(() => expect(mocks.apply).toHaveBeenCalledOnce());
    expect(mocks.apply.mock.calls[0][0]).toMatchObject({
      sourceType: 'LateFee',
      sourceId: 'due-one',
    });
  });
});
