import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { render, screen, within, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionCycleDialog } from './admission-cycle-dialog';

import type { AdmissionCycleDialogProps } from './admission-cycle-dialog';

['mdi:information-outline', 'basil:cross-solid', 'material-symbols-light:save'].forEach((name) => {
  addIcon(name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});

const academicYear = {
  id: 'year-1',
  name: '2026-2027',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  creationTime: '2026-01-01T00:00:00Z',
  creatorId: 'user-1',
  lastModificationTime: '2026-01-01T00:00:00Z',
  lastModifierId: 'user-1',
};

const editingCycle = {
  id: 'cycle-1',
  name: 'Rolling Admissions 2026–27',
  code: 'ROLLING_2627',
  description: 'Rolling intake',
  academicYearId: academicYear.id,
  academicYearName: academicYear.name,
  startDate: '2026-09-17T00:00:00+05:30',
  endDate: '2027-03-31T00:00:00+05:30',
  status: 0 as const,
  windowStatus: 1 as const,
  isAcceptingApplications: true,
  linkedOfferingCount: 0,
  activeOfferingCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'stamp-1',
};

describe('admission cycle dialog', () => {
  it('keeps typed date sections and explains why a past date is unavailable', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-22T06:00:00Z'));
    try {
      const user = userEvent.setup();
      renderDateDialog();
      const opening = within(screen.getByRole('group', { name: 'Applications open' }));
      await user.type(opening.getByRole('spinbutton', { name: 'Day' }), '21');
      await user.type(opening.getByRole('spinbutton', { name: 'Month' }), '11');
      await user.type(opening.getByRole('spinbutton', { name: 'Year' }), '2026');
      expect(await screen.findByText('Choose a date on or after 22/11/2026.')).toBeVisible();
    } finally {
      vi.useRealTimers();
    }
  });

  it('uses inline required validation and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderDateDialog({ onSave });
    const name = screen.getByRole('textbox', { name: 'Cycle name' });

    expect(name.closest('form')).toHaveAttribute('novalidate');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Cycle name is required')).toBeVisible();
    await waitFor(() => expect(name).toHaveFocus());
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows a duplicate name on the edit field and keeps the draft available for correction', async () => {
    const user = userEvent.setup();
    const onSave = vi
      .fn()
      .mockRejectedValueOnce({ data: { error: { code: 'Admissions.CycleNameAlreadyExists' } } })
      .mockResolvedValueOnce(undefined);
    const onClose = vi.fn();
    renderDateDialog({ editingCycle, onSave, onClose });

    const name = screen.getByRole('textbox', { name: 'Cycle name' });
    await user.clear(name);
    await user.type(name, 'TEST ONE');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const message = 'An admission cycle with this name already exists. Enter a different name.';
    expect(await screen.findByText(message)).toBeVisible();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription(message);
    expect(name).toHaveValue('TEST ONE');
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
      editingCycle.description
    );
    expect(onClose).not.toHaveBeenCalled();

    await user.clear(name);
    await user.type(name, 'New intake period');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'New intake period' }));
  });

  it.each(['Applications open', 'Applications close'])(
    'excludes previous calendar years from the %s picker',
    async (label) => {
      const user = userEvent.setup();
      renderDateDialog();
      await user.click(screen.getByRole('group', { name: label }).querySelector('button')!);
      await user.click(screen.getByRole('button', { name: 'Choose month' }));
      expect(screen.getByRole('radio', { name: 'December' })).toBeEnabled();
      await user.click(screen.getByRole('button', { name: 'Choose year' }));
      expect(screen.queryByRole('radio', { name: '2025' })).not.toBeInTheDocument();
      expect(screen.getByRole('radio', { name: '2026' })).toBeEnabled();
      expect(screen.getByRole('radio', { name: '2027' })).toBeEnabled();
    }
  );
  it('keeps guidance available without inline helper text', async () => {
    const user = userEvent.setup();
    const store = configureStore({ reducer: { confirmPopup } });

    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AdmissionCycleDialog
              open
              academicYearId={academicYear.id}
              academicYears={[academicYear]}
              academicYearsLoading={false}
              academicYearsError={false}
              saving={false}
              onSave={vi.fn()}
              onClose={vi.fn()}
            />
          </LocalizationProvider>
        </ThemeProvider>
      </Provider>
    );

    expect(
      screen.queryByText('Uppercase letters, numbers, hyphen and underscore')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveAttribute(
      'placeholder',
      'Internal purpose or audience, e.g. Nursery to Grade 9'
    );

    await user.click(screen.getByRole('button', { name: 'Admission cycle information' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Save the cycle as a draft first.'
    );

    expect(screen.queryByRole('textbox', { name: 'Cycle code' })).not.toBeInTheDocument();
  });

  it('closes directly after a successful save without showing the discard warning', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const store = configureStore({ reducer: { confirmPopup } });

    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AdmissionCycleDialog
              open
              academicYearId={academicYear.id}
              academicYears={[academicYear]}
              academicYearsLoading={false}
              academicYearsError={false}
              editingCycle={editingCycle}
              saving={false}
              onSave={onSave}
              onClose={onClose}
            />
          </LocalizationProvider>
        </ThemeProvider>
      </Provider>
    );

    await user.clear(screen.getByRole('textbox', { name: 'Cycle name' }));
    await user.type(screen.getByRole('textbox', { name: 'Cycle name' }), 'Updated cycle');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'Updated cycle',
      code: editingCycle.code,
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(
      screen.queryByRole('dialog', { name: 'Discard Unsaved Changes?' })
    ).not.toBeInTheDocument();
  });
});

function renderDateDialog(overrides: Partial<AdmissionCycleDialogProps> = {}) {
  return render(
    <Provider store={configureStore({ reducer: { confirmPopup } })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AdmissionCycleDialog
            open
            academicYearId={academicYear.id}
            academicYears={[academicYear]}
            academicYearsLoading={false}
            academicYearsError={false}
            saving={false}
            onSave={vi.fn()}
            onClose={vi.fn()}
            {...overrides}
          />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}
