import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import confirmPopupReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import RefundPolicyCloneDialog from './RefundPolicyCloneDialog';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

const { clone, success } = vi.hoisted(() => ({ clone: vi.fn(), success: vi.fn() }));

vi.mock('src/redux/finance/refundPolicy', () => ({
  useCloneRefundPolicyMutation: () => [clone, { isLoading: false }],
}));

vi.mock('src/layouts/components/global-academic-search/use-academic-options', () => ({
  useAcademicOptions: () => ({
    yearOptions: [
      { value: 'current-year', label: '2026–2027' },
      { value: 'target-year', label: '2027–2028' },
    ],
    isLoading: false,
  }),
}));

vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

function setup() {
  const onClose = vi.fn();
  const store = configureStore({ reducer: { confirmPopup: confirmPopupReducer } });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <RefundPolicyCloneDialog
          onClose={onClose}
          policy={
            {
              id: 'policy-id',
              policyName: 'Tuition refunds',
              academicYearId: 'current-year',
            } as IFinancePolicyRow
          }
        />
      </ThemeProvider>
    </Provider>
  );
  return onClose;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('clones to the selected academic year and confirms the saved policy', async () => {
  clone.mockReturnValue({ unwrap: async () => ({ policyName: 'Tuition refunds Copy' }) });
  const onClose = setup();

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Target academic year' }));
  fireEvent.click(screen.getByRole('option', { name: '2027–2028' }));
  fireEvent.click(screen.getByRole('button', { name: 'Clone' }));

  expect(clone).toHaveBeenCalledWith({
    id: 'policy-id',
    body: { targetAcademicYearId: 'target-year' },
  });
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(success).toHaveBeenCalledWith({
    message: '“Tuition refunds Copy” was created in 2027–2028.',
  });
});

it('keeps the confirmation open and shows the API guidance after a rejected clone', async () => {
  clone.mockReturnValue({
    unwrap: async () =>
      Promise.reject({
        status: 400,
        data: { error: { message: 'Select fee heads from the target academic year.' } },
      }),
  });
  const onClose = setup();

  fireEvent.click(screen.getByRole('button', { name: 'Clone' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Select fee heads from the target academic year.'
  );
  expect(onClose).not.toHaveBeenCalled();
  expect(success).not.toHaveBeenCalled();
});
