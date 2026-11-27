import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { GlobalIcons } from 'src/utils/icons';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { shikshaMitraToast } from 'src/components/toast';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { defaultNumbering } from './admission-numbering-model';
import { AdmissionNumberingFormDrawer } from './admission-numbering-dialog';

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
  GlobalIcons.delete,
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
function setup(overrides: Partial<React.ComponentProps<typeof AdmissionNumberingFormDrawer>> = {}) {
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
        <AdmissionNumberingFormDrawer {...props} />
      </ThemeProvider>
    </Provider>
  );
  return { ...props, user: userEvent.setup() };
}
describe('application numbering dialog', () => {
  it('previews and confirms a simple new series using the next available number', async () => {
    const onPreview = vi.fn(async () => ({
      nextNumber: '004',
      nextSequence: 4,
      startingNumberUnavailable: true,
    }));
    const { user, onSave } = setup({
      onPreview,
      settings: { ...settings, isConfigured: true, sequenceLocked: true },
    });
    await user.click(screen.getByRole('radio', { name: /Simple Number/ }));
    await waitFor(() =>
      expect(onPreview).toHaveBeenLastCalledWith(
        expect.objectContaining({
          prefix: '',
          yearFormat: 0,
          resetPolicy: 0,
          startingNumber: 1,
          digits: 3,
          beginNewSeries: true,
        })
      )
    );
    expect(await screen.findByText('004')).toBeVisible();
    expect(screen.getByText(/starting number is already in use/i)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Review Change' }));
    expect(await screen.findByText(/Next available number now: 004/)).toBeVisible();
    expect(
      screen.getByText(/Current format: Prefix: DDVS · Year: Academic year · Digits: 5/)
    ).toBeVisible();
    expect(screen.getByText(/New format: Prefix: None · Year: No year · Digits: 3/)).toBeVisible();
    expect(onSave).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Confirm Change' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          prefix: '',
          yearFormat: 0,
          resetPolicy: 0,
          startingNumber: 1,
          digits: 3,
          beginNewSeries: true,
        })
      )
    );
  });

  it('selects academic year and school prefix presets and preserves existing custom settings until selected', async () => {
    const { user, onPreview } = setup({ settings: { ...settings, isConfigured: true } });
    expect(screen.getByRole('radio', { name: /Custom/ })).toBeChecked();
    expect(screen.getByLabelText('Prefix')).toHaveValue('DDVS');
    await user.click(screen.getByRole('radio', { name: /Academic Year/ }));
    await waitFor(() =>
      expect(onPreview).toHaveBeenLastCalledWith(
        expect.objectContaining({
          prefix: '',
          yearFormat: 2,
          resetPolicy: 2,
          separator: '/',
          beginNewSeries: true,
        })
      )
    );
    await user.click(screen.getByRole('radio', { name: /School Prefix/ }));
    expect(screen.getByLabelText('Prefix *')).toHaveValue('DDVS');
    await waitFor(() =>
      expect(onPreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ prefix: 'DDVS', yearFormat: 0, resetPolicy: 0, beginNewSeries: true })
      )
    );
  });

  it('shows a format example while a school prefix is missing, then previews the entered prefix', async () => {
    const { user, onPreview, onSave } = setup({ settings: { ...settings, prefix: '' } });
    await user.click(screen.getByRole('radio', { name: /School Prefix/ }));
    expect(screen.getByText('Format Example')).toBeVisible();
    expect(screen.getByText('PREFIX-001')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Refresh Preview' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Review Change' }));
    expect(await screen.findByText('Enter a school prefix.')).toBeVisible();
    expect(onSave).not.toHaveBeenCalled();
    expect(onPreview).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Prefix *'), 'EMS');
    await waitFor(() =>
      expect(onPreview).toHaveBeenLastCalledWith(
        expect.objectContaining({
          prefix: 'EMS',
          yearFormat: 0,
          resetPolicy: 0,
          beginNewSeries: true,
        })
      )
    );
    await user.click(screen.getByRole('radio', { name: /Simple Number/ }));
    await user.click(screen.getByRole('radio', { name: /School Prefix/ }));
    expect(screen.getByLabelText('Prefix *')).toHaveValue('EMS');
  });
  it('keeps the school-wide scope guidance in the heading information', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Application Numbering information' })).toBeVisible();
    expect(screen.queryByText('All Admission Offerings')).not.toBeInTheDocument();
  });

  it.each([
    ['Academic Year Wise', 2],
    ['Calendar Year Wise', 1],
    ['Continuous Numbering', 0],
  ] as const)('sets a valid year/reset pair together for %s', async (label, cycle) => {
    const { user, onSave, onPreview } = setup({
      settings: { ...settings, yearFormat: 1, resetPolicy: 1 },
    });
    await user.click(screen.getByRole('combobox', { name: 'Numbering Cycle' }));
    await user.click(screen.getByRole('option', { name: label }));
    expect(screen.queryByRole('combobox', { name: 'Reset counter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Year format' })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(onPreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ yearFormat: cycle, resetPolicy: cycle })
      )
    );
    await user.click(screen.getByRole('button', { name: 'Review Change' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm Change' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          yearFormat: cycle,
          resetPolicy: cycle,
          expectedVersion: settings.expectedVersion,
        })
      )
    );
  });

  it('preserves a saved continuous counter with a year and only changes the advanced year explicitly', async () => {
    const { user, onSave, onPreview } = setup({
      settings: { ...settings, resetPolicy: 0, yearFormat: 2, sequenceLocked: true },
    });
    expect(screen.getByRole('combobox', { name: 'Numbering Cycle' })).toHaveTextContent(
      'Continuous Numbering'
    );
    expect(screen.getByRole('combobox', { name: 'Year in Number' })).toHaveTextContent(
      'Academic Year'
    );
    await waitFor(() =>
      expect(onPreview).toHaveBeenLastCalledWith(
        expect.objectContaining({ yearFormat: 2, resetPolicy: 0 })
      )
    );
    expect(onSave).not.toHaveBeenCalled();
    await user.click(screen.getByRole('combobox', { name: 'Year in Number' }));
    await user.click(screen.getByRole('option', { name: 'No Year' }));
    await user.click(screen.getByRole('button', { name: 'Review Change' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm Change' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ yearFormat: 0, resetPolicy: 0 })
      )
    );
  });

  it('allows existing schools to change the cycle and starting number', async () => {
    const { user, onSave } = setup({ settings: { ...settings, sequenceLocked: true } });
    expect(screen.getByRole('combobox', { name: 'Numbering Cycle' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByLabelText('Starting Number *')).toBeEnabled();
    expect(screen.getByLabelText('Prefix')).toBeEnabled();
    await user.type(screen.getByLabelText('Prefix'), 'X');
    await user.click(screen.getByRole('button', { name: 'Review Change' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm Change' }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          prefix: 'DDVSX',
          resetPolicy: 2,
          yearFormat: 2,
          startingNumber: 1,
          beginNewSeries: true,
        })
      )
    );
  });

  it('does not change the draft merely by expanding advanced settings', async () => {
    const { user, onSave } = setup({
      settings: { ...settings, resetPolicy: 0, yearFormat: 0, isConfigured: true },
    });
    const expand = screen.getByRole('button', { name: 'Expand Advanced Settings' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    await user.click(expand);
    expect(screen.getByRole('button', { name: 'Collapse Advanced Settings' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('combobox', { name: 'Year in Number' })).toHaveTextContent('No Year');
    expect(screen.getByRole('button', { name: 'Review Change' })).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows the actual server next number, with no manual number entry', async () => {
    const { onPreview } = setup();
    expect(screen.getByRole('dialog', { name: 'Application Numbering' })).toBeVisible();
    expect(await screen.findByText('DDVS/2026-27/00051')).toBeVisible();
    expect(onPreview).toHaveBeenCalledWith(
      expect.objectContaining({ academicYearId: year.id, startingNumber: 1, prefix: 'DDVS' })
    );
    expect(screen.queryByText('All Admission Offerings')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Application Number')).not.toBeInTheDocument();
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
      await user.clear(screen.getByLabelText('Starting Number *'));
      await user.click(screen.getByRole('button', { name: 'Review Change' }));
      expect(await screen.findByText('Starting number is required')).toBeVisible();
      await waitFor(() => expect(screen.getByLabelText('Starting Number *')).toHaveFocus());
      expect(onSave).not.toHaveBeenCalled();
      fireEvent.change(screen.getByLabelText('Starting Number *'), { target: { value: '12' } });
      fireEvent.change(screen.getByLabelText('Prefix'), { target: { value: ' school ' } });
      await user.click(screen.getByRole('button', { name: 'Review Change' }));
      await user.click(await screen.findByRole('button', { name: 'Confirm Change' }));
      expect(await screen.findByText('Settings changed in another session')).toBeVisible();
      expect(screen.getByLabelText('Starting Number *')).toHaveValue('12');
      await user.click(screen.getByRole('button', { name: 'Review Change' }));
      await user.click(await screen.findByRole('button', { name: 'Confirm Change' }));
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
    const submit = screen.getByRole('button', { name: 'Review Change' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm Change' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Change' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await act(async () => finish(settings));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
  it('preserves view-only permission restrictions', () => {
    setup({ canEdit: false, settings: { ...settings, sequenceLocked: true } });
    expect(screen.getByLabelText('Starting Number *')).toBeDisabled();
    expect(screen.getByLabelText('Prefix')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Review Change' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Number Format information' })).toBeEnabled();
  });
  it('avoids an unchanged save for an already configured rule', async () => {
    const { user, onSave } = setup({ settings: { ...settings, isConfigured: true } });
    expect(screen.getByRole('button', { name: 'Review Change' })).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Prefix'), 'X');
    expect(screen.getByRole('button', { name: 'Review Change' })).toBeEnabled();
  });
  it('does not begin a new series for prefix edits that normalize to the saved value', async () => {
    const { onPreview } = setup({ settings: { ...settings, isConfigured: true } });
    fireEvent.change(screen.getByLabelText('Prefix'), { target: { value: ' ddvs ' } });
    expect(screen.getByRole('button', { name: 'Review Change' })).toBeDisabled();
    await waitFor(() =>
      expect(onPreview).toHaveBeenLastCalledWith(
        expect.objectContaining({
          prefix: 'DDVS',
          beginNewSeries: false,
        })
      )
    );
  });
  it('confirms discarding unsaved work', async () => {
    const { user, onClose } = setup();
    await user.type(screen.getByLabelText('Prefix'), 'X');
    await user.click(screen.getByRole('button', { name: 'Close Application Numbering' }));
    expect(screen.getByText('Discard Unsaved Changes?')).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it('offers retry after load failure and does not enable submission', async () => {
    const { user, onRetry } = setup({ settings: undefined, loadError: true });
    expect(screen.getByRole('button', { name: 'Review Change' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    render(<div role="alert">{vi.mocked(shikshaMitraToast.error).mock.lastCall![0].message}</div>);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load numbering settings.');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
