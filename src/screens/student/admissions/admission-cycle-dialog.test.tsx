import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { render, screen, waitFor } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionCycleDialog } from './admission-cycle-dialog';

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
    expect(screen.getByRole('textbox', { name: 'Description (optional)' })).toHaveAttribute(
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
    await user.click(screen.getByRole('button', { name: 'Save as draft' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'Updated cycle',
      code: editingCycle.code,
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(
      screen.queryByRole('dialog', { name: 'Discard unsaved changes?' })
    ).not.toBeInTheDocument();
  });
});
