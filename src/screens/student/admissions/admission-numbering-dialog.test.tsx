import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { GlobalIcons } from 'src/utils/icons';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { defaultNumbering } from './admission-numbering-model';
import { AdmissionNumberingFormDialog } from './admission-numbering-dialog';

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
[
  GlobalIcons.doc,
  GlobalIcons.scheduledReport,
  GlobalIcons.eye,
  GlobalIcons.submit,
  GlobalIcons.cancel,
  GlobalIcons.info,
].forEach((name) => addIcon(name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 }));
const settings = {
  ...defaultNumbering,
  prefix: 'DDVS',
  separator: '/',
  yearFormat: 2 as const,
  resetPolicy: 2 as const,
  digits: 5,
};
const year = {
  id: 'year',
  name: '2026-2027',
  startDate: '2026-06-01',
  endDate: '2027-03-31',
  creationTime: '',
  creatorId: '',
  lastModificationTime: '',
  lastModifierId: '',
};
function setup(overrides: Partial<React.ComponentProps<typeof AdmissionNumberingFormDialog>> = {}) {
  const props = {
    onClose: vi.fn(),
    onSave: vi.fn(async () => settings),
    onPreview: vi.fn(async () => ({ nextNumber: 'DDVS/2026-27/00051', nextSequence: 51 })),
    settings,
    canEdit: true,
    academicYear: year,
    loading: false,
    loadError: false,
    onRetry: vi.fn(),
    ...overrides,
  };
  const store = configureStore({ reducer: { confirmPopup } });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionNumberingFormDialog {...props} />
      </ThemeProvider>
    </Provider>
  );
  return { ...props, user: userEvent.setup() };
}
describe('application numbering dialog', () => {
  it('shows the actual server next number, with no manual number entry', async () => {
    const { onPreview } = setup();
    expect(screen.getByRole('dialog', { name: 'Application Numbering' })).toBeVisible();
    expect(await screen.findByText('DDVS/2026-27/00051')).toBeVisible();
    expect(onPreview).toHaveBeenCalledWith(
      expect.objectContaining({ academicYearId: year.id, startingNumber: 1, prefix: 'DDVS' })
    );
    expect(screen.getByText('All admission offerings')).toBeVisible();
    expect(screen.queryByLabelText('Application number')).not.toBeInTheDocument();
  });
  it(
    'validates before saving and retains values after a server failure for retry',
    { timeout: 20000 },
    async () => {
      const onSave = vi
        .fn()
        .mockRejectedValueOnce({ data: { detail: 'Settings changed in another session' } })
        .mockResolvedValue(settings);
      const { user, onClose } = setup({ onSave });
      await user.clear(screen.getByLabelText('Starting number *'));
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(await screen.findByText('Starting number is required')).toBeVisible();
      await waitFor(() => expect(screen.getByLabelText('Starting number *')).toHaveFocus());
      expect(onSave).not.toHaveBeenCalled();
      fireEvent.change(screen.getByLabelText('Starting number *'), { target: { value: '12' } });
      fireEvent.change(screen.getByLabelText('Prefix *'), { target: { value: ' school ' } });
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(await screen.findByText('Settings changed in another session')).toBeVisible();
      expect(screen.getByLabelText('Starting number *')).toHaveValue('12');
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
      expect(onSave).toHaveBeenLastCalledWith(
        expect.objectContaining({ prefix: 'SCHOOL', startingNumber: 12, expectedVersion: 0 })
      );
    }
  );
  it('locks duplicate submits, edits and closing while saving', async () => {
    let finish!: (value: typeof settings) => void;
    const onSave = vi.fn(
      () =>
        new Promise<typeof settings>((resolve) => {
          finish = resolve;
        })
    );
    const { onClose } = setup({ onSave });
    const submit = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    expect(screen.getByLabelText('Prefix *')).toBeDisabled();
    await act(async () => finish(settings));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
  it('preserves existing permission and issued-counter restrictions', () => {
    setup({ canEdit: false, settings: { ...settings, sequenceLocked: true } });
    expect(screen.getByLabelText('Starting number *')).toBeDisabled();
    expect(screen.getByLabelText('Prefix *')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Number Format information' })).toBeEnabled();
  });
  it('avoids an unchanged save for an already configured rule', async () => {
    const { user, onSave } = setup({ settings: { ...settings, isConfigured: true } });
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Prefix *'), 'X');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
  it('confirms discarding unsaved work', async () => {
    const { user, onClose } = setup();
    await user.type(screen.getByLabelText('Prefix *'), 'X');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('Discard unsaved changes?')).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it('offers retry after load failure and does not enable submission', async () => {
    const { user, onRetry } = setup({ settings: undefined, loadError: true });
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
