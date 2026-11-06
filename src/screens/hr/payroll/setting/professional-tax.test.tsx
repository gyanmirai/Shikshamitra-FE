import { vi, it, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { HrSetupEditorContext } from 'src/screens/hr/setup/hr-setup-editor-context';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { ProfessionalTaxForm } from './professional-tax';

const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: any) => currentQueryAndMutation(),
}));
vi.mock('src/redux/ProfessionalTax/ProfessionalTaxApi', () => ({
  useAddProfessionalTaxMutation: () => [mocks.create, { isLoading: false }],
  useUpdateProfessionalTaxMutation: () => [vi.fn(), { isLoading: false }],
  useGetProfessionalTaxQuery: vi.fn(),
  useDeleteProfessionalTaxMutation: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('retains the wizard save contract, precise decimal amounts and failed draft', async () => {
  const report = vi.fn();
  const close = vi.fn();
  let reject!: (error: unknown) => void;
  mocks.create.mockReturnValueOnce({
    unwrap: () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  });
  mocks.create.mockReturnValueOnce({ unwrap: () => Promise.resolve({}) });
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <HrSetupEditorContext.Provider value={report}>
        <ProfessionalTaxForm editData={null} handleClose={close} />
      </HrSetupEditorContext.Provider>
    </ThemeProvider>
  );
  expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('From salary', { exact: false }), {
    target: { value: '12000.25' },
  });
  fireEvent.change(screen.getByLabelText('Tax amount', { exact: false }), {
    target: { value: '200.50' },
  });
  await waitFor(() => expect(report.mock.lastCall?.[0].dirty).toBe(true));
  // The wizard invokes the reported save; there is no nested footer or competing save.
  act(() => {
    report.mock.lastCall?.[0].save();
  });
  await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
  expect(mocks.create.mock.calls[0][0]).toMatchObject({
    fromSalary: 12000.25,
    toSalary: null,
    taxAmount: 200.5,
  });
  await waitFor(() => expect(report.mock.lastCall?.[0].busy).toBe(true));
  expect(screen.getByLabelText('From salary', { exact: false })).toBeDisabled();
  await act(async () => reject({ data: { error: { message: 'Review this range.' } } }));
  await waitFor(() => expect(report.mock.lastCall?.[0].busy).toBe(false));
  expect(screen.getByRole('alert')).toHaveTextContent('Review this range.');
  expect(screen.getByLabelText('From salary', { exact: false })).toHaveValue('₹ 12,000.25');
  expect(close).not.toHaveBeenCalled();
  await act(async () => report.mock.lastCall?.[0].save());
  expect(close).toHaveBeenCalledWith(true);
  expect(mocks.create.mock.calls[1][0]).toEqual(mocks.create.mock.calls[0][0]);
});
